# UTM Analytics Standard - AssetCare24

**Версия:** 3.0 (MVP Simplified)
**Дата:** 14 января 2026 г.
**Автор:** AI Assistant
**Изменения:** Упрощенный формат для MVP с надежными разделителями `||-` и `-||`

## 🎯 Обзор

Этот документ определяет единый стандарт UTM-меток для AssetCare24, адаптированный под ограничения WhatsApp. Поскольку WhatsApp не поддерживает URL-параметры, используется формат с кодами в предзаполненном тексте сообщений.

**Ключевые преимущества:**
- Консистентную аналитику всех точек входа
- Простую маршрутизацию заявок в n8n
- Масштабируемость для будущих типов клиентов и мастеров
- Совместимость с WhatsApp Click-to-Chat

---

## 📊 Структура кодов источника (MVP Simplified)

### Базовый формат кода
```
||-R-{SOURCE}-{USER_TYPE}-{CLIENT_TYPE}-{CODE}-||
```

**Примеры:**
- `||-R-QR-C-C-00001-||` — Контрактный клиент через QR-код
- `||-R-QR-M-C-00001-||` — **Работник, обслуживающий контракт 00001**
- `||-R-WB-M-0-00000-||` — Мастер через веб-сайт

**Где:**
- `||-` — префикс для парсинга (фиксированный)
- `R` — параметр действия: "регистрация" (фиксированный)
- `{SOURCE}` — источник: `WB` (сайт) или `QR` (QR-коды)
- `{USER_TYPE}` — тип пользователя: `C` (клиент) или `M` (мастер)
- `{CLIENT_TYPE}` — тип клиента: `C` (контрактный) или `P` (публичный), для мастеров = `0`
- `{CODE}` — 5-ти значный код (00000 по умолчанию)
- `-||` — суффикс для парсинга (фиксированный)

### Определения параметров

#### {SOURCE} (Источник трафика)
- **WB** - Веб-сайт AssetCare24
- **QR** - QR-коды на объектах

#### {USER_TYPE} (Тип пользователя)
- **C** - Клиент (заявки на обслуживание)
- **M** - Мастер (регистрация исполнителя)

#### {CLIENT_TYPE} (Тип клиента по договору)
- **C** - Контрактный клиент (существующие договорные отношения)
- **P** - Публичный клиент (новые клиенты без договора)
- **0** - Для мастеров (не используется)

#### {CODE} (5-ти значный код)
- **00000** - Значение по умолчанию
- **00001-99999** - Специфические коды:
  - Номер контрактного клиента
  - Номер рекламной кампании
  - ID объекта/здания
  - Другие идентификаторы

---

## 🔄 Маршрутизация заявок (n8n)

### Логика парсинга кода источника

#### 1. Регулярное выражение для парсинга
```javascript
// Функция парсинга R-кода (упрощенная версия для MVP)
function parseSourceCode(message) {
  const regex = /\|\|-R-([A-Z]{2})-([CM])-([CP0])-(\d{5})-\|\|/;
  const match = message.match(regex);

  if (!match) return null;

  return {
    source: match[1],      // 'WB' (сайт) или 'QR' (QR-код)
    userType: match[2],    // 'C' (клиент) или 'M' (мастер)
    clientType: match[3],  // 'C' (контрактный), 'P' (публичный) или '0' (для мастеров)
    code: match[4]         // '00000' или специфический 5-ти значный код
  };
}
```

#### 2. Определение типа запроса
```javascript
function classifyRequest(parsedCode) {
  if (!parsedCode) return 'unknown';

  if (parsedCode.userType === 'C') {
    // Клиентская заявка
    return {
      requestType: 'client_request',
      source: parsedCode.source === 'WB' ? 'website' : 'qr_code',
      clientCategory: parsedCode.clientType === 'C' ? 'contract' : 'public',
      clientCode: parsedCode.code,
      isContractClient: parsedCode.clientType === 'C'
    };
  } else if (parsedCode.userType === 'M') {
    // Регистрация мастера
    return {
      requestType: 'master_registration',
      source: parsedCode.source === 'WB' ? 'website' : 'qr_code',
      masterCode: parsedCode.code
    };
  }

  return 'unknown';
}
```

#### 3. Fallback при отсутствии кода
```javascript
function handleNoCodeFallback(message) {
  // Если код не найден, предлагаем пользователю уточнить источник
  const fallbackOptions = [
    { text: 'Через QR-код', value: 'qr_code' },
    { text: 'Через наш сайт', value: 'website' },
    { text: 'Через рекламу', value: 'advertisement' },
    { text: 'По рекомендации', value: 'referral' }
  ];

  return {
    hasCode: false,
    fallbackOptions: fallbackOptions,
    suggestedResponse: 'Не смогли определить источник. Уточните, пожалуйста, как вы узнали о нас?'
  };
}
```

