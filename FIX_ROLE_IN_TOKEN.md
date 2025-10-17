# 🔧 Исправление: Роль из базы данных в JWT токене

## ❌ Проблема
JWT токен всегда содержал `ROLE_USER` независимо от роли в базе данных, потому что метод `getRolesForUser()` был жестко закодирован.

## ✅ Решение
Изменили `JwtUtil.java`, чтобы роль бралась из базы данных через `UserService`.

---

## 📝 Изменения в коде

### Файл: `src/main/java/ru/dugaweld/www/config/JwtUtil.java`

**Было:**
```java
private String getRolesForUser(String username) {
    // Для простоты возвращаем роль на основе username
    // В реальном приложении это должно быть из базы данных
    if ("admin".equals(username)) {
        return "ROLE_ADMIN";
    }
    return "ROLE_USER";
}
```

**Стало:**
```java
@Autowired
private UserService userService;

private String getRolesForUser(String username) {
    // Получаем роль из базы данных
    try {
        User user = userService.findByUsername(username);
        if (user != null && user.getRole() != null) {
            return "ROLE_" + user.getRole().name();
        }
    } catch (Exception e) {
        System.err.println("Ошибка получения роли для пользователя " + username + ": " + e.getMessage());
    }
    // По умолчанию возвращаем ROLE_USER
    return "ROLE_USER";
}
```

---

## 🚀 Деплой на сервер

### 1. **Обновите код на сервере**

```bash
# Подключитесь к серверу
ssh user@141.105.71.70

# Перейдите в директорию проекта
cd /path/to/DugaWeldShop

# Получите последние изменения
git pull origin main
```

### 2. **Пересоберите backend**

```bash
# Остановите backend
# (найдите процесс: ps aux | grep java)
# (убейте процесс: kill <PID>)

# Пересоберите проект
./mvnw clean package -DskipTests

# Или используйте ваш скрипт запуска
# ./start-backend.sh
```

### 3. **Перезапустите backend**

```bash
# Запустите backend
./mvnw spring-boot:run &

# Или если используете systemd
sudo systemctl restart dugaweld-backend
```

### 4. **Проверьте, что backend запустился**

```bash
curl http://localhost:8080/health
# Должно вернуть: Backend is healthy!
```

---

## ✅ Проверка после деплоя

### 1. **Очистите токены на клиенте**

Откройте консоль браузера (F12) на `http://141.105.71.70:3000`:

```javascript
// Удалите все старые токены
localStorage.removeItem('dw_admin_token');
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.clear();

console.log('✅ Токены удалены');
location.reload();
```

### 2. **Войдите заново**

- Перейдите на `http://141.105.71.70:3000/admin/login`
- Введите логин: `ArtemP`
- Введите пароль
- Нажмите "Войти"

### 3. **Проверьте токен**

В консоли браузера:

```javascript
const token = localStorage.getItem('dw_admin_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('🔑 Токен:', {
    username: payload.sub,
    role: payload.roles,  // Теперь должно быть ROLE_ADMIN!
    expires: new Date(payload.exp * 1000).toLocaleString()
  });
}
```

**Ожидаемый результат:**
```javascript
🔑 Токен: {
  username: "ArtemP",
  role: "ROLE_ADMIN",  // ← Правильная роль из базы данных!
  expires: "..."
}
```

### 4. **Попробуйте загрузить изображение**

- Перейдите на `/admin/products`
- Выберите товар для редактирования
- Попробуйте загрузить изображение
- Должно работать без ошибки 403! ✅

---

## 🔍 Дополнительная проверка на сервере

### Проверьте роли в базе данных:

```bash
# Подключитесь к PostgreSQL
psql -U postgres -d dugaweld_db

# Проверьте роли пользователей
SELECT id, username, role FROM users;

# Должно показать:
# id | username | role
# ---+----------+-------
#  1 | ArtemP   | ADMIN
#  2 | ArtemKa  | USER
```

### Проверьте логи backend:

```bash
# Смотрите логи на наличие ошибок
tail -f /var/log/dugaweld/backend.log

# Или если используете журнал Spring Boot:
tail -f logs/spring-boot-application.log
```

---

## 🎯 Результат

Теперь JWT токен будет содержать роль **из базы данных**:
- Пользователь с ролью `ADMIN` в БД → токен с `ROLE_ADMIN`
- Пользователь с ролью `USER` в БД → токен с `ROLE_USER`

И загрузка изображений для администраторов заработает! 🎉

---

## 📌 Важные замечания

1. **Выход и вход обязателен** после изменения роли в базе (токен не обновляется автоматически)
2. **Очистка токенов** на клиенте критична для получения нового токена с правильной ролью
3. **Backend должен быть перезапущен** после изменения кода

---

## 🐛 Если проблема осталась

1. Проверьте, что backend перезапущен с новым кодом:
   ```bash
   curl http://localhost:8080/actuator/info
   ```

2. Проверьте логи backend на ошибки:
   ```bash
   grep "ERROR" logs/spring-boot-application.log
   ```

3. Убедитесь, что пользователь действительно имеет роль ADMIN в БД:
   ```sql
   SELECT username, role FROM users WHERE username = 'ArtemP';
   ```

4. Проверьте, что новый токен действительно содержит ROLE_ADMIN (в консоли браузера)

