# n8n Workflow 1: Router (Main Entry Point)

**Назначение:** Единая точка входа для всех сообщений WhatsApp. Определяет, кто пишет (Новичок/Клиент/Мастер) и в каком контексте (Свободен/Отвечает на вопрос).

---

## Структура Workflow

### 1. Webhook (Trigger)
*   **Method:** `POST`
*   **Path:** `/webhook/whatsapp`
*   **Authentication:** Basic Auth (рекомендуется) или Header Auth (проверка подписи Twilio, для MVP можно пропустить).
*   **Data needed:** `From` (Phone), `Body` (Text), `MediaUrl0` (Photo), `Latitude` (Location).

### 2. Normalization (Code/Edit Fields)
*   Привести телефон к единому формату (убрать `whatsapp:` префикс, оставить только цифры, напр. `+49...`).
*   Если есть медиа, сохранить ссылку в переменную `media_url`.

### 3. State Check (Supabase: Select)
*   **Query:** `SELECT * FROM bot_states WHERE user_phone = $phone`
*   **Logic:**
    *   *Empty?* -> Значит, пишет впервые (или состояние удалено). -> Ветка **"Init State"**.
    *   *Found?* -> Берем `state` и `context`. -> Ветка **"Router"**.

---

## Ветка "Init State" (Первый контакт)

1.  **Supabase: Insert**
    *   Создать запись в `bot_states`:
        *   `user_phone`: $phone
        *   `state`: `start`
        *   `context`: `{}`
2.  **Pass Through:** Передать управление в "Router" (как будто состояние `start`).

---

## Ветка "Router" (Логика переключения)

Используем ноду **Switch** (по значению `state`).

### Case 1: `state` = 'start' (Свободный режим)
*Пользователь ничего не ждет, просто пишет.*
1.  **AI Classifier (OpenAI Node):**
    *   *Prompt:* "Это сообщение: 1. Новая заявка? 2. Приветствие? 3. Вопрос?"
2.  **Switch (AI Result):**
    *   *Заявка/Фото:* -> **Execute Workflow "02_Process_Request"**.
    *   *Приветствие:* -> Twilio: "Привет! Пришлите фото проблемы."
    *   *Вопрос:* -> AI Chat Response (простой ответ).

### Case 2: `state` = 'waiting_for_address'
*Мы спрашивали адрес, юзер ответил текстом или геолокацией.*
1.  **Update Context:** Записать текст/координаты в `bot_states.context`.
2.  **Logic:** Проверить валидность.
3.  **Execute Workflow "02_Process_Request" (Step: Address Confirm)**.

### Case 3: `state` = 'waiting_for_job_accept' (Мастер)
*Мастеру пришла заявка, он пишет ответ.*
1.  **Check Text:** Если текст "Принять" или "1" или "+" -> **Execute Workflow "03_Assign_Job"**.
2.  Иначе -> Игнорировать или "Нажмите кнопку Принять".

---

## Выходные данные (Output)

Этот Workflow **не возвращает ответ** Webhook'у (Twilio ждет пустой 200 OK или TwiML).
Все ответы пользователю отправляются через ноду **Twilio** внутри вызываемых Sub-Workflows.

## Переменные окружения (Environment Variables)

Для работы понадобятся:
*   `SUPABASE_URL`
*   `SUPABASE_KEY` (Service Role)
*   `OPENAI_API_KEY`
*   `TWILIO_ACCOUNT_SID`
*   `TWILIO_AUTH_TOKEN`