---

## 📋 Примеры кодов источника (MVP Simplified)

### Текущие точки входа (MVP v3.0)

#### Клиентские заявки:
```
# Контрактный клиент через QR-код (код клиента 00001)
||-R-QR-C-C-00001-||

# Публичный клиент через QR-код (без специального кода)
||-R-QR-C-P-00000-||

# Контрактный клиент через сайт (контракт №123)
||-R-WB-C-C-00123-||

# Публичный клиент через сайт (рекламная кампания №5)
||-R-WB-C-P-00005-||
```

#### Регистрация мастеров:
```
# Регистрация мастера через сайт (код специализации 00001)
||-R-WB-M-0-00001-||

# Регистрация мастера через QR-код (реферальный код 00234)
||-R-QR-M-0-00234-||
```

### Полные примеры WhatsApp сообщений:

#### Клиентские сообщения:
```
Hallo, ich brauche Hilfe bei der Reparatur
Код источника: ||-R-QR-C-C-00001-||

Bitte helfen Sie mir mit der Reparatur
Код источника: ||-R-WB-C-P-00005-||
```

#### Мастерские сообщения:
```
Hallo, ich möchte mich als Handwerker registrieren
Код источника: ||-R-WB-M-0-00001-||

Ich interessiere mich für Handwerksarbeiten
Код источника: ||-R-QR-M-0-00234-||

Ich bin Techniker für Vertrag 00001
Код источника: ||-R-QR-M-C-00001-||
```

---

## 🛠️ Техническая реализация

### Веб-сайт (Next.js)

#### Компонент для генерации WhatsApp ссылок:
```typescript
interface SourceCodeParams {
  source: 'WB' | 'QR';           // Только 2 источника для MVP
  userType: 'C' | 'M';           // Клиент или мастер
  clientType: 'C' | 'P' | '0';   // Тип клиента (0 для мастеров)
  code: string;                  // 5-ти значный код (00000 по умолчанию)
}

function generateSourceCode(params: SourceCodeParams): string {
  return `||-R-${params.source}-${params.userType}-${params.clientType}-${params.code.padStart(5, '0')}-||`;
}

function generateWhatsAppLink(phone: string, baseMessage: string, params: SourceCodeParams): string {
  const sourceCode = generateSourceCode(params);
  const fullMessage = `${baseMessage}\n\nКод источника: ${sourceCode}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
}

// Примеры использования

// Контрактный клиент через QR-код
const contractClientLink = generateWhatsAppLink(
  '491234567890',
  'Hallo, ich brauche Hilfe bei der Reparatur',
  {
    source: 'QR',
    userType: 'C',
    clientType: 'C',
    code: '00001'  // Номер контрактного клиента
  }
);
// Результат: https://wa.me/491234567890?text=Hallo%2C%20ich%20brauche%20Hilfe%20bei%20der%20Reparatur%0A%0A%D0%9A%D0%BE%D0%B4%20%D0%B8%D1%81%D1%82%D0%BE%D1%87%D0%BD%D0%B8%D0%BA%D0%B0%3A%20%7C%7C-R-QR-C-C-00001-%7C%7C

// Мастер через сайт
const masterLink = generateWhatsAppLink(
  '491234567890',
  'Hallo, ich möchte mich als Handwerker registrieren',
  {
    source: 'WB',
    userType: 'M',
    clientType: '0',
    code: '00001'  // Код специализации
  }
);
// Результат: https://wa.me/491234567890?text=Hallo%2C%20ich%20m%C3%B6chte%20mich%20als%20Handwerker%20registrieren%0A%0A%D0%9A%D0%BE%D0%B4%20%D0%B8%D1%81%D1%82%D0%BE%D1%87%D0%BD%D0%B8%D0%BA%D0%B0%3A%20%7C%7C-R-WB-M-0-00001-%7C%7C
```

### n8n Workflow

#### Простой парсинг сообщения:
```javascript
// Функция для парсинга упрощенного R-кода
function parseWhatsAppMessage(message) {
  // Ищем код между разделителями ||- и -||
  const regex = /\|\|-R-([A-Z]{2})-([CM])-([CP0])-(\d{5})-\|\|/;
  const match = message.match(regex);

  if (!match) {
    return {
      hasValidCode: false,
      requestType: 'unknown',
      fallback: true
    };
  }

  const parsedCode = {
    source: match[1],      // 'WB' или 'QR'
    userType: match[2],    // 'C' или 'M'
    clientType: match[3],  // 'C', 'P' или '0'
    code: match[4]         // '00000' или специфический код
  };

  // Определяем тип запроса
  let requestType = 'unknown';
  if (parsedCode.userType === 'C') {
    requestType = 'client_request';
  } else if (parsedCode.userType === 'M') {
    requestType = 'master_registration';
  }

  return {
    hasValidCode: true,
    requestType: requestType,
    source: parsedCode.source === 'WB' ? 'website' : 'qr_code',
    userType: parsedCode.userType === 'C' ? 'client' : 'master',
    clientCategory: parsedCode.clientType === 'C' ? 'contract' : 'public',
    clientCode: parsedCode.code,
    originalCode: match[0]
  };
}

