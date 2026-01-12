# UTM Analytics Standard - AssetCare24

**Версия:** 1.0
**Дата:** 12 января 2026 г.
**Автор:** AI Assistant

## 🎯 Обзор

Этот документ определяет единый стандарт UTM-меток для AssetCare24, обеспечивающий:
- Консистентную аналитику всех точек входа
- Простую маршрутизацию заявок в n8n
- Масштабируемость для будущих типов клиентов и мастеров
- Совместимость с существующими решениями

---

## 📊 Структура UTM-меток

### Базовый формат
```
utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content}&utm_term={term}
```

### Определения параметров

#### utm_source (Источник трафика)
- **web** - Веб-сайт AssetCare24
- **qr** - QR-коды на объектах
- **social** - Социальные сети
- **ad** - Рекламные платформы
- **organic** - Органический поиск
- **referral** - Реферальные ссылки

#### utm_medium (Тип трафика)
**Для клиентов (клиентские заявки):**
- **kunde** - Обычные клиентские заявки
- **tenant** - Съемщики жилья (будущая функция)
- **owner** - Собственники жилья (будущая функция)
- **manager** - Управляющие компании (будущая функция)

**Для мастеров (регистрации):**
- **master** - Индивидуальные мастера
- **freelancer** - Подрабатывающие мастера (будущая функция)
- **company** - Компании с сотрудниками (будущая функция)

#### utm_campaign (Кампания/точка входа)
**Общие кампании:**
- **main_page** - Главная страница
- **services_page** - Страница услуг
- **master_reg** - Регистрация мастера
- **qr_contract** - Контрактные QR-коды
- **qr_public** - Публичные QR-коды
- **social_organic** - Органика в соцсетях
- **ad_google** - Google Ads
- **ad_facebook** - Facebook Ads
- **ad_instagram** - Instagram Ads
- **ad_tiktok** - TikTok Ads

**Будущие кампании:**
- **tenant_portal** - Портал для съемщиков
- **owner_dashboard** - Дашборд для собственников
- **manager_api** - API для управляющих компаний

#### utm_content (Контент/вариант)
- **button_primary** - Основная кнопка
- **button_secondary** - Вторичная кнопка
- **banner_top** - Верхний баннер
- **banner_bottom** - Нижний баннер
- **popup_exit** - Выходной попап
- **qr_building_a** - QR код здания A
- **qr_complex_1** - QR код комплекса 1

#### utm_term (Ключевые слова)
- Используется для отслеживания поисковых запросов
- Для платной рекламы: ключевые слова кампании
- Для органики: поисковые запросы

---

## 🔄 Маршрутизация заявок

### Логика определения типа заявки

#### 1. Первичная классификация по utm_medium
```javascript
if (utm_medium.includes('kunde') || utm_medium.includes('tenant') || utm_medium.includes('owner') || utm_medium.includes('manager')) {
  // Это клиентская заявка
  requestType = 'client';
} else if (utm_medium.includes('master') || utm_medium.includes('freelancer') || utm_medium.includes('company')) {
  // Это регистрация мастера
  requestType = 'master_registration';
}
```

#### 2. Детальная классификация клиентов
```javascript
switch(utm_medium) {
  case 'kunde':
    clientType = 'general_customer';
    break;
  case 'tenant':
    clientType = 'renter';
    break;
  case 'owner':
    clientType = 'property_owner';
    break;
  case 'manager':
    clientType = 'property_manager';
    break;
}
```

#### 3. Детальная классификация мастеров
```javascript
switch(utm_medium) {
  case 'master':
    masterType = 'individual_master';
    break;
  case 'freelancer':
    masterType = 'part_time_master';
    break;
  case 'company':
    masterType = 'company_with_employees';
    break;
}
```

#### 4. Определение источника трафика
```javascript
switch(utm_source) {
  case 'web':
    trafficSource = 'website';
    break;
  case 'qr':
    trafficSource = 'qr_code';
    break;
  case 'social':
    trafficSource = 'social_media';
    break;
  case 'ad':
    trafficSource = 'advertisement';
    break;
  case 'organic':
    trafficSource = 'search_engine';
    break;
}
```

---

## 📋 Примеры UTM-меток

### Текущие точки входа (MVP v1.2)

#### Клиентские заявки:
```
# Главная страница - основная кнопка
utm_source=web&utm_medium=kunde&utm_campaign=main_page&utm_content=button_primary

# Страница услуг - WhatsApp кнопка
utm_source=web&utm_medium=kunde&utm_campaign=services_page&utm_content=whatsapp_button

# QR код на доме №1
utm_source=qr&utm_medium=kunde&utm_campaign=qr_contract&utm_content=building_1
```

