# Папка Scripts для n8n Workflows

Эта папка содержит JavaScript файлы с кодом для использования в n8n Code Nodes.

## Файлы скриптов

### 02_master_registration_code.js
**Назначение:** Обработка данных веб-регистрации мастеров
**Workflow:** 02_master_registration.md
**Использование:**
1. В n8n Code Node нажмите "Load from File"
2. Выберите файл: `02_master_registration_code.js`
3. Или скопируйте содержимое файла в поле Code

**Функции:**
- Разбор ISO timestamp на компоненты (дата, месяц, день, время, год)
- Нормализация WhatsApp номера (удаление +, очистка от не-цифровых символов)
- Создание ID мастера в формате `mid_wa_{нормализованный_номер}`
- Преобразование массива специализаций в булевы поля (`spec_elektrik: true/false`)
- Рабочие дни приходят уже в булевом формате из вебхука (`work_mo: true/false`)

**Входные данные:**
```json
{
  "body": {
    "whatsapp": "+49123456789",
    "timestamp": "2026-01-12T13:41:31.853Z",
    "specializations": ["elektrik", "sanitaer"],
    "work_mo": true,
    "work_di": true,
    "work_mi": true,
    "work_do": true,
    "work_fr": true,
    "work_sa": false,
    "work_so": false,
    // ... другие поля формы
  }
}
```

**Выходные данные:**
```json
{
  "body": {
    "whatsapp": "+49123456789",
    "timestamp": "2026-01-12T13:41:31.853Z",
    "specializations": ["elektrik", "sanitaer"],
    "work_mo": true,
    "work_di": true,
    "work_mi": true,
    "work_do": true,
    "work_fr": true,
    "work_sa": false,
    "work_so": false,
    "workingHours": {"start": "08:00", "end": "18:00"},
    "serviceArea": "10115, 10117",
    // Новые поля timestamp:
    "registration_date": "2026-01-12",
    "registration_month": 1,
    "registration_day": 12,
    "registration_time": "13:41:31",
    "registration_year": 2026,
    // Новые поля WhatsApp:
    "wa_norm": "49123456789",
    "master_id": "mid_wa_49123456789",
    // Новые поля специализаций (для таблицы master_settings):
    "spec_elektrik": true,
    "spec_sanitaer": true,
    "spec_heizung": false,
    "spec_maler": false,
    "spec_elektriker": false,
    "spec_klempner": false,
    "spec_schlosser": false,
    "spec_garten": false,
    "spec_reinigung": false,
    "spec_other": false,
    // Рабочие дни уже в булевом формате (для таблицы master_settings):
    "work_mo": true,
    "work_di": true,
    "work_mi": true,
    "work_do": true,
    "work_fr": true,
    "work_sa": false,
    "work_so": false,
    // ... остальные поля формы
  }
}
```

**Результат в базе данных:**
- **`masters`**: базовая информация о мастере
- **`master_settings`**: расширенные настройки (график по дням, специализации, зоны)
- **`master_status`**: состояние диалога для маршрутизации

**Структура master_settings:**
- **Рабочие дни:** work_mo, work_di, work_mi, work_do, work_fr, work_sa, work_so (boolean)
- **Время работы:** work_start_mo, work_end_mo, work_start_di, work_end_di, etc. (time)
- **Специализации:** spec_elektrik, spec_sanitaer, spec_heizung, etc. (boolean)
- **Зона:** service_area (text)

**Преимущества булевого формата:**
- **Простая фильтрация:** `WHERE spec_elektrik = true AND work_mo = true`
- **Быстрые запросы:** Индексы на булевых полях работают эффективнее
- **Универсальный формат:** Все дни недели и специализации всегда присутствуют
- **Масштабируемость:** Легко добавить новые специализации или дни
- **Оптимизация:** Рабочие дни приходят уже готовыми из вебхука

## Правила разработки

1. **Комментарии:** Каждый файл должен иметь подробные комментарии
2. **Конфигурация:** Использовать объект CONFIG для настройки
3. **Обработка ошибок:** Все функции должны иметь try-catch блоки
4. **Тестирование:** Проверять синтаксис с помощью `node -c filename.js`
5. **Документация:** Обновлять этот README при добавлении новых файлов

## Добавление нового скрипта

1. Создайте файл `XX_workflow_name_code.js`
2. Добавьте описание в этот README
3. Обновите соответствующий workflow документ
4. Проверьте синтаксис: `node -c filename.js`
