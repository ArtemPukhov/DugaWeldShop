# Развертывание множественных изображений на сервере

## 🌐 Как это работает на продакшене

### Архитектура

```
Клиент (браузер)
    ↓
Next.js Frontend (порт 3000)
    ↓
Backend API (порт 8080)
    ↓
MinIO (порт 9000)
    ↓
PostgreSQL (порт 5432)
```

## 📝 Настройки для сервера

### 1. Backend (Spring Boot)

#### `application.yaml` на сервере:

```yaml
minio:
  endpoint: http://localhost:9000  # или http://your-server-ip:9000
  access-key: ${MINIO_ACCESS_KEY}   # Из переменных окружения
  secret-key: ${MINIO_SECRET_KEY}   # Из переменных окружения
  bucket-name: dugaweld-images

spring:
  servlet:
    multipart:
      max-file-size: 20MB
      max-request-size: 20MB
```

#### Переменные окружения:

```bash
export MINIO_ACCESS_KEY=your_minio_access_key
export MINIO_SECRET_KEY=your_minio_secret_key
```

### 2. Frontend (Next.js)

#### `next.config.ts` для продакшена:

```typescript
const API_TARGET = process.env.NEXT_PUBLIC_API_TARGET || "http://localhost:8080";
const MINIO_ENDPOINT = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || "http://localhost:9000";

const nextConfig = {
  images: {
    remotePatterns: [
      // Локальная разработка
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/dugaweld-images/**',
      },
      // Продакшен MinIO
      {
        protocol: 'http',
        hostname: 'your-server-ip',  // Замените на IP сервера
        port: '9000',
        pathname: '/dugaweld-images/**',
      },
      {
        protocol: 'https',
        hostname: 'your-domain.com',  // Если используете домен
        pathname: '/minio/**',
      },
      // Разрешить все HTTPS
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // ... остальные настройки
};
```

#### `.env.production`:

```bash
NEXT_PUBLIC_API_TARGET=http://your-server-ip:8080
NEXT_PUBLIC_MINIO_ENDPOINT=http://your-server-ip:9000
```

### 3. Nginx конфигурация

Если используете Nginx как reverse proxy:

```nginx
# /etc/nginx/sites-available/dugaweld

server {
    listen 80;
    server_name your-domain.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Увеличиваем лимиты для загрузки файлов
        client_max_body_size 20M;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # MinIO (опционально, можно использовать прямое подключение)
    location /minio/ {
        proxy_pass http://localhost:9000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS заголовки для изображений
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
    }
}
```

### 4. Docker Compose (если используете)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: dugaweld_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  backend:
    build: .
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/dugaweld_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
    depends_on:
      - postgres
      - minio
    ports:
      - "8080:8080"

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_TARGET: http://backend:8080
      NEXT_PUBLIC_MINIO_ENDPOINT: http://minio:9000
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  minio_data:
```

## 🚀 Варианты развертывания

### Вариант 1: Все на одном сервере (самый простой)

```bash
# 1. MinIO доступен на localhost:9000
# 2. Backend на localhost:8080
# 3. Frontend на localhost:3000
# 4. Nginx проксирует все на порт 80/443
```

**Плюсы:** Просто настроить, все в одном месте  
**Минусы:** Меньше масштабируемости

**Настройки:**
- Frontend `next.config.ts`: используйте localhost
- Backend может напрямую обращаться к MinIO через localhost
- Nginx проксирует все запросы

### Вариант 2: MinIO на отдельном сервере / S3-совместимом хранилище

```bash
# 1. MinIO на minio.your-domain.com (или S3)
# 2. Backend на api.your-domain.com
# 3. Frontend на your-domain.com
```

**Плюсы:** Лучшая масштабируемость, можно использовать CDN  
**Минусы:** Сложнее настроить

**Настройки:**

```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'minio.your-domain.com',
      pathname: '/dugaweld-images/**',
    },
  ],
}
```

```yaml
# application.yaml
minio:
  endpoint: https://minio.your-domain.com
  # или используйте S3
  # endpoint: https://s3.amazonaws.com
```

### Вариант 3: Использование CDN

```bash
# 1. MinIO/S3 → CloudFront/CloudFlare CDN
# 2. Изображения загружаются через CDN
```

**Плюсы:** Максимальная производительность  
**Минусы:** Дополнительные затраты

## 🔧 Пошаговая инструкция развертывания

### Шаг 1: Подготовка сервера

```bash
# Установите необходимое ПО
sudo apt update
sudo apt install -y docker docker-compose nginx

# Создайте директории
mkdir -p /opt/dugaweld/{backend,frontend,minio}
```

### Шаг 2: Настройка MinIO

```bash
# Запустите MinIO через Docker
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=your_access_key" \
  -e "MINIO_ROOT_PASSWORD=your_secret_key" \
  -v /opt/dugaweld/minio:/data \
  minio/minio server /data --console-address ":9001"

# Создайте bucket через MinIO Console
# Откройте http://your-server-ip:9001
# Войдите с credentials
# Создайте bucket "dugaweld-images"
# Установите политику доступа: Public (для чтения)
```

### Шаг 3: Настройка Backend

```bash
cd /opt/dugaweld/backend

