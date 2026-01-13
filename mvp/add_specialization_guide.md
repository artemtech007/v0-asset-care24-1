# Руководство по добавлению новых специализаций мастеров

**Цель:** Безопасное добавление новых специализаций без нарушения существующей логики системы.

---

## 1. Понимание текущей архитектуры

### 1.1 Формат хранения специализаций
- **Вебхук:** Массив строк `["elektrik", "sanitaer", "heizung"]`
- **База данных:** Булевы поля `spec_elektrik`, `spec_sanitaer`, `spec_heizung` в таблице `master_settings`
- **Код n8n:** Функция `convertSpecializationsToBooleans()` преобразует массив в булевы поля
- **Фильтрация:** `WHERE spec_elektrik = true`

### 1.2 Текущие специализации
| Код | Название | Поле в БД |
|-----|----------|------------|
| `elektrik` | Электрика | `spec_elektrik` |
| `sanitaer` | Сантехника | `spec_sanitaer` |
| `heizung` | Отопление | `spec_heizung` |
| `maler` | Малярные работы | `spec_maler` |
| `elektriker` | Электромонтаж | `spec_elektriker` |
| `klempner` | Слесарные работы | `spec_klempner` |
| `schlosser` | Замочно-слесарные | `spec_schlosser` |
| `garten` | Садово-огородные | `spec_garten` |
| `reinigung` | Клининговые услуги | `spec_reinigung` |
| `other` | Другие | `spec_other` |

---

## 2. Пошаговое руководство по добавлению специализации

### Шаг 1: Планирование
**Проверить:**
- [ ] Новое название специализации (на немецком/английском)
- [ ] Уникальный код (латиница, без пробелов)
- [ ] Не конфликтует с существующими кодами
- [ ] Понятное описание для пользователей

**Пример:** Добавить "Фасадные работы" → код `fassade`

### Шаг 2: Обновление базы данных

#### 2.1 Добавить поле в таблицу master_settings
```sql
-- Выполнить в Supabase SQL Editor
ALTER TABLE master_settings
ADD COLUMN spec_fassade boolean DEFAULT false;
```

#### 2.2 Обновить индекс специализаций
```sql
-- Пересоздать композитный индекс с новым полем
DROP INDEX IF EXISTS idx_master_settings_specs;
CREATE INDEX idx_master_settings_specs ON master_settings(
    spec_elektrik, spec_sanitaer, spec_heizung, spec_maler,
    spec_elektriker, spec_klempner, spec_schlosser, spec_garten,
    spec_reinigung, spec_fassade, spec_other
);
```

#### 2.3 Обновить view_master_details
```sql
-- Добавить новое поле в SELECT и GROUP BY
-- Найти в файле add_master_settings_table.sql или init_database_v2.1.sql
-- Добавить: ms.spec_fassade,
```

### Шаг 3: Обновление кода n8n

#### 3.1 Обновить CONFIG в 02_master_registration_code.js
```javascript
specializationFields: {
  elektrik: 'spec_elektrik',
  sanitaer: 'spec_sanitaer',
  heizung: 'spec_heizung',
  maler: 'spec_maler',
  elektriker: 'spec_elektriker',
  klempner: 'spec_klempner',
  schlosser: 'spec_schlosser',
  garten: 'spec_garten',
  reinigung: 'spec_reinigung',
  fassade: 'spec_fassade',  // ← НОВОЕ ПОЛЕ
  other: 'spec_other'
},
```

#### 3.2 Обновить workflow 02_master_registration.md
```sql
-- Добавить в INSERT master_settings:
{{ $json.body.spec_fassade }},  -- Новая специализация
```

### Шаг 4: Обновление документации

#### 4.1 Обновить schema документацию
Добавить новую строку в таблицу специализаций в `03_database_schema_mvp.md`

#### 4.2 Обновить примеры в документации
Добавить `spec_fassade` в примеры JSON в workflow документации

#### 4.3 Обновить справочник специализаций
Обновить таблицу в этом документе

### Шаг 5: Тестирование

#### 5.1 Тест базы данных
```sql
-- Проверить, что поле добавлено
SELECT column_name FROM information_schema.columns
WHERE table_name = 'master_settings' AND column_name = 'spec_fassade';

-- Проверить индекс
SELECT indexname FROM pg_indexes WHERE tablename = 'master_settings';
```

