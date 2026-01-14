# Руководство по дедупликации вебхуков Twilio

## 🎯 Проблема

Twilio отправляет сообщения WhatsApp **2-3 раза**:
1. **SMS Webhook** (старый формат) - приходит первым
2. **Event Streams** (новый Cloud Events формат) - может приходить 1-2 раза

Это приводит к повторной обработке одних и тех же сообщений.

## 🔧 Решение: Таблица `processed_messages`

### Структура таблицы
```sql
CREATE TABLE processed_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_sid text UNIQUE NOT NULL,           -- ID сообщения от Twilio
    source text NOT NULL,                       -- 'sms_webhook' или 'event_streams'
    processed_at timestamptz DEFAULT now(),     -- Время первой обработки
    webhook_data jsonb,                         -- Полные данные для отладки
    duplicate_count integer DEFAULT 1           -- Счетчик дубликатов
);
```

### Логика дедупликации в n8n

#### 1. Определить формат вебхука
```javascript
// Функция определения типа вебхука
function getWebhookType(data) {
  if (data.SmsMessageSid) {
    return 'sms_webhook';
  } else if (data.specversion === '1.0' && data.type === 'com.twilio.messaging.inbound-message.received') {
    return 'event_streams';
  }
  return 'unknown';
}

// Извлечь MessageSid
function getMessageSid(data) {
  if (data.SmsMessageSid) return data.SmsMessageSid;
  if (data.data && data.data.messageSid) return data.data.messageSid;
  return null;
}
```

#### 2. Проверить и сохранить в базе
```javascript
// n8n Function Node: Deduplication Check
async function checkDuplicate(items) {
  const results = [];

  for (const item of items) {
    const data = item.json;
    const webhookType = getWebhookType(data);
    const messageSid = getMessageSid(data);

    if (!messageSid) {
      // Неизвестный формат - пропустить
      results.push({ json: { ...item.json, duplicate: true, reason: 'no_message_sid' } });
      continue;
    }

    try {
      // Проверить, есть ли уже такая запись
      const existing = await supabase
        .from('processed_messages')
        .select('id, duplicate_count')
        .eq('message_sid', messageSid)
        .single();

      if (existing.data) {
        // Уже обработано - увеличить счетчик дубликатов
        await supabase
          .from('processed_messages')
          .update({
            duplicate_count: existing.data.duplicate_count + 1,
            webhook_data: data
          })
          .eq('message_sid', messageSid);

        results.push({ json: { ...item.json, duplicate: true, reason: 'already_processed' } });
      } else {
        // Новое сообщение - сохранить и обработать
        await supabase
          .from('processed_messages')
          .insert({
            message_sid: messageSid,
            source: webhookType,
            webhook_data: data
          });

        results.push({ json: { ...item.json, duplicate: false, message_sid: messageSid } });
      }
    } catch (error) {
      console.error('Deduplication error:', error);
      results.push({ json: { ...item.json, duplicate: true, reason: 'database_error' } });
    }
  }

  return results;
}

return checkDuplicate($input.all());
```

#### 3. Фильтрация дубликатов
```
Switch Node:
- duplicate = false → Продолжить обработку
- duplicate = true → Пропустить (можно логировать)
```

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
