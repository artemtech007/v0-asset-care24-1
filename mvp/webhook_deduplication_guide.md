# Руководство по дедупликации вебхуков Twilio (упрощенное)

## 🎯 Проблема

Twilio отправляет сообщения WhatsApp **2-3 раза** - это нормально для их инфраструктуры.

## 🔧 Решение: Простой EXISTS запрос

### Структура таблицы (MVP версия)
```sql
CREATE TABLE processed_messages (
    message_sid text PRIMARY KEY,              -- MessageSid от Twilio
    processed_at timestamptz DEFAULT now()     -- Время первой обработки
);
```

### Логика дедупликации в n8n (рекомендуемый способ)

#### 1. Извлечь MessageSid из данных
```javascript
// Function Node: Extract MessageSid
function extractMessageSid(data) {
  // SMS Webhook формат
  if (data.SmsMessageSid) return data.SmsMessageSid;

  // Event Streams формат
  if (data.data && data.data.messageSid) return data.data.messageSid;

  return null;
}

const messageSid = extractMessageSid($json);
return { messageSid };
```

#### 2. Проверить EXISTS (Postgres Node)
```sql
-- Query: Check if message already processed
SELECT EXISTS(
    SELECT 1 FROM processed_messages
    WHERE message_sid = '{{ $json.messageSid }}'
) as already_processed;
```

#### 3. Вставить при первой обработке (Postgres Node)
```sql
-- Query: Mark as processed (только если не дубликат)
INSERT INTO processed_messages (message_sid)
VALUES ('{{ $json.messageSid }}')
ON CONFLICT (message_sid) DO NOTHING;
```

#### 4. Маршрутизация (Switch Node)
```
- already_processed = true → Пропустить (дубликат)
- already_processed = false → Обработать дальше
```

## 📊 Зачем разделение на 'sms_webhook' и 'event_streams'?

**Ответ:** Для MVP - НЕ НУЖНО! 

Разделение нужно только если:
- Вы анализируете надежность разных форматов
- Хотите A/B тестирование вебхуков
- Планируете постепенный переход с SMS на Event Streams

Для MVP достаточно проверять только по `message_sid` - он одинаковый в обоих форматах.

## 🚀 Будущее: Redis для дедупликации

```javascript
// Для продакшена лучше Redis с TTL=1час
const redis = require('redis');
const client = redis.createClient();

// Проверить и установить с TTL
const isDuplicate = await client.exists(`msg:${messageSid}`);
if (!isDuplicate) {
  await client.setex(`msg:${messageSid}`, 3600, '1'); // 1 час TTL
}
```

## ✅ Простая реализация для MVP

1. **Создать таблицу** `processed_messages` (message_sid PRIMARY KEY)
2. **Добавить Postgres Node** с `EXISTS` запросом в начало workflow
3. **Добавить Switch Node** для маршрутизации
4. **Добавить INSERT** после успешной обработки

Готово! 🎉

## 📊 Мониторинг дубликатов

### Проверка количества дубликатов
```sql
SELECT
  source,
  COUNT(*) as total_messages,
  AVG(duplicate_count) as avg_duplicates,
  MAX(duplicate_count) as max_duplicates
FROM processed_messages
GROUP BY source;
```

### Очистка старых записей (старше 30 дней)
```sql
DELETE FROM processed_messages
WHERE processed_at < now() - interval '30 days';
```

## 🔍 Отладка

### Просмотр последних сообщений
```sql
SELECT
  message_sid,
  source,
  processed_at,
  duplicate_count,
  webhook_data->>'Body' as message_body
FROM processed_messages
ORDER BY processed_at DESC
LIMIT 10;
```

### Статистика по дням
```sql
SELECT
  DATE(processed_at) as date,
  source,
  COUNT(*) as messages,
  SUM(duplicate_count - 1) as duplicates
FROM processed_messages
GROUP BY DATE(processed_at), source
ORDER BY date DESC;
```

## ⚡ Рекомендации

1. **Всегда проверяйте дедупликацию** в начале workflow
2. **Логируйте дубликаты** для мониторинга качества Twilio
3. **Очищайте таблицу** раз в месяц
4. **Используйте Event Streams** вместо SMS webhook (более надежный)
5. **Мониторьте статистику** дубликатов для выявления проблем

## 📞 Контакты

Если дубликаты продолжают приходить слишком часто - обратитесь в поддержку Twilio.
