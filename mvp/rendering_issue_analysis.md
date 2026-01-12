# Анализ проблемы рендеринга компонентов Next.js

## Описание проблемы

### Основная проблема
При нажатии на кнопку "ALS HANDWERKER BEITRETEN" на главной странице происходит переход на страницу `/registrierung?role=handwerker`, но вместо корректной страницы регистрации появляется ошибка:

```
DOM Path: script[30] > nextjs-portal
```

### Детали проблемы

#### Контекст
- Пользователь нажимает кнопку на главной странице (`/`)
- Происходит переход на страницу регистрации (`/registrierung?role=handwerker`)
- Вместо формы регистрации появляется `nextjs-portal` ошибка

#### Последовательность событий
1. Пользователь на главной странице
2. Нажатие кнопки "ALS HANDWERKER BEITRETEN"
3. Next.js выполняет навигацию к `/registrierung?role=handwerker`
4. Компонент `RegistrierungForm` начинает рендериться
5. Возникает ошибка рендеринга с `nextjs-portal`

#### Технические детали

##### Структура компонентов
```jsx
// app/registrierung/page.tsx
export default function RegistrierungPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      <RegistrierungForm />
      <Footer />
    </main>
  )
}

// components/registrierung-form.tsx
export function RegistrierungForm() {
  return (
    <>
      {handwerkerType ? renderHandwerkerForm() : renderHandwerkerTypeSelection()}

      {/* Popup components */}
      <VerificationPopup isOpen={showVerification} ... />
      <SuccessPopup isOpen={showSuccess} ... />
    </>
  )
}
```

##### Попытки исправления
1. **Убрана логика дублированного рендеринга**
   - Ранее компонент возвращал разный контент в зависимости от `handwerkerType`
   - Попытались упростить логику, но возникли проблемы с popup'ами

2. **Перемещение popup'ов**
   - Попытались переместить `VerificationPopup` и `SuccessPopup` внутрь `renderHandwerkerForm()`
   - Это привело к ошибке, потому что компоненты рендерились условно

3. **Текущая структура**
   - Popup'ы находятся на уровне основного компонента
   - Условный рендеринг основного контента: `{handwerkerType ? renderHandwerkerForm() : renderHandwerkerTypeSelection()}`

##### Ошибка nextjs-portal
`nextjs-portal` - это внутренний механизм Next.js для рендеринга порталов (например, для Dialog/Modal компонентов). Ошибка указывает на:

1. **Проблемы с контекстом рендеринга**
   - Компоненты порталов рендерятся в неправильном месте DOM
   - Возможные проблемы с hydration

2. **Проблемы с условным рендерингом**
   - Компоненты, которые должны всегда быть в DOM, рендерятся условно
   - Dialog/Modal компоненты требуют стабильного места в DOM дереве

3. **Проблемы с состоянием**
   - Состояние компонентов сбрасывается при перерендеринге
   - Переходы между состояниями ломают портал

## Предполагаемые причины

### 1. Архитектурная проблема с условным рендерингом
```jsx
// Проблемный код
return (
  <>
    {handwerkerType ? renderHandwerkerForm() : renderHandwerkerTypeSelection()}

    {/* Popup'ы всегда должны быть в DOM */}
    <VerificationPopup ... />
    <SuccessPopup ... />
  </>
)
```

**Проблема:** Когда `handwerkerType` изменяется, весь контент перерендеривается, что может ломать порталы.

### 2. Проблемы с ключевыми пропсами
Отсутствие стабильных `key` пропсов может приводить к тому, что React уничтожает и пересоздает компоненты порталов.

### 3. Проблемы с hydration
Если клиент и сервер рендерят разный контент, это может ломать порталы.

## Предлагаемые решения

### Решение 1: Стабильная структура DOM
```jsx
export function RegistrierungForm() {
  return (
    <div>
      {/* Всегда рендерим оба варианта, но показываем только один */}
      <div style={{ display: handwerkerType ? 'block' : 'none' }}>
        {renderHandwerkerForm()}
      </div>
      <div style={{ display: handwerkerType ? 'none' : 'block' }}>
        {renderHandwerkerTypeSelection()}
      </div>

      {/* Popup'ы всегда в DOM */}
      <VerificationPopup ... />
      <SuccessPopup ... />
    </div>
  )
}
```

### Решение 2: Разделение на отдельные страницы
- `app/registrierung/page.tsx` - выбор типа
- `app/registrierung/handwerker/page.tsx` - форма для handwerker
- `app/registrierung/kunde/page.tsx` - форма для kunde

### Решение 3: Использование ключей для стабильности
```jsx
return (
  <>
    <div key="form-container">
      {handwerkerType ? renderHandwerkerForm() : renderHandwerkerTypeSelection()}
    </div>

    <VerificationPopup key="verification-popup" ... />
    <SuccessPopup key="success-popup" ... />
  </>
)
```

## Следующие шаги

1. **Откат к рабочему состоянию**
   - Восстановить исходную версию с кодом подтверждения
   - Восстановить секцию с документами
   - Проверить, что базовая функциональность работает

2. **Тестирование**
   - Протестировать полный флоу от главной страницы до успешной регистрации
   - Убедиться, что нет ошибок рендеринга

3. **Анализ и исправление**
   - Если проблема остается, применить одно из предложенных решений
   - Тестировать каждый шаг изменений

## Метрики успеха

- Кнопка "ALS HANDWERKER BEITRETEN" корректно ведет на страницу регистрации
- Форма регистрации отображается без ошибок
- Popup'ы работают корректно
- Нет ошибок nextjs-portal в консоли браузера

## Дополнительная информация

- **Browser:** Неизвестен (нужно проверить в разных браузерах)
- **Next.js version:** 15.x (предположительно)
- **React version:** 18.x (предположительно)
- **UI Library:** shadcn/ui с Radix UI Dialog