// Пример использования
const message = "Hallo, ich brauche Hilfe\nКод источника: ||-R-QR-C-C-00001-||";
const result = parseWhatsAppMessage(message);
// Результат:
// {
//   hasValidCode: true,
//   requestType: 'client_request',
//   source: 'qr_code',
//   userType: 'client',
//   clientCategory: 'contract',
//   clientCode: '00001',
//   originalCode: '||-R-QR-C-C-00001-||'
// }
```

---

## 📈 Аналитика и отчетность

### Метрики для отслеживания

#### Конверсионные метрики:
- **CTR (Click-through rate)** - процент кликов по WhatsApp ссылкам
- **Conversion rate** - процент завершенных заявок от кликов
- **Customer acquisition cost** - стоимость привлечения клиента по источникам
- **Channel efficiency** - эффективность каналов (затраты/заявка)
- **Source attribution accuracy** - точность определения источника трафика

#### Источники трафика:
- **Source performance** - конверсии по каждому источнику (WEB, IG, QR, etc.)
- **Campaign ROI** - окупаемость конкретных кампаний
- **Channel attribution** - вклад каждого канала в общий трафик
- **Code integrity** - процент корректно переданных кодов источника

### Google Analytics 4

#### Рекомендуемые события:
```javascript
// Клик по WhatsApp ссылке (на сайте)
gtag('event', 'click', {
  event_category: 'whatsapp',
  event_label: 'contact_button',
  custom_parameter_source: 'WEB',  // Источник
  custom_parameter_campaign: 'MAIN' // Кампания
});

// Получение сообщения в n8n
gtag('event', 'whatsapp_message_received', {
  source: parsedData.source,      // 'WEB', 'IG', 'QR'
  campaign: parsedData.campaign,  // 'MAIN', 'SERV', 'QRCO'
  has_valid_code: parsedData.hasValidCode,
  contract_id: parsedData.additionalParams.contract || null
});

// Создание заявки
gtag('event', 'request_created', {
  source: parsedData.source,
  campaign: parsedData.campaign,
  request_type: 'client_request', // или 'master_registration'
  contract_id: parsedData.additionalParams.contract || null,
  building_id: parsedData.additionalParams.building || null
});

// Контрактные метрики
gtag('event', 'contract_interaction', {
  contract_id: parsedData.additionalParams.contract,
  interaction_type: parsedData.campaign,
  source: parsedData.source,
  building: parsedData.additionalParams.building
});
```

### Отчеты в Supabase

#### SQL для аналитики источников:
```sql
-- Эффективность источников трафика
SELECT
  source,
  campaign,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
  ROUND(
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric /
    COUNT(*)::numeric * 100, 2
  ) as completion_rate
FROM requests r
JOIN clients c ON r.client_id = c.id
WHERE c.source IS NOT NULL
GROUP BY source, campaign
ORDER BY total_requests DESC;

-- Анализ контрактных клиентов
SELECT
  contract_id,
  COUNT(*) as requests_count,
  AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completion_rate,
  MAX(created_at) as last_request_date
FROM (
  SELECT
    (meta_data->>'contract_id') as contract_id,
    status,
    created_at
  FROM requests r
  JOIN clients c ON r.client_id = c.id
  WHERE c.meta_data->>'contract_id' IS NOT NULL
) contract_requests
GROUP BY contract_id
ORDER BY requests_count DESC;
```

---

## 🚀 Внедрение в сайт (Next.js)

### 1. Создание утилиты для генерации кодов

Создайте файл `lib/source-codes.ts`:

```typescript
export interface SourceCodeParams {
  source: 'WEB' | 'IG' | 'FB' | 'TT' | 'GG' | 'QR' | 'OR' | 'LI' | 'YT' | 'EM' | 'RF';
  campaign: 'MAIN' | 'SERV' | 'LAND' | 'QRCO' | 'QRPU' | 'SOCO' | 'ADGO' | 'ADFB' | 'ADIG' | 'ADTT' | 'MREG' | 'MREF' | 'TPOR' | 'ODSH' | 'MAPI';
  additionalParams?: {
    contract?: string;
    building?: string;
    tenant?: string;
    company?: string;
  };
}