#### 5.2 Тест workflow
- Создать тестовую регистрацию с новой специализацией
- Проверить, что данные записываются в БД
- Проверить фильтрацию: `SELECT * FROM masters m JOIN master_settings ms ON m.id = ms.master_id WHERE ms.spec_fassade = true`

#### 5.3 Тест вебхука
- Отправить тестовый запрос с новой специализацией
- Проверить, что workflow корректно обрабатывает данные

### Шаг 6: Обновление сайта

#### 6.1 Добавить опцию в интерфейс
- Добавить чекбокс/опцию "Fassade" в форму регистрации
- Обновить валидацию формы

#### 6.2 Обновить отправку данных
- Добавить `"fassade"` в массив `specializations`
- Проверить, что данные приходят в правильном формате

---

## 3. Проверка совместимости

### 3.1 Обратная совместимость
- [ ] Существующие записи не ломаются
- [ ] Старые workflow продолжают работать
- [ ] API остается совместимым

### 3.2 Производительность
- [ ] Индексы работают корректно
- [ ] Запросы не замедляются
- [ ] Нагрузка на БД в норме

### 3.3 Безопасность
- [ ] RLS политики покрывают новое поле
- [ ] Нет SQL-инъекций
- [ ] Валидация данных работает

---

## 4. Резервное копирование

**Всегда делать бэкап перед изменениями:**
```bash
# Создать бэкап базы данных
pg_dump assetcare24 > backup_before_specialization_$(date +%Y%m%d_%H%M%S).sql

# Создать бэкап файлов
tar -czf backup_code_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/n8n/files
```

---

## 5. Откат изменений

**Если что-то пошло не так:**

### 5.1 Удалить поле из БД
```sql
-- ВНИМАНИЕ: Это удалит данные! Делать только если поле пустое
ALTER TABLE master_settings DROP COLUMN IF EXISTS spec_fassade;
```

### 5.2 Восстановить код
```bash
# Откатить изменения в git
git checkout HEAD~1 -- 02_master_registration_code.js
git checkout HEAD~1 -- workflows/02_master_registration.md
```

---

## 6. Мониторинг после добавления

### 6.1 Метрики для отслеживания
```sql
-- Количество мастеров с новой специализацией
SELECT COUNT(*) FROM master_settings WHERE spec_fassade = true;

-- Общая статистика специализаций
SELECT
    SUM(CASE WHEN spec_fassade THEN 1 ELSE 0 END) as fassade_count,
    COUNT(*) as total_masters
FROM master_settings;
```

### 6.2 Логи для отладки
- Проверить логи n8n на ошибки обработки
- Мониторить производительность запросов
- Следить за конверсией регистраций

---

## 7. Примеры добавления специализаций

### Пример 1: "Садовый дизайн" (garten_design)
```sql
ALTER TABLE master_settings ADD COLUMN spec_garten_design boolean DEFAULT false;
```
**Код:** `garten_design`
**Поле:** `spec_garten_design`
**Описание:** Специализированные услуги по ландшафтному дизайну

### Пример 2: "Умный дом" (smart_home)
```sql
ALTER TABLE master_settings ADD COLUMN spec_smart_home boolean DEFAULT false;
```
**Код:** `smart_home`
**Поле:** `spec_smart_home`
**Описание:** Установка и настройка систем умного дома

---

## 8. FAQ

**Q: Можно ли переименовать существующую специализацию?**
A: Да, но это требует миграции данных и обновления всех зависимостей.

**Q: Что делать, если код конфликтует с существующим?**
A: Выбрать другой код или добавить префикс (например, `elektrik_pro`).

**Q: Нужно ли обновлять мобильное приложение?**
A: Да, если оно использует жестко заданные списки специализаций.

**Q: Как добавить специализацию только для определенных регионов?**
A: Добавить дополнительное поле или использовать логику в приложении.

---

## 9. Контакты для вопросов

- **База данных:** Проверить изменения в Supabase Dashboard
- **Workflow:** Проверить логи в n8n
- **Frontend:** Координировать с разработчиками сайта

---

**Последнее обновление:** Декабрь 2025
**Версия документа:** 1.0
