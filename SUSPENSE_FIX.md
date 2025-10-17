# 🔧 Исправление: Suspense для useSearchParams в Next.js 15

## ❌ Проблема

При сборке production возникала ошибка:

```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/catalog". 
Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
```

**Причина:** В Next.js 15 использование `useSearchParams()` требует обертывания в `Suspense` boundary для корректной работы SSR (Server-Side Rendering).

---

## ✅ Решение

Обернули компонент каталога в `Suspense` с fallback для состояния загрузки.

---

## 🔧 Изменения в коде

### **Файл: `frontend/app/catalog/page.tsx`**

**Было:**
```tsx
export default function CatalogPage() {
  const searchParams = useSearchParams();
  // ... остальной код
}
```

**Стало:**
```tsx
// Внутренний компонент с логикой
function CatalogContent() {
  const searchParams = useSearchParams();
  // ... вся логика каталога
}

// Главный экспортируемый компонент с Suspense
export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Загрузка каталога...</p>
        </div>
        <Footer />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
```

---

## 📝 Детали реализации

### **1. Добавлен импорт Suspense:**
```tsx
import { useState, useEffect, Suspense } from "react";
```

### **2. Создан внутренний компонент CatalogContent:**
```tsx
function CatalogContent() {
  const searchParams = useSearchParams(); // Теперь внутри Suspense!
  // ... вся существующая логика
}
```

### **3. Главный компонент с Suspense:**
```tsx
export default function CatalogPage() {
  return (
    <Suspense fallback={/* Состояние загрузки */}>
      <CatalogContent />
    </Suspense>
  );
}
```

---

## 🎯 Что делает Suspense?

### **Suspense Boundary** позволяет:

1. **SSR (Server-Side Rendering):**
   - Next.js может корректно рендерить страницу на сервере
   - Компонент не блокирует начальный рендеринг

2. **Fallback UI:**
   - Показывает состояние загрузки пока компонент готовится
   - Улучшает UX при навигации

3. **Динамический контент:**
   - `useSearchParams()` становится динамическим
   - Параметры из URL загружаются после гидратации

---

## 🔄 Как это работает

### **1. Server-Side (сборка):**
```
1. Next.js рендерит CatalogPage
2. Видит Suspense boundary
3. Рендерит fallback вместо CatalogContent
4. Страница успешно собирается
```

### **2. Client-Side (в браузере):**
```
1. Загружается HTML с fallback
2. Выполняется гидратация
3. CatalogContent получает searchParams
4. Suspense заменяет fallback на реальный контент
```

---

## 📊 Преимущества решения

### **Для разработки:**
- ✅ Сборка production проходит успешно
- ✅ Нет ошибок SSR
- ✅ Совместимость с Next.js 15

### **Для пользователей:**
- ✅ Быстрый первоначальный рендеринг
- ✅ Плавная загрузка контента
- ✅ Индикатор состояния загрузки

### **Для SEO:**
- ✅ Страница корректно индексируется
- ✅ Мета-теги загружаются сразу
- ✅ Нет проблем с краулерами

---

## 🎨 Fallback UI

### **Текущий fallback:**
```tsx
<div className="min-h-screen bg-gray-50 flex flex-col">
  <Header />
  <div className="flex-1 flex items-center justify-center">
    <p className="text-gray-500">Загрузка каталога...</p>
  </div>
  <Footer />
</div>
```

**Особенности:**
- Показывает Header и Footer
- Центрированное сообщение "Загрузка каталога..."
- Совпадает по структуре с основной страницей
- Минимальный CLS (Cumulative Layout Shift)

---

## 🚀 Улучшенный fallback (опционально)

Можно добавить skeleton loader для более профессионального вида:

```tsx
<Suspense fallback={
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <div className="max-w-7xl mx-auto w-full p-6 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Skeleton сайдбара */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Skeleton товаров */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
}>
  <CatalogContent />
</Suspense>
```

---

## 📚 Ссылки на документацию

- [Next.js Suspense Documentation](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#instant-loading-states)
- [useSearchParams with Suspense](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)
- [React Suspense](https://react.dev/reference/react/Suspense)

---

## 🔍 Другие места, где может понадобиться Suspense

Если в других компонентах используются:
- `useSearchParams()`
- `useRouter()` с параметрами
- Динамические route parameters

То их тоже нужно обернуть в `Suspense`.

**Пример для других страниц:**
```tsx
// В любой странице с useSearchParams
export default function MyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MyPageContent />
    </Suspense>
  );
}

function MyPageContent() {
  const searchParams = useSearchParams();
  // ... ваша логика
}
```

---

## ✅ Результат

- ✅ **Production build проходит успешно**
- ✅ **SSR работает корректно**
- ✅ **Поиск функционирует как ожидалось**
- ✅ **Нет ошибок в консоли**
- ✅ **Совместимость с Next.js 15**

---

## 🎯 Тестирование

### **Локально:**
```bash
npm run build
npm start
```

### **Проверьте:**
1. Страница каталога загружается ✅
2. Поиск из хедера работает ✅
3. URL параметры применяются ✅
4. Фильтры работают корректно ✅
5. Нет ошибок в консоли ✅

---

## 📝 Файлы изменены

1. `frontend/app/catalog/page.tsx` - добавлен Suspense wrapper
2. `SUSPENSE_FIX.md` - документация (этот файл)

---

**Проблема решена! Build работает! 🎉**