#### Регистрация мастеров:
```
# Кнопка "ALS HANDWERKER BEITRETEN"
utm_source=web&utm_medium=master&utm_campaign=master_reg&utm_content=hero_button

# Финальная кнопка регистрации
utm_source=web&utm_medium=master&utm_campaign=master_reg&utm_content=registration_complete
```

### Будущие точки входа (v2.0)

#### Клиенты - разные типы:
```
# Съемщик через портал арендаторов
utm_source=web&utm_medium=tenant&utm_campaign=tenant_portal&utm_content=service_request

# Собственник через личный кабинет
utm_source=web&utm_medium=owner&utm_campaign=owner_dashboard&utm_content=emergency_repair

# Управляющая компания через API
utm_source=web&utm_medium=manager&utm_campaign=manager_api&utm_content=bulk_request
```

#### Мастера - разные типы:
```
# Регистрация компании
utm_source=web&utm_medium=company&utm_campaign=master_reg&utm_content=company_signup

# Подработка для фрилансера
utm_source=web&utm_medium=freelancer&utm_campaign=master_reg&utm_content=part_time_offer
```

---

## 🛠️ Техническая реализация

### Веб-сайт (Next.js)

#### Компонент для генерации ссылок:
```typescript
interface UTMParams {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
}

function generateWhatsAppLink(phone: string, message: string, utm: UTMParams): string {
  const baseUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const utmString = Object.entries(utm)
    .filter(([_, value]) => value)
    .map(([key, value]) => `utm_${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${baseUrl}&${utmString}`;
}

// Пример использования
const link = generateWhatsAppLink(
  '4915510415655',
  'Hallo, ich brauche Hilfe bei der Reparatur',
  {
    source: 'web',
    medium: 'kunde',
    campaign: 'main_page',
    content: 'button_primary'
  }
);
```

### n8n Workflow

#### Парсинг UTM-меток:
```javascript
// Функция для парсинга UTM из сообщения
function parseUTMFromMessage(message) {
  const url = new URL(message.split(' ').find(word => word.includes('utm_')));
  const params = new URLSearchParams(url.search);

  return {
    source: params.get('utm_source'),
    medium: params.get('utm_medium'),
    campaign: params.get('utm_campaign'),
    content: params.get('utm_content'),
    term: params.get('utm_term')
  };
}

// Маршрутизация на основе UTM
function routeRequest(utm) {
  if (utm.medium.includes('kunde')) {
    // Клиентская заявка
    return routeClientRequest(utm);
  } else if (utm.medium.includes('master')) {
    // Регистрация мастера
    return routeMasterRegistration(utm);
  }
}
```

---

## 📈 Аналитика и отчетность

### Метрики для отслеживания

#### Конверсионные метрики:
- **CTR (Click-through rate)** - процент кликов по ссылкам
- **Conversion rate** - процент завершенных заявок
- **Customer acquisition cost** - стоимость привлечения клиента
- **Lifetime value** - пожизненная ценность клиента

#### Источники трафика:
- **Source performance** - эффективность каждого источника
- **Campaign ROI** - окупаемость рекламных кампаний
- **Channel attribution** - вклад каждого канала

### Google Analytics 4

#### Рекомендуемые события:
```javascript
// Отправка заявки
gtag('event', 'generate_lead', {
  campaign_source: utm.source,
  campaign_medium: utm.medium,
  campaign_name: utm.campaign,
  campaign_content: utm.content
});

// Регистрация мастера
gtag('event', 'sign_up', {
  method: 'whatsapp_verification',
  user_type: 'master',
  campaign_source: utm.source
});
```

---

## 🔮 Планы развития

### Фаза 2: Расширение классификации

#### Новые типы клиентов (Q2 2026):
- **Tenants (съемщики)** - через специализированный портал арендаторов
- **Property Owners (собственники)** - через личный кабинет собственника
- **Property Managers (управляющие)** - через API интеграцию

#### Новые типы мастеров (Q3 2026):
- **Freelancers (фрилансеры)** - мастера, подрабатывающие неполный день
- **Companies (компании)** - организации с штатными сотрудниками
- **Specialized teams (специализированные бригады)** - для крупных проектов

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
**Документация:** Обновляется в `mvp/utm_analytics_standard.md`

---

**Этот стандарт обеспечивает масштабируемость и консистентность аналитики AssetCare24 на всех этапах развития проекта.**</contents>
</xai:function_call<parameter name="write">
<parameter name="file_path">/home/aaa/Projects/n8n/assetcare24/mvp/utm_analytics_standard.md
