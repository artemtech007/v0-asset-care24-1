# Сценарии автоматизации n8n (Workflows)

**Цель:** Описать логику обработки данных между WhatsApp (Twilio), OpenAI, Supabase и Telegram.

---

## Workflow 1: Входящее сообщение (Webhook Router)
*Единая точка входа для всех сообщений от Twilio с дедупликацией.*

**Trigger:** `Webhook (POST)` от Twilio.

**Важно:** Twilio отправляет сообщения 2-3 раза. Используем простую дедупликацию!

**Logic:**
1.  **Извлечь MessageSid:**
    ```javascript
    // Function Node: Extract MessageSid
    function extractMessageSid(data) {
      if (data.SmsMessageSid) return data.SmsMessageSid;
      if (data.data && data.data.messageSid) return data.data.messageSid;
      return null;
    }
    return { messageSid: extractMessageSid($json) };
    ```

2.  **Дедупликация (Postgres Node):**
    ```sql
    SELECT EXISTS(
        SELECT 1 FROM processed_messages
        WHERE message_sid = '{{ $json.messageSid }}'
    ) as already_processed;
    ```

3.  **Маршрутизация (Switch Node):**
    *   `already_processed = true` → **СТОП** (дубликат)
    *   `already_processed = false` → Продолжить обработку

4.  **Отметить как обработанное (Postgres Node):**
    ```sql
    INSERT INTO processed_messages (message_sid)
    VALUES ('{{ $json.messageSid }}')
    ON CONFLICT (message_sid) DO NOTHING;
    ```

5.  **Обработка данных (Function Node):**
    ```javascript
    // Function Node: Parse WA Data and R-Code
    function processWAData(data) {
      // 1. Копия оригинального JSON
      const result = { ...data };

      // 2. Обработка поля "from" -> wa_id_plus и wa_id
      if (data.From && typeof data.From === 'string') {
        // Из "whatsapp:+79196811458" получаем "+79196811458" и "79196811458"
        const phoneMatch = data.From.match(/whatsapp:\+(\d+)/);
        if (phoneMatch) {
          result.wa_id_plus = '+' + phoneMatch[1];  // "+79196811458"
          result.wa_id = phoneMatch[1];              // "79196811458"
        }
      }

      // 3. Обработка поля "body" - поиск R-кода
      result.has_code = false;

      if (data.Body && typeof data.Body === 'string') {
        // Ищем код между ||- и -|| (ровно 14 символов между ними)
        const codeRegex = /\|\|-(.+?)-\|\|/g;
        const matches = data.Body.match(codeRegex);

        if (matches && matches.length > 0) {
          // Берем первый найденный код
          const fullCode = matches[0]; // "||-R-WB-C-P-0000S-||"

          // Проверяем что между ||- и -|| ровно 14 символов
          const content = fullCode.slice(3, -3); // "R-WB-C-P-0000S"
          if (content.length === 14) {
            result.has_code = true;

            // Разбираем код на части
            const parts = content.split('-');
            if (parts.length === 5) {
              result.code_prefix = parts[0];      // "R"
              result.code_source = parts[1];      // "WB" или "QR"
              result.code_user_type = parts[2];  // "C" или "M"
              result.code_client_type = parts[3]; // "C", "P" или "0"
              result.code_value = parts[4];       // "0000S"
            }
          }
        }
      }

      return result;
    }

    // Обработка всех входящих items
    const items = $input.all();
    const results = items.map(item => ({
      json: processWAData(item.json)
    }));

    return results;
    ```

6.  **Финальная маршрутизация (Switch Node):**
    *   `has_code = true` → Process Request (с разобранным кодом)
    *   `has_code = false` → Fallback (спросить источник)
    *   *Медиа без текста* → Media Processing

---

## Workflow 2: Обработка заявки (Process Request)
*Главный мозг системы.*

**Вход:** Телефон, Текст/Медиа.
**Шаги:**
1.  **OpenAI (Speech-to-Text):** Если есть аудио, превратить в текст.
2.  **OpenAI (Analyze):**
    *   Промпт: "Проанализируй текст и фото. Определи: 1. Категорию (Сантехника/Электрика...) 2. Срочность 3. Есть ли адрес в тексте?".
    *   Output: JSON `{ "category": "plumbing", "urgency": "high", "address_detected": "no" }`.
3.  **Работа с Адресом:**
    *   Проверить таблицу `user_addresses` для этого юзера.
    *   *Вариант А:* Адресов нет -> Бот спрашивает: "Напишите адрес". (Сохраняем состояние диалога в Supabase/Redis).
    *   *Вариант Б:* Адрес один -> Используем его по умолчанию.
    *   *Вариант В:* Адресов > 1 -> Бот спрашивает: "Это на 'Дом' или 'Офис'?" (Кнопки).
