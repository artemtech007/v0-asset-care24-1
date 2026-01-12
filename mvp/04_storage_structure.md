# Структура S3-хранилища (MinIO) для MVP

**Принцип:** Структура на основе составных ID, самодокументируемая без базы данных.

## 1. Бакеты (Buckets)

*   **Bucket Name:** `assetcare-mvp`
*   **Access Policy:**
    *   `/public/*` → Read-only для всех
    *   `/users/*` → Private (доступ через приложение)
    *   `/requests/*` → Private (доступ через приложение)

## 2. Структура Папок (Folders)

### 2.1 Пользователи (Users)
Основная структура хранения данных пользователей.

#### Формат: `users/{user_id}/{category}/{filename}`
- `{user_id}`: Составной ID (`cid_wa_491510416555`, `mid_wa_491510416556`)
- `{category}`: Категория файлов
- `{filename}`: Имя файла с timestamp

#### Категории файлов:

**Для клиентов (`cid_*`):**
```
users/cid_wa_491510416555/
├── registration_pending/     # Документы на проверке
│   ├── passport_1702312345.jpg
│   ├── diploma_1702312346.pdf
│   └── utility_bill_1702312347.jpg
├── documents/                # Одобренные документы
│   ├── passport.jpg
│   └── diploma.pdf
└── requests/                 # Файлы заявок
    └── 101/
        ├── problem_photo.jpg
        ├── problem_audio.ogg
        └── result_photo.jpg
```

**Для мастеров (`mid_*`):**
```
users/mid_wa_491510416556/
├── registration_pending/     # Документы на проверке
├── documents/                # Лицензии, страховки
│   ├── license.jpg
│   ├── insurance.pdf
│   └── certificate_electrician.pdf
├── portfolio/                # Портфолио работ
│   ├── kitchen_before.jpg
│   ├── kitchen_after.jpg
│   └── bathroom_renovation.pdf
└── requests/                 # Файлы выполненных работ
    └── 101/
        ├── work_progress.jpg
        ├── completion_photo.jpg
        └── invoice.pdf
```

### 2.2 Заявки (Requests)
Файлы, связанные с конкретными заявками.

#### Формат: `requests/{request_id}/{category}/{filename}`
- `{request_id}`: ID заявки (число: `101`, `102`, или с дочерними: `101-1`)
- `{category}`: Категория файлов заявки

```
requests/
├── 101/                     # Заявка #101
│   ├── problem/             # Фото/видео проблемы
│   │   ├── photo_1.jpg
│   │   ├── photo_2.jpg
│   │   └── audio_description.ogg
│   ├── work/                # Рабочие фото мастера
│   │   ├── progress_1.jpg
│   │   ├── progress_2.jpg
│   │   └── completion.jpg
│   └── documents/           # Документы (счета, акты)
│       ├── invoice.pdf
│       └── acceptance_act.pdf
├── 101-1/                   # Дочерняя заявка #101-1
│   └── work/
│       └── additional_work.jpg
```

### 2.3 Системные файлы (System)
Общие файлы системы.

```
system/
├── templates/               # Шаблоны документов
│   ├── invoice_template.docx
│   └── contract_template.pdf
├── backups/                 # Резервные копии
└── logs/                    # Логи системы
    ├── 2025-01/
    └── 2025-02/
```

## 3. Правила именования файлов

### 3.1 Автоматическая генерация имен
```
{type}_{timestamp}_{random}.{ext}
```

**Примеры:**
- `passport_1702312345_abc.jpg`
- `invoice_1702319999_xyz.pdf`
- `work_progress_1702320000_def.jpg`

### 3.2 Очистка имен (для загруженных файлов)
```javascript
function cleanFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')  // Замена спецсимволов
    .replace(/_+/g, '_')           // Удаление двойных подчеркиваний
    .substring(0, 100);            // Ограничение длины
}
```

## 4. Доступ и безопасность

### 4.1 Уровни доступа
- **Public:** Шаблоны, общедоступные файлы
- **Private:** Все пользовательские данные
- **Presigned URLs:** Временный доступ через приложение

### 4.2 Очистка данных
- **При блокировке пользователя:** Файлы остаются (для аудита)
- **При удалении:** Полное удаление всех файлов пользователя
- **Резервное копирование:** Еженедельное

## 5. Интеграция с базой данных

### 5.1 Ссылки на файлы
```sql
-- В таблице request_media
request_media {
  request_id: 101,
  uploaded_by: 'cid_wa_491510416555',  -- Составной ID пользователя
  type: 'problem_photo',
  bucket_path: 'requests/101/problem/photo_1702312345.jpg',
  public_url: null,  -- Для приватных файлов
  file_size: 2048576,
  mime_type: 'image/jpeg'
}
```

### 5.2 Запросы к хранилищу
```sql
-- Найти все файлы клиента
SELECT * FROM request_media
WHERE uploaded_by = 'cid_wa_491510416555'

-- Найти файлы заявки
SELECT * FROM request_media
WHERE request_id = 101
ORDER BY created_at DESC
```

## 6. Мониторинг и обслуживание

### 6.1 Метрики
- Общий объем хранилища по пользователям
- Количество файлов по типам
- Рост хранилища по месяцам

### 6.2 Очистка
```bash
# Найти файлы старше 1 года в registration_pending
find /data/assetcare-mvp/users/*/registration_pending/ -mtime +365 -delete

# Проверить целостность ссылок в БД
SELECT rm.* FROM request_media rm
LEFT JOIN requests r ON rm.request_id = r.id
WHERE r.id IS NULL  -- Найти "осиротевшие" файлы
```

