#!/bin/bash
# Скрипт для восстановления n8n из бэкапа
# Использование: cd /root/backup_YYYYMMDD_HHMMSS && ./restore.sh

set -e

echo "=== Восстановление n8n из бэкапа ==="

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "Docker не установлен!"
    exit 1
fi

# Остановка существующих контейнеров
echo "Останавливаем существующие контейнеры..."
docker compose down || docker-compose down || true

# Восстановление volumes
echo "Восстанавливаем n8n данные..."
docker run --rm -v bcogk4gsskcc8880k4kc0ogs_n8n-data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/n8n-data.tar.gz"

echo "Восстанавливаем PostgreSQL данные..."
docker run --rm -v bcogk4gsskcc8880k4kc0ogs_postgresql-data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/postgresql-data.tar.gz"

# Запуск сервисов
echo "Запускаем сервисы..."
docker compose up -d || docker-compose up -d

echo "=== Восстановление завершено ==="
echo "Проверьте статус: docker compose ps"
echo "Логи: docker compose logs -f n8n"
