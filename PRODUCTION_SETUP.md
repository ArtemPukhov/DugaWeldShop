# 🚀 Настройка продакшн сервера

## 🔧 Проблема
На продакшн сервере фронтенд работает на порту 3000, но обращается к API на том же порту, что вызывает ошибку 404.

## ✅ Решение
Настроить правильный URL для Spring Boot API на порту 8080.

### Текущая ситуация:
```
❌ http://141.105.71.70:3000/api/files/image.png (404 Not Found)
✅ http://141.105.71.70:8080/api/files/image.png (Spring Boot API)
```

## 🛠 Настройка

### 1. Переменные окружения

Создайте файл `.env.production` в папке `frontend/`:

```bash
# Продакшн конфигурация
NEXT_PUBLIC_API_BASE_URL=http://141.105.71.70:8080
NODE_ENV=production
```

### 2. Альтернативный способ - системные переменные

Установите переменные окружения на сервере:

```bash
export NEXT_PUBLIC_API_BASE_URL=http://141.105.71.70:8080
export NODE_ENV=production
```

### 3. Docker конфигурация

Если используете Docker, добавьте в `docker-compose.yml`:

```yaml
services:
  frontend:
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://141.105.71.70:8080
      - NODE_ENV=production
```

### 4. Nginx конфигурация

Если используете Nginx, добавьте проксирование:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Фронтенд на порту 3000
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # API на порту 8080
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔍 Проверка настройки

### 1. Проверка переменных окружения:

```javascript
// В браузере откройте DevTools и выполните:
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);
```

### 2. Проверка URL изображений:

```javascript
import { debugImageUrl } from '@/lib/imageUtils';

const debug = debugImageUrl('test-image.jpg');
console.log('Debug info:', debug);
// Должно показать: baseUrl: "http://141.105.71.70:8080"
```

### 3. Проверка доступности API:

```bash
# На сервере проверьте доступность API
curl -I http://141.105.71.70:8080/api/files/test-image.jpg
# Должен вернуть: HTTP/1.1 200 OK или 404 Not Found
```

## 📊 Архитектура

### Локальная разработка:
```
Frontend (localhost:3000) → API (localhost:8080)
```

### Продакшн сервер:
```
Frontend (141.105.71.70:3000) → API (141.105.71.70:8080)
```

### После настройки:
```
Frontend (141.105.71.70:3000) → API (141.105.71.70:8080) ✅
```

## 🚨 Частые проблемы

### 1. Ошибка 404 на изображениях:
- **Причина**: Неправильный URL API
- **Решение**: Установите `NEXT_PUBLIC_API_BASE_URL=http://141.105.71.70:8080`

### 2. CORS ошибки:
- **Причина**: API не настроен для кросс-доменных запросов
- **Решение**: Проверьте SecurityConfig.java (уже настроен)

### 3. Медленная загрузка:
- **Причина**: Нет кэширования
- **Решение**: API уже настроен с кэшированием на 1 час

## 🔧 Отладка

### 1. Логи фронтенда:
```bash
# Проверьте логи Next.js
tail -f /path/to/frontend/logs/next.log
```

### 2. Логи Spring Boot:
```bash
# Проверьте логи Spring Boot
tail -f /path/to/spring-boot/logs/application.log
```

### 3. Сетевые запросы:
```javascript
// В браузере откройте Network tab и проверьте:
// 1. URL запросов к изображениям
// 2. Статус ответов (должен быть 200 OK)
// 3. Время загрузки
```

## 📱 Мобильная проверка

### 1. Проверка на мобильном устройстве:
```javascript
// Откройте DevTools на мобильном и выполните:
import { debugImageUrl } from '@/lib/imageUtils';

const debug = debugImageUrl('test-image.jpg');
console.log('Mobile debug:', debug);
// Проверьте isMobile: true и правильный baseUrl
```

### 2. Проверка доступности:
```javascript
import { checkImageAvailability } from '@/lib/imageUtils';

checkImageAvailability('http://141.105.71.70:8080/api/files/test-image.jpg')
  .then(result => console.log('Availability:', result));
```

## 🚀 Автоматизация

### 1. Скрипт проверки:
```bash
#!/bin/bash
# check-api.sh

echo "Проверка API доступности..."
curl -s -o /dev/null -w "%{http_code}" http://141.105.71.70:8080/api/files/test.jpg

echo "Проверка переменных окружения..."
echo "NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"
echo "NODE_ENV: $NODE_ENV"
```

### 2. Мониторинг:
```bash
# Добавьте в cron для регулярной проверки
*/5 * * * * /path/to/check-api.sh
```

## 💡 Рекомендации

### 1. Для разработчиков:
- ✅ Всегда тестируйте на продакшн сервере
- ✅ Используйте переменные окружения
- ✅ Мониторьте логи на предмет ошибок
- ✅ Проверяйте доступность API

### 2. Для администраторов:
- ✅ Настройте мониторинг API
- ✅ Регулярно проверяйте доступность
- ✅ Ведите логи ошибок
- ✅ Настройте алерты при проблемах

---

**💡 Помните**: Правильная настройка URL API критически важна для работы изображений на продакшн сервере!
