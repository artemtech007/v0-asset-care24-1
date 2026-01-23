# 🔧 Настройка Supabase Environment Variables

## 📋 Что нужно сделать

Создать файл `.env.local` в папке `/site/` со следующими переменными:

```bash
# Создать файл
touch site/.env.local
```

## 📝 Содержимое .env.local

```env
# Supabase Configuration
# Получить эти значения из Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 🔑 Где взять значения

### 1. Зайти в Supabase Dashboard
```
https://supabase.com/dashboard
```

### 2. Выбрать проект AssetCare24
```
Project: assetcare24 (или ваш project name)
```

### 3. Перейти в Settings → API
```
Project URL: https://abcdefghijklmnop.supabase.co
Project API keys:
├── anon public
├── service_role secret
```

### 4. Скопировать ключи
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # anon public key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # service_role secret key
```

## ⚠️ Важно

- **anon public key** - для клиентской стороны (Row Level Security)
- **service_role secret key** - для серверной стороны (полные права для админ API)
- Никогда не коммитить `.env.local` в git
- `.env.local` уже добавлен в `.gitignore`

## ✅ Проверка настройки

После добавления переменных перезапустить dev сервер:

```bash
cd site
npm run dev
```

Если есть ошибки подключения - проверить корректность URL и ключей в Supabase Dashboard.