export function generateSourceCode(params: SourceCodeParams): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const nonce = Math.random().toString(36).substr(2, 4).toUpperCase();

  return `SRC-${params.source}-${params.campaign}-${date}-${nonce}`;
}

export function generateWhatsAppLink(
  phone: string,
  baseMessage: string,
  params: SourceCodeParams
): string {
  const sourceCode = generateSourceCode(params);

  let additionalText = '';
  if (params.additionalParams) {
    if (params.additionalParams.contract) {
      additionalText += ` [CONTRACT:${params.additionalParams.contract}]`;
    }
    if (params.additionalParams.building) {
      additionalText += ` [BUILDING:${params.additionalParams.building}]`;
    }
    if (params.additionalParams.tenant) {
      additionalText += ` [TENANT:${params.additionalParams.tenant}]`;
    }
    if (params.additionalParams.company) {
      additionalText += ` [COMPANY:${params.additionalParams.company}]`;
    }
  }

  const fullMessage = `${baseMessage}\n\nКод источника: ${sourceCode}${additionalText}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
}
```

### 2. Обновление компонентов

Пример обновления кнопки на главной странице:

```tsx
// components/hero-section.tsx
import { generateWhatsAppLink } from '@/lib/source-codes';

export function HeroSection() {
  const whatsappLink = generateWhatsAppLink(
    '491234567890', // Ваш WhatsApp номер
    'Hallo, ich brauche Hilfe bei der Reparatur',
    {
      source: 'WEB',
      campaign: 'MAIN'
    }
  );

  return (
    <a
      href={whatsappLink}
      className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
      onClick={() => {
        // GA4 событие
        gtag('event', 'click', {
          event_category: 'whatsapp',
          event_label: 'hero_button',
          custom_parameter_source: 'WEB',
          custom_parameter_campaign: 'MAIN'
        });
      }}
    >
      WhatsApp Nachricht senden
    </a>
  );
}
```

### 3. Тестирование

#### Проверка генерации ссылок:
```bash
# Запустите сайт и перейдите на utm-test страницу
# Проверьте генерацию различных типов ссылок
curl "http://localhost:3000/utm-test"
```

#### Проверка парсинга в n8n:
```javascript
// Тестовый код для n8n
const testMessage = "Hallo, ich brauche Hilfe bei der Reparatur\n\nКод источника: SRC-WEB-MAIN-20260114-AB3F [CONTRACT:001]";

const parsed = parseWhatsAppMessage(testMessage);
console.log(parsed);
// Ожидаемый результат:
// {
//   sourceCode: "SRC-WEB-MAIN-20260114-AB3F",
//   source: "WEB",
//   campaign: "MAIN",
//   date: "20260114",
//   nonce: "AB3F",
//   additionalParams: { contract: "001" },
//   hasValidCode: true
// }
```

---

## 🔮 Планы развития

### Фаза 2: Расширение классификации (Q2 2026)

#### Новые типы клиентов:
- **Tenants (съемщики)** - через специализированный портал арендаторов
- **Property Owners (собственники)** - через личный кабинет собственника
- **Property Managers (управляющие)** - через API интеграцию

#### Новые типы мастеров (Q3 2026):
- **Freelancers (фрилансеры)** - мастера, подрабатывающие неполный день
- **Companies (компании)** - организации с штатными сотрудниками

### Фаза 3: AI-маршрутизация (Q4 2026)

#### Интеллектуальная маршрутизация:
- Анализ истории клиента для персонализации
- Автоматическое определение срочности заявки
- Предиктивное назначение мастеров
- Оптимизация стоимости услуг

---

## 📞 Контакты

**Технический руководитель:** Artem Tihonov
**Аналитика:** AI Assistant
**Документация:** `mvp/utm_analytics_standard.md`

---

## ✅ Ключевые преимущества упрощенного стандарта

1. **MVP-оптимизация** - только необходимые параметры для запуска
2. **Надежные разделители** - `||-` и `-||` обеспечивают точное распознавание
3. **Простота парсинга** - одна регулярка для всех случаев
4. **Отказоустойчивость** - легко определить наличие/отсутствие кода
5. **Масштабируемость** - легко расширить при необходимости
6. **Читаемость** - код легко понять и отдебажить

**Этот стандарт идеален для MVP: простота + надежность + возможность расширения.**</contents>
</xai:function_call<parameter name="write">
<parameter name="file_path">/home/aaa/Projects/n8n/assetcare24/mvp/utm_analytics_standard.md