# Скопируйте jar файл
scp target/dugaweld-backend.jar user@server:/opt/dugaweld/backend/

# Создайте systemd service
sudo nano /etc/systemd/system/dugaweld-backend.service
```

```ini
[Unit]
Description=DugaWeld Backend
After=network.target postgresql.service minio.service

[Service]
Type=simple
User=dugaweld
WorkingDirectory=/opt/dugaweld/backend
Environment="MINIO_ENDPOINT=http://localhost:9000"
Environment="MINIO_ACCESS_KEY=your_access_key"
Environment="MINIO_SECRET_KEY=your_secret_key"
ExecStart=/usr/bin/java -jar dugaweld-backend.jar
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable dugaweld-backend
sudo systemctl start dugaweld-backend
```

### Шаг 4: Настройка Frontend

```bash
cd /opt/dugaweld/frontend

# Скопируйте файлы
scp -r frontend/* user@server:/opt/dugaweld/frontend/

# Обновите .env.production
echo "NEXT_PUBLIC_API_TARGET=http://your-server-ip:8080" > .env.production
echo "NEXT_PUBLIC_MINIO_ENDPOINT=http://your-server-ip:9000" >> .env.production

# Соберите продакшен версию
npm install
npm run build

# Запустите через PM2
npm install -g pm2
pm2 start npm --name "dugaweld-frontend" -- start
pm2 save
pm2 startup
```

### Шаг 5: Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/dugaweld
```

Используйте конфигурацию из раздела "Nginx конфигурация" выше.

```bash
sudo ln -s /etc/nginx/sites-available/dugaweld /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 6: Настройка SSL (опционально, но рекомендуется)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔒 Безопасность

### 1. MinIO Access Policy

Настройте bucket policy для публичного чтения, но приватной записи:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::dugaweld-images/*"]
    }
  ]
}
```

### 2. Firewall правила

```bash
# Разрешите только необходимые порты
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH

# Закройте прямой доступ к внутренним сервисам
# MinIO, Backend, PostgreSQL должны быть доступны только через Nginx или localhost
```

### 3. Environment Variables

```bash
# Никогда не коммитьте credentials в git!
# Используйте .env файлы или переменные окружения

# /opt/dugaweld/.env
MINIO_ACCESS_KEY=xxxxx
MINIO_SECRET_KEY=xxxxx
POSTGRES_PASSWORD=xxxxx
JWT_SECRET=xxxxx
```

## 📊 Мониторинг

### Проверка работоспособности

```bash
# Backend
curl http://localhost:8080/health

# MinIO
curl http://localhost:9000/minio/health/live

# Frontend
curl http://localhost:3000

# Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Логи

```bash
# Backend logs
journalctl -u dugaweld-backend -f

# Frontend logs (PM2)
pm2 logs dugaweld-frontend

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# MinIO logs
docker logs -f minio
```

## 🐛 Устранение неполадок

### Изображения не загружаются (403 Forbidden)

1. Проверьте JWT токен и роль пользователя
2. Убедитесь, что MinIO доступен из backend
3. Проверьте bucket policy в MinIO

### Изображения не отображаются

1. Проверьте `next.config.ts` - добавлен ли hostname сервера
2. Проверьте CORS настройки в MinIO
3. Проверьте, что MinIO возвращает presigned URLs с правильным hostname

### Ошибка 413 (Request Entity Too Large)

Увеличьте лимиты:

```nginx
# В nginx.conf
client_max_body_size 20M;
```

```yaml
# В application.yaml
spring:
  servlet:
    multipart:
      max-file-size: 20MB
      max-request-size: 20MB
```

## 📦 Обновление на сервере

```bash
# 1. Backend
cd /opt/dugaweld/backend
scp target/dugaweld-backend.jar user@server:/opt/dugaweld/backend/
sudo systemctl restart dugaweld-backend

# 2. Frontend
cd /opt/dugaweld/frontend
git pull origin main
npm install
npm run build
pm2 restart dugaweld-frontend

# 3. Применение миграций БД
# Миграции Liquibase применятся автоматически при запуске backend
```

## ✅ Чек-лист развертывания

- [ ] MinIO установлен и запущен
- [ ] Bucket `dugaweld-images` создан
- [ ] Bucket policy настроена (public read)
- [ ] PostgreSQL установлен и настроен
- [ ] Backend собран и запущен
- [ ] Миграции БД применены
- [ ] Frontend собран (npm run build)
- [ ] Frontend запущен (PM2)
- [ ] Nginx настроен и запущен
- [ ] SSL сертификат установлен (если нужен)
- [ ] Firewall настроен
- [ ] Переменные окружения установлены
- [ ] Проверен вход под admin
- [ ] Проверена загрузка изображений
- [ ] Проверено отображение галереи

## 📞 Поддержка

При возникновении проблем проверьте:
1. Логи всех сервисов
2. Настройки firewall
3. CORS конфигурацию
4. JWT токен и роль пользователя
5. MinIO доступность и bucket policy

