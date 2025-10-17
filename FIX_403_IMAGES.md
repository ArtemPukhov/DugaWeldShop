# Исправление ошибки 403 при загрузке изображений товаров

## Проблема

При попытке загрузить изображения товаров через админ-панель возникала ошибка **403 Forbidden**.

## Причины

1. **Конфликт правил безопасности в SecurityConfig:**
   - Правило `.requestMatchers("/products/**").permitAll()` было слишком общим и перекрывало более специфичные правила для POST/PUT/DELETE запросов
   - JWT токен не передавался через Next.js API routes к backend

2. **Отсутствие передачи токена авторизации:**
   - Frontend компонент не передавал токен в заголовке Authorization
   - API routes не проксировали токен к backend

## Исправления

### 1. SecurityConfig.java

**Было:**
```java
.requestMatchers(
    "/auth/**",
    "/users/**",
    "/v3/api-docs/**",
    "/swagger-ui/**",
    "/swagger-ui.html",
    "/products/**",      // ❌ Слишком общее правило
    "/categories/**",    // ❌ Слишком общее правило
    "/orders/**"
).permitAll()
```

**Стало:**
```java
.requestMatchers(
    "/auth/**",
    "/users/**",
    "/v3/api-docs/**",
    "/swagger-ui/**",
    "/swagger-ui.html"
).permitAll()
// GET запросы разрешены для всех
.requestMatchers(HttpMethod.GET, "/**").permitAll()
// POST/PUT/DELETE только для ADMIN
.requestMatchers(HttpMethod.POST, "/products/**").hasAuthority("ROLE_ADMIN")
.requestMatchers(HttpMethod.PUT, "/products/**").hasAuthority("ROLE_ADMIN")
.requestMatchers(HttpMethod.DELETE, "/products/**").hasAuthority("ROLE_ADMIN")
```

### 2. Frontend API Routes

**Файлы:**
- `frontend/app/api/products/[productId]/images/route.ts`
- `frontend/app/api/products/images/[imageId]/route.ts`

**Добавлено:**
```typescript
import { cookies } from 'next/headers';

// Получаем токен из cookies или headers
const cookieStore = await cookies();
const accessToken = cookieStore.get('accessToken')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '');

const headers: HeadersInit = {};
if (accessToken) {
  headers['Authorization'] = `Bearer ${accessToken}`;
}

// Передаем токен в запрос к backend
const response = await fetch(`${API_BASE}/products/${productId}/images`, {
  method: 'POST',
  headers,
  body: formData,
});
```

### 3. ProductImagesManager Component

**Файл:** `frontend/components/ProductImagesManager.tsx`

**Добавлено во все методы (fetchImages, handleFileUpload, handleDelete):**
```typescript
const accessToken = localStorage.getItem('accessToken');
const headers: HeadersInit = {};

if (accessToken) {
  headers['Authorization'] = `Bearer ${accessToken}`;
}

const response = await fetch(url, {
  method: 'POST', // или GET/DELETE
  headers,
  body: formData, // для POST
});
```

## Как применить исправления

### На локальной машине:

1. Файлы уже обновлены в вашем проекте
2. Перезапустите backend:
   ```bash
   cd D:\Programming\DugaWeldShop
   ./mvnw.cmd spring-boot:run
   ```
3. Перезапустите frontend (если он уже запущен):
   ```bash
   cd frontend
   # Ctrl+C чтобы остановить
   npm run dev
   ```

### На сервере (staging):

1. **Обновите backend:**
   ```bash
   cd /путь/к/проекту
   git pull origin main
   # Остановите backend
   ./mvnw spring-boot:run # или systemctl restart dugaweld-backend
   ```

2. **Обновите frontend:**
   ```bash
   cd frontend
   git pull origin main
   npm install
   npm run build
   # Перезапустите PM2 или Docker контейнер
   pm2 restart dugaweld-frontend
   ```

## Проверка работоспособности

1. Войдите в админ-панель: `http://localhost:3000/admin/products`
2. Выберите товар и нажмите "Изменить"
3. Прокрутите вниз до секции "Изображения товара"
4. Нажмите "Загрузить изображения"
5. Выберите один или несколько файлов
6. Изображения должны успешно загрузиться

## Диагностика

Если проблема сохраняется:

1. **Проверьте токен в браузере:**
   - Откройте DevTools → Application → Local Storage
   - Убедитесь, что есть ключ `accessToken`

2. **Проверьте Network запрос:**
   - DevTools → Network → найдите запрос к `/api/products/{id}/images`
   - Во вкладке Headers должен быть заголовок `Authorization: Bearer {token}`

3. **Проверьте роль пользователя:**
   ```bash
   # В базе данных
   SELECT username, role FROM users WHERE username = 'ваш_логин';
   ```
   - Роль должна быть `ADMIN` (не `USER`)

4. **Проверьте логи backend:**
   ```bash
   # Ищите ошибки авторизации
   tail -f logs/application.log
   ```

## Технические детали

### Порядок проверки Spring Security:

1. ✅ `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` - preflight запросы
2. ✅ `.requestMatchers(HttpMethod.GET, "/**").permitAll()` - все GET запросы
3. ✅ `.requestMatchers(HttpMethod.POST, "/orders/**").permitAll()` - заказы без авторизации
4. ✅ `.requestMatchers(HttpMethod.POST, "/auth/**").permitAll()` - авторизация
5. 🔒 `.requestMatchers(HttpMethod.POST, "/products/**").hasAuthority("ROLE_ADMIN")` - работа с товарами
6. 🔒 Остальные POST/PUT/DELETE требуют ADMIN

### Эндпоинты изображений:

- `POST /products/{productId}/images` - добавление изображения (требует ADMIN)
- `GET /products/{productId}/images` - получение изображений (доступно всем)
- `DELETE /products/images/{imageId}` - удаление изображения (требует ADMIN)

## Что изменилось

### ✅ Было исправлено:
- Конфликт правил безопасности в SecurityConfig
- Передача токена через API routes
- Передача токена из компонента ProductImagesManager

### ✅ Что теперь работает:
- Загрузка нескольких изображений к товару
- Удаление изображений товара
- Просмотр галереи изображений на странице товара
- Корректная авторизация админа

## Дополнительная информация

Подробное руководство по работе с изображениями: `MULTIPLE_IMAGES_GUIDE.md`

