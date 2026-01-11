# Настройка SSH-доступа к серверу assetcare24.de

## Обзор
Эта инструкция описывает процесс настройки безопасного SSH-доступа к серверу assetcare24.de без использования пароля.

**Сервер:** `167.17.180.178`
**Пользователь:** `root`
**Пароль:** `GeV8Y2Q4wHeA3qO`
**Email:** `info@assetcare24.de`

## Шаг 1: Подготовка (очистка known_hosts)
Если ранее был доступ к этому серверу, удалите старые ключи хоста:

```bash
ssh-keygen -f ~/.ssh/known_hosts -R 167.17.180.178
```

## Шаг 2: Принудительное подключение по паролю
Подключитесь к серверу, принудительно используя парольную аутентификацию:

```bash
ssh -o PasswordAuthentication=yes -o PubkeyAuthentication=no -o IdentitiesOnly=no -o StrictHostKeyChecking=accept-new root@167.17.180.178
```

**При первом подключении:**
- Система покажет fingerprint ключа сервера
- Введите пароль: `GeV8Y2Q4wHeA3qO`
- Подтвердите добавление ключа хоста в known_hosts

## Шаг 3: Проверка доступа по паролю
Убедитесь, что подключение работает:

```bash
ssh -o PasswordAuthentication=yes -o PubkeyAuthentication=no root@167.17.180.178 'echo "Подключение успешно! Сервер: $(hostname), Пользователь: $(whoami)"'
```

## Шаг 4: Создание SSH-ключа
Создайте новый RSA-ключ для assetcare24.de:

```bash
ssh-keygen -t rsa -b 4096 -C "info@assetcare24.de" -f ~/.ssh/assetcare24 -N ""
```

**Результат:**
- Приватный ключ: `~/.ssh/assetcare24`
- Публичный ключ: `~/.ssh/assetcare24.pub`

## Шаг 5: Получение публичного ключа
Скопируйте публичный ключ для настройки на сервере:

```bash
cat ~/.ssh/assetcare24.pub
```

**Пример вывода:**
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDsGDv5+eVfJLHEro/WsekK1nwGl/b7zZYZU0ZCa9HyeK4OfQ1wT5n8EabApPx5cZoOjpMZwup/I9uIXwVf8xEKFW1tZgQ0UtYqdP66Oc2PcgFg7HQM/MPabKHxCgzs6cdnsO8zp8eOh+Oz6SaF9DkF/8Pg51SPF2k1OwaxRpNDjqej4yxMdxHeHREmH3s1njtIMqjTlCmF+BDVkkNF2IQCJVg4bNvPwtCnIFshNeXsPHTn8LRub+Af3yKTq4awUpm0urR6fW68KvcRorocqubezUg9r+zTAUcy+heSXLrZZtHod9Fdux1yxdFuZuc8bTFeO00pPmjj6nrk5XQda3NuWDWfOhO/m7uSDZsJ7IYdZGuTEuw5LoKxGMGS05GgtbZXbfxmv6REIrVdkGHWOuCUPObwKvaljUKkIcPtw3ONAe4bxZRsh8HZauHso50mB1Lj22VNKezVQC5Vq0yVfv/q8tIIlRF0pVTyCKW5O+zdIUeqdJlEwxXlH5NPYz7TcfNqPpvZeTitUCC0t/VEVRJG63B4UOiTqWYFO3z1qf/w5ubOGKp9NXhRpcJKczZHqKm/d1httDGpRNFBqcRwuQv6+ywprDb2W8Os7wGOiSdk4rjQcvpbtcKQnkh2dI9E4+n2N/52Ru5t0mF2MNXEVVhYKXSAlUWtKicXgFF7iBGddw== info@assetcare24.de
```

## Шаг 6: Настройка ключа на сервере
Добавьте публичный ключ на сервер. **Замените `[PUBLIC_KEY]` на содержимое из Шага 5:**

```bash
sshpass -p 'GeV8Y2Q4wHeA3qO' ssh -o StrictHostKeyChecking=accept-new root@167.17.180.178 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '[PUBLIC_KEY]' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'SSH-ключ успешно добавлен'"
```

Или выполните команды на сервере вручную после подключения:

```bash
# На сервере выполнить:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "[PUBLIC_KEY]" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Шаг 7: Проверка доступа по ключу
Проверьте, что SSH-доступ работает без пароля:

```bash
ssh -i ~/.ssh/assetcare24 -o StrictHostKeyChecking=accept-new root@167.17.180.178 'echo "✅ Доступ по ключу работает! Сервер: $(hostname), Пользователь: $(whoami), Время: $(date)"'
```

## Шаг 8: Финальная проверка
Подключитесь к серверу для полной проверки:

```bash
ssh -i ~/.ssh/assetcare24 root@167.17.180.178
```

## Быстрые команды (для повторного использования)

### Подключение с паролем:
```bash
ssh -o PasswordAuthentication=yes -o PubkeyAuthentication=no -o StrictHostKeyChecking=accept-new root@167.17.180.178
```

### Подключение по ключу:
```bash
ssh -i ~/.ssh/assetcare24 root@167.17.180.178
```

### Проверка статуса:
```bash
ssh -i ~/.ssh/assetcare24 root@167.17.180.178 'uptime && whoami && hostname'
```

## Безопасность
- Никогда не храните пароль в скриптах
- Используйте сложные ключи (минимум 4096 бит)
- Регулярно проверяйте authorized_keys на сервере
- Рассмотрите отключение парольной аутентификации после настройки ключей

## Устранение неполадок

### "Too many authentication failures"
Сервер блокирует попытки входа. Подождите 10-15 секунд и попробуйте снова. Либо слишком много ключей на локальном компьютере - нужно удалить неактуальные. До нужного ключа просто не доходит очередь

### "Permission denied (publickey,password)"
Проверьте правильность публичного ключа в authorized_keys.

### "REMOTE HOST IDENTIFICATION HAS CHANGED"
Удалите старый ключ сервера: `ssh-keygen -f ~/.ssh/known_hosts -R 167.17.180.178`

---

**Создано:** 2025-12-04 17:58:03
**Последнее обновление:** 2025-12-04 17:58:03
