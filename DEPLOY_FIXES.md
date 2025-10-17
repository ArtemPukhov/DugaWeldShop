# 🚀 Деплой исправлений на стенд

## 🔧 Исправленные проблемы

### 1. **403 Forbidden ошибка**
**Проблема:** SecurityConfig блокировал POST запросы к `/auth/**`
**Решение:** Добавлено разрешение для POST запросов к auth endpoints

### 2. **CORS настройки**
**Проблема:** Неправильные настройки CORS для стенда
**Решение:** Создана отдельная конфигурация CorsConfig

## 📋 Файлы для обновления на стенде

### Backend (Spring Boot):

1. **`src/main/java/ru/dugaweld/www/config/SecurityConfig.java`**
   - Добавлено: `.requestMatchers(HttpMethod.POST, "/auth/**").permitAll()`
   - Добавлено: `/users/**` в список разрешенных путей

2. **`src/main/java/ru/dugaweld/www/config/CorsConfig.java`** (новый файл)
   - Полная конфигурация CORS для всех origins
   - Поддержка всех HTTP методов
   - Разрешение credentials

3. **`src/main/java/ru/dugaweld/www/controllers/HealthController.java`** (новый файл)
   - Тестовые endpoints для проверки работы backend

## 🚀 Команды для деплоя

### 1. **Обновить backend:**
```bash
# На сервере 141.105.71.70
cd /path/to/backend

# Остановить текущий процесс (если запущен)
pkill -f "spring-boot"

# Пересобрать и запустить
./mvnw clean compile
./mvnw spring-boot:run
```

### 2. **Проверить работу backend:**
```bash
# Проверить health endpoint
curl http://141.105.71.70:8080/health

# Проверить auth endpoint
curl -X POST http://141.105.71.70:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","firstName":"Test"}'
```

### 3. **Обновить frontend (если нужно):**
```bash
cd /path/to/frontend
npm run build
npm start
```

## 🧪 Тестирование

### 1. **Проверить backend напрямую:**
```bash
# Health check
curl http://141.105.71.70:8080/health

# Должен вернуть:
# {"status":"UP","timestamp":"2025-10-17T...","message":"Backend is running"}
```

### 2. **Проверить через прокси:**
```bash
# Через Next.js прокси
curl -X POST http://141.105.71.70:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","firstName":"Test"}'
```

### 3. **Проверить в браузере:**
- Открыть `http://141.105.71.70:3000/register`
- Попробовать зарегистрироваться
- Проверить Network tab в DevTools

## 🔍 Отладка

### Если все еще 403 Forbidden:

1. **Проверить логи backend:**
   ```bash
   tail -f logs/application.log
   ```

2. **Проверить, что backend запущен:**
   ```bash
   netstat -tulpn | grep :8080
   ```

3. **Проверить SecurityConfig:**
   - Убедиться, что `/auth/**` и `/users/**` в permitAll()
   - Убедиться, что POST к `/auth/**` разрешен

### Если CORS ошибки:

1. **Проверить CorsConfig:**
   - Убедиться, что `setAllowedOriginPatterns(List.of("*"))`
   - Убедиться, что `setAllowedMethods` включает POST

2. **Проверить браузер:**
   - Открыть DevTools → Network
   - Искать preflight OPTIONS запросы

## ✅ Ожидаемый результат

После применения исправлений:

- ✅ `POST /api/auth/register` возвращает 200 OK
- ✅ `POST /api/auth/login-user` возвращает 200 OK  
- ✅ `GET /api/users/me` работает с JWT токеном
- ✅ Нет CORS ошибок в браузере
- ✅ Регистрация работает в UI
- ✅ Вход в систему работает в UI

## 🚨 Важные моменты

1. **Порядок деплоя:** Сначала backend, потом frontend
2. **Проверка логов:** Всегда смотреть логи после деплоя
3. **Тестирование:** Обязательно тестировать все endpoints
4. **Откат:** Сохранить предыдущую версию для отката при проблемах

## 📞 Поддержка

Если проблемы остаются:
1. Проверить логи backend
2. Проверить Network tab в браузере
3. Убедиться, что все файлы обновлены
4. Проверить переменные окружения