4.  **Создание заявки (Supabase):**
    *   `INSERT INTO requests` (Status: new).
    *   Загрузка фото в MinIO (S3) -> `/requests/{id}/problem.jpg`.
    *   `INSERT INTO request_media`.
5.  **Уведомление (Telegram):**
    *   Отправить в группу мастеров сообщение с фото и кнопкой "Взять #{id}".
6.  **Ответ клиенту (WhatsApp):**
    *   "Заявка #{id} принята. Ищем мастера."

---

## Workflow 3: Назначение Мастера (Assign Job)
*Обработка реакции мастера.*

**Trigger:** Telegram Callback (нажатие кнопки "Взять") или Команда в чате.
**Шаги:**
1.  **Проверка:**
    *   Свободна ли заявка? (Status = `new`?).
    *   Кто нажал? (Есть ли этот TelegramID в таблице `users` с ролью `master/admin`?).
2.  **Назначение (Supabase):**
    *   `UPDATE requests SET master_id = {user_id}, status = 'assigned'`.
3.  **Уведомление Мастера (WhatsApp):**
    *   Отправить личное сообщение мастеру: "Вы назначены на заявку #{id}. Адрес: ... Клиент: ...".
    *   Прислать ссылку на Web-view ("Мои заказы").
4.  **Уведомление Клиента (WhatsApp):**
    *   "Мастер Иван назначен. Скоро свяжется."

---

## Workflow 4: Завершение работы (Job Done)
*Отчет мастера.*

**Trigger:** Web-view форма или команда в WhatsApp от мастера.
**Шаги:**
1.  **Получить данные:** Фото результата, Комментарий.
2.  **Сохранить (Supabase + MinIO):**
    *   Загрузить фото результата в S3.
    *   `UPDATE requests SET status = 'completed', completed_at = NOW()`.
3.  **Уведомление Клиента (WhatsApp):**
    *   "Работа выполнена! Вот фото результата. Пожалуйста, оцените работу (1-5)."
    *   Отправить кнопки (1, 2, 3, 4, 5).

---

## Workflow 5: Сбор отзывов (Feedback)
*Обработка оценки.*

**Trigger:** Нажатие кнопки клиентом.
**Шаги:**
1.  **Запись (Supabase):**
    *   `INSERT INTO reviews`.
2.  **Анализ (Optional):**
    *   Если оценка < 3 -> Алертить админу в Telegram "Недовольство!".
3.  **Финал:**
    *   Сгенерировать PDF счет (HTML to PDF) и отправить клиенту.

---

## Workflow 6: Регистрация мастеров (Registration_Handwerker)
*Обработка регистрации новых мастеров через веб-сайт.*

**Trigger:** Webhook POST от формы регистрации.
**Webhook URL:** `https://assetcare24.org/webhook/d509d181-13ab-4c34-b192-4b8994ec9e49`
**Test URL:** `https://assetcare24.org/webhook-test/d509d181-13ab-4c34-b192-4b8994ec9e49`

**Входные данные:**
```json
{
  "name": "string",
  "email": "string",
  "telefon": "string",
  "specializations": ["array of strings"],
  "workingHours": {"start": "HH:MM", "end": "HH:MM"},
  "workingDays": ["array of day codes"],
  "serviceArea": "string",
  "hasVehicle": boolean,
  "experience": "string",
  "qualifications": "string",
  "documents": ["array of file objects"],
  "agreeTerms": boolean,
  "agreeDataProcessing": boolean,
  "registrationType": "einzelhandwerker",
  "timestamp": "ISO string",
  "source": "website_registration"
}
```

**Шаги:**
1.  **Валидация данных:**
    *   Проверить обязательные поля (name, email, telefon, specializations, serviceArea)
    *   Проверить согласие с условиями (agreeTerms, agreeDataProcessing)

2.  **Создание пользователя (Supabase):**
    *   `INSERT INTO users` с role='master', sub_role='worker'
    *   Сгенерировать уникальный ID

3.  **Обработка специализаций:**
    *   Сохранить выбранные специализации в meta_data или отдельной таблице

4.  **Отправка подтверждения:**
    *   Отправить email с подтверждением регистрации
    *   Отправить SMS/WhatsApp с инструкциями

5.  **Уведомление администратора:**
    *   Отправить уведомление в Telegram о новой регистрации для верификации

