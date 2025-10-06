# 📱 Отладка изображений на мобильных устройствах

## 🔍 Проблема
Изображения не отображаются на мобильных устройствах, хотя на компьютере работают нормально.

## ✅ Решение
Используем прокси API вместо прямого обращения к MinIO.

### До исправления:
```
Мобильные устройства: ❌ http://141.105.71.70:9001/api/v1/buckets/... (CORS блокировка)
Компьютеры: ✅ http://141.105.71.70:9001/api/v1/buckets/... (работает)
```

### После исправления:
```
Все устройства: ✅ /api/files/{filename} (прокси через наш API)
```

## 🛠 Технические изменения

### 1. Обновлен imageUtils.ts
```typescript
// Всегда используем прокси API
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080');

return `${baseUrl}/api/files/${imageUrl}`;
```

### 2. Улучшен FileController.java
- ✅ Правильные Content-Type заголовки
- ✅ Кэширование изображений (1 час)
- ✅ Inline отображение вместо скачивания
- ✅ Лучшее логирование ошибок

### 3. Обновлен SecurityConfig.java
- ✅ Добавлен `/api/files/**` в разрешенные пути
- ✅ CORS поддержка для всех устройств

## 🔧 Отладочные функции

### Проверка URL изображений:
```typescript
import { debugImageUrl } from '@/lib/imageUtils';

const debug = debugImageUrl('image.jpg');
console.log(debug);
// Выведет: { original: '...', processed: '...', isMobile: true, ... }
```

### Проверка доступности изображения:
```typescript
import { checkImageAvailability } from '@/lib/imageUtils';

const result = await checkImageAvailability('/api/files/image.jpg');
console.log(result);
// Выведет: { available: true, status: 200 } или { available: false, error: '...' }
```

## 📊 Преимущества прокси

### 1. Универсальная совместимость:
- ✅ Работает на всех устройствах
- ✅ Обходит CORS ограничения
- ✅ Единообразный доступ

### 2. Производительность:
- ✅ Кэширование изображений
- ✅ Правильные HTTP заголовки
- ✅ Оптимизированная доставка

### 3. Надежность:
- ✅ Централизованная обработка ошибок
- ✅ Логирование проблем
- ✅ Fallback механизмы

## 🚨 Частые проблемы

### Изображения не загружаются на мобильном:
1. **Проверьте URL**: должен быть `/api/files/{filename}`, не прямой MinIO URL
2. **Проверьте CORS**: наш API должен быть доступен
3. **Проверьте сеть**: убедитесь что сервер доступен с мобильного

### Медленная загрузка:
1. **Кэширование**: изображения кэшируются на 1 час
2. **Размер файла**: используйте автоматическое сжатие
3. **CDN**: рассмотрите использование CDN

### Ошибки 404:
1. **Проверьте имя файла**: должно совпадать с сохраненным в MinIO
2. **Проверьте права доступа**: файл должен быть доступен
3. **Проверьте логи**: смотрите логи бэкенда

## 🔍 Отладка

### 1. Проверка в браузере:
```javascript
// Откройте DevTools на мобильном устройстве
fetch('/api/files/test-image.jpg')
  .then(response => console.log('Status:', response.status))
  .catch(error => console.error('Error:', error));
```

### 2. Проверка URL:
```javascript
// Проверьте какой URL генерируется
import { debugImageUrl } from '@/lib/imageUtils';
console.log(debugImageUrl('test-image.jpg'));
```

### 3. Проверка доступности:
```javascript
// Проверьте доступность изображения
import { checkImageAvailability } from '@/lib/imageUtils';
checkImageAvailability('/api/files/test-image.jpg')
  .then(result => console.log('Available:', result));
```

## 📱 Мобильная специфика

### User-Agent определение:
```typescript
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
```

### Адаптивные изображения:
```css
/* Мобильные устройства */
@media (max-width: 768px) {
  .category-image {
    height: 10rem; /* 160px */
  }
  
  .product-image {
    height: 10rem; /* 160px */
  }
}
```

## 🚀 Рекомендации

### Для разработчиков:
1. **Всегда используйте прокси** для изображений
2. **Тестируйте на мобильных** устройствах
3. **Мониторьте логи** на предмет ошибок
4. **Используйте отладочные функции** для диагностики

### Для пользователей:
1. **Обновите страницу** после изменений
2. **Очистите кэш** если изображения не обновляются
3. **Проверьте подключение** к интернету
4. **Сообщайте о проблемах** с конкретными устройствами

---

**💡 Помните**: Прокси API обеспечивает надежную работу изображений на всех устройствах, включая мобильные!
