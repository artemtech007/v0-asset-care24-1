# Бэкап n8n assetcare24.de

## Общая информация
- **Дата создания:** 2025-12-04 15:26:30 UTC
- **Сервер:** r1072942 (167.17.180.178)
- **Версия n8n:** 1.119.2
- **Платформа:** Coolify 4.0.0-beta.452
- **База данных:** PostgreSQL 16-alpine
- **Размер бэкапа:** ~7.5 MB

## Содержимое бэкапа

### Конфигурационные файлы
- `docker-compose.yml` - конфигурация n8n + PostgreSQL
- `.env` - переменные окружения
- `.env.production` - production настройки

### SSL и прокси
- `ssl/` - SSL сертификаты
- `proxy/` - конфигурация Traefik/Caddy
- `proxy_docker-compose.yml` - конфигурация прокси

### Данные
- `n8n-data.tar.gz` - данные n8n (128B - новые установки обычно небольшие)
- `postgresql-data.tar.gz` - база данных PostgreSQL (50.74MB)

### Система
- `system_info.txt` - информация о системе и статус контейнеров
- `restore.sh` - скрипт для восстановления
- `coolify_config/` - конфигурации Coolify

## Восстановление системы

### Предварительные требования
- Ubuntu/Debian сервер с Docker
- Доступ root по SSH
- Свободное место: минимум 10GB

### Шаги восстановления

1. **Скопировать бэкап на новый сервер:**
   ```bash
   scp -r /home/aaa/Projects/n8n/assetcare24/backup_20251204_152548 root@NEW_SERVER:/root/
   ```

2. **Перейти в директорию бэкапа:**
   ```bash
   cd /root/backup_20251204_152548
   ```

3. **Запустить восстановление:**
   ```bash
   ./restore.sh
   ```

4. **Проверить статус:**
   ```bash
   docker compose ps
   docker compose logs -f n8n
   ```

## Важные замечания

### Переменные окружения
Проверьте `.env` файл перед восстановлением:
- `SERVICE_URL_N8N_5678` - должен указывать на ваш домен
- `DB_POSTGRESDB_PASSWORD` - пароль БД
- SSL сертификаты могут потребовать обновления

### Домены и SSL
- Домашний URL: `https://assetcare24.org:5678`
- SSL: Let's Encrypt (автоматическое обновление через Traefik)

### Безопасность
- Пароли в `.env` файлах - хранить securely
- SSH доступ настроен по ключу `assetcare24`
- Firewall правила могут потребовать настройки

## Мониторинг после восстановления

```bash
# Статус контейнеров
docker compose ps

# Логи n8n
docker compose logs -f n8n

# Логи PostgreSQL
docker compose logs -f postgresql

# Проверка доступности
curl -I https://assetcare24.org:5678/
```

## Резервное копирование (рекомендации)

### Автоматическое бэкапирование
```bash
# Создать cron job для ежедневного бэкапа
crontab -e
# Добавить: 0 2 * * * /path/to/backup_script.sh
```

### Что бэкапировать регулярно
- `/data/coolify/services/*/docker-compose.yml`
- `/data/coolify/services/*/.env*`
- Docker volumes: `bcogk4gsskcc8880k4kc0ogs_n8n-data`, `bcogk4gsskcc8880k4kc0ogs_postgresql-data`
- SSL сертификаты: `/data/coolify/ssl/`

---

**Создано автоматически при бэкапе системы n8n assetcare24.de**
