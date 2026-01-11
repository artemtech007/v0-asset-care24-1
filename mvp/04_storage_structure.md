# Структура S3-хранилища (MinIO) для MVP

**Принцип:** Иерархическая структура, понятная без базы данных.

## 1. Бакеты (Buckets)

На старте используем **один основной бакет** для упрощения прав доступа, но с четким разделением внутри.

*   **Bucket Name:** `assetcare-mvp`
*   **Access Policy:**
    *   `/public/*` -> Read-only для всех (аватары, промо).
    *   `/requests/*` -> Private (доступ только через presigned URL или n8n).
    *   `/documents/*` -> Private (счета, договора).

---

## 2. Структура Папок (Folders)

### 2.1 Заявки (Requests)
Хранение фото и аудио, присланных клиентами и мастерами.

`requests/{request_id}/{type}_{timestamp}.{ext}`

*   `{request_id}`: ID заявки (напр. `101`).
*   `{type}`: Тип файла (`problem`, `result`, `chat`).
*   `{timestamp}`: Unix timestamp для уникальности.

**Примеры:**
*   `requests/101/problem_1702312345.jpg` (Фото проблемы)
*   `requests/101/problem_audio_1702312345.ogg` (Голосовое)
*   `requests/101/result_1702319999.jpg` (Фото от мастера)

### 2.2 Пользователи (Users)
Документы мастеров и (в будущем) аватарки.

`users/{user_uuid}/{type}_{filename}`

*   `{user_uuid}`: UUID пользователя из Supabase.
*   `{type}`: `doc` (документ), `avatar`.

**Примеры:**
*   `users/550e8400-e29b.../doc_passport.jpg`
*   `users/550e8400-e29b.../doc_license.pdf`

### 2.3 Документы системы (System Documents)
Сгенерированные счета и акты.

`documents/invoices/{year}/{month}/{invoice_number}.pdf`

**Примеры:**
*   `documents/invoices/2025/12/INV-101.pdf`

---

## 3. Политика именования файлов

1.  **Латиница:** Все имена файлов транслитерируются или заменяются на UUID/Timestamp. Никаких пробелов и кириллицы.
2.  **Расширения:** Всегда сохранять оригинальное расширение (`.jpg`, `.pdf`, `.ogg`).
3.  **Конфликты:** При совпадении имен добавляется timestamp.

---

## 4. Связь с Базой Данных

В таблице `request_media` в поле `bucket_path` хранится **полный путь от корня бакета**.

*   Бакет: `assetcare-mvp`
*   Поле `bucket_path`: `requests/101/problem_1702312345.jpg`

Для генерации ссылки в n8n:
`https://minio.assetcare24.de/assetcare-mvp/` + `bucket_path`

