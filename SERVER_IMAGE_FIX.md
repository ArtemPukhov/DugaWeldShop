# 🖼️ Исправление: Загрузка изображений на сервере

## ❌ Проблема
Next.js на сервере не мог загрузить изображения из MinIO, потому что IP-адрес сервера `141.105.71.70:9000` не был указан в `remotePatterns`.

**Ошибка:**
```
GET http://141.105.71.70:3000/_next/image?url=http://141.105.71.70:9000/dugaweld-images/...
Status: 400 Bad Request
```

## ✅ Решение
Добавили IP-адрес сервера в конфигурацию `next.config.ts`.

---

## 📝 Изменения в коде

### Файл: `frontend/next.config.ts`

**Добавлено:**
```typescript
{
  protocol: 'http',
  hostname: '141.105.71.70',
  port: '9000',
  pathname: '/dugaweld-images/**',
},
```

**Полная конфигурация `images`:**
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '9000',
      pathname: '/dugaweld-images/**',
    },
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '9000',
      pathname: '/dugaweld-images/**',
    },
    {
      protocol: 'http',
      hostname: '141.105.71.70',  // ← Добавлен IP сервера
      port: '9000',
      pathname: '/dugaweld-images/**',
    },
    {
      protocol: 'https',
      hostname: '**',
    },
  ],
},
```

---

## 🚀 Деплой на сервер

### 1. **Закоммитьте изменения**

Локально выполните:
```bash
git add frontend/next.config.ts
git commit -m "fix: add server IP to Next.js image remotePatterns"
git push origin main
```

### 2. **Обновите код на сервере**

```bash
# Подключитесь к серверу
ssh user@141.105.71.70

# Перейдите в директорию проекта
cd /path/to/DugaWeldShop

# Получите изменения
git pull origin main
```

### 3. **Перезапустите frontend**

```bash
# Перейдите в директорию frontend
cd frontend

# Остановите текущий процесс (если запущен через pm2)
pm2 stop dugaweld-frontend

# Пересоберите приложение
npm run build

# Запустите заново
pm2 start npm --name "dugaweld-frontend" -- start

# ИЛИ если используется простой npm:
# Остановите процесс (Ctrl+C)
# npm run build
# npm start
```

### 4. **Проверьте изменения**

```bash
# Проверьте статус
pm2 status

# Посмотрите логи
pm2 logs dugaweld-frontend
```

---

## ✅ Проверка после деплоя

### 1. **Откройте страницу товаров**

Перейдите на:
```
http://141.105.71.70:3000/admin/products
```

### 2. **Проверьте изображения**

- Изображения должны загружаться без ошибок 400
- Проверьте консоль браузера (F12) - не должно быть ошибок

### 3. **Проверьте Network в DevTools**

Запросы к изображениям должны выглядеть так:
```
Request URL: http://141.105.71.70:3000/_next/image?url=http://141.105.71.70:9000/dugaweld-images/...
Status Code: 200 OK  ← Теперь должно быть 200!
```

---

## 🔍 Дополнительные проверки

### Проверьте доступность MinIO на сервере:

```bash
# Проверьте, что MinIO запущен
curl http://141.105.71.70:9000/minio/health/live

# Проверьте доступность бакета
curl -I http://141.105.71.70:9000/dugaweld-images/
```

### Проверьте логи frontend:

```bash
# Если используется pm2
pm2 logs dugaweld-frontend --lines 50

# Или обычные логи Node.js
tail -f logs/frontend.log
```

---

## 📌 Важные замечания

1. **После изменения `next.config.ts` нужен rebuild:**
   - `npm run build` обязателен!
   - Просто перезапуск `npm start` без rebuild **не подхватит изменения**

2. **Если используется Docker:**
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

3. **Если изображения все равно не загружаются:**
   - Проверьте, что MinIO доступен на порту 9000
   - Проверьте firewall: `sudo ufw status`
   - Убедитесь, что бакет `dugaweld-images` существует и публичный

---

## 🎯 Результат

Теперь Next.js Image Component может загружать изображения из MinIO на сервере:
- ✅ `localhost:9000` (локальная разработка)
- ✅ `127.0.0.1:9000` (localhost альтернатива)
- ✅ `141.105.71.70:9000` (production сервер)
- ✅ `https://**` (любые HTTPS источники)

---

## 🐛 Если проблема осталась

### Проверьте Next.js версию и синтаксис:

```bash
cd frontend
npm list next
```

Если Next.js < 12.3.0, используйте старый синтаксис `domains` вместо `remotePatterns`:

```typescript
images: {
  domains: ['localhost', '127.0.0.1', '141.105.71.70'],
}
```

### Проверьте MinIO CORS:

MinIO должен разрешать CORS для frontend:

```bash
# Подключитесь к MinIO CLI
mc alias set myminio http://141.105.71.70:9000 admin your_password

# Установите CORS
mc anonymous set-json cors.json myminio/dugaweld-images
```

Файл `cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://141.105.71.70:3000"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"]
    }
  ]
}
```

---

## 📚 Связанные файлы

- `frontend/next.config.ts` - конфигурация Next.js
- `FIX_ROLE_IN_TOKEN.md` - исправление ролей в токене
- `MULTIPLE_IMAGES_GUIDE.md` - документация по множественным изображениям

