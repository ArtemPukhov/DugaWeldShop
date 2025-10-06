/**
 * Утилиты для работы с изображениями
 * 
 * Всегда использует прокси API для надежности:
 * - Локально: http://localhost:8080/api/files/{filename}
 * - Продакшн: /api/files/{filename} (относительный URL)
 * 
 * Преимущества прокси:
 * - Работает на всех устройствах (включая мобильные)
 * - Обходит проблемы с CORS
 * - Единообразный доступ к изображениям
 * 
 * Переменные окружения:
 * - NEXT_PUBLIC_API_BASE_URL: URL Spring Boot API (опционально)
 */

/**
 * Получает правильный URL для изображения
 * @param imageUrl - URL изображения или имя файла
 * @returns Полный URL изображения
 */
export function getImageUrl(imageUrl?: string): string {
  if (!imageUrl) {
    return "/placeholder.png";
  }

  // Если это уже полный URL (начинается с http), возвращаем как есть
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Определяем базовый URL для API
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080');
  
  // Всегда используем наш прокси API для надежности
  return `${baseUrl}/api/files/${imageUrl}`;
}

/**
 * Обработчик ошибки загрузки изображения
 * @param event - Событие ошибки
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>) {
  const img = event.currentTarget;
  img.src = "/placeholder.png";
  img.alt = "Изображение недоступно";
}

/**
 * Получает URL для изображения с правильным кодированием
 * @param imageUrl - URL изображения или имя файла
 * @returns Полный URL изображения
 */
export function getImageUrlWithEncoding(imageUrl?: string): string {
  if (!imageUrl) {
    return "/placeholder.png";
  }

  // Если это уже полный URL (начинается с http), возвращаем как есть
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Определяем базовый URL для API
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080');
  
  // Всегда используем наш прокси API для надежности
  return `${baseUrl}/api/files/${imageUrl}`;
}

/**
 * Получает URL для изображения товара
 * @param imageUrl - URL изображения или имя файла
 * @returns Полный URL изображения товара
 */
export function getProductImageUrl(imageUrl?: string): string {
  return getImageUrlWithEncoding(imageUrl);
}

/**
 * Получает URL для изображения категории
 * @param imageUrl - URL изображения или имя файла
 * @returns Полный URL изображения категории
 */
export function getCategoryImageUrl(imageUrl?: string): string {
  return getImageUrlWithEncoding(imageUrl);
}

/**
 * Отладочная функция для проверки URL изображений
 * @param imageUrl - URL изображения или имя файла
 * @returns Объект с информацией о URL
 */
export function debugImageUrl(imageUrl?: string): { 
  original: string; 
  processed: string; 
  environment: string; 
  baseUrl: string;
  userAgent: string;
  isMobile: boolean;
} {
  const processed = getImageUrlWithEncoding(imageUrl);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080');
  
  return {
    original: imageUrl || 'undefined',
    processed,
    environment: process.env.NODE_ENV || 'development',
    baseUrl,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    isMobile: typeof navigator !== 'undefined' ? /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false
  };
}

/**
 * Проверяет доступность изображения
 * @param imageUrl - URL изображения
 * @returns Promise с результатом проверки
 */
export async function checkImageAvailability(imageUrl: string): Promise<{
  available: boolean;
  status?: number;
  error?: string;
}> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return {
      available: response.ok,
      status: response.status
    };
  } catch (error) {
    return {
      available: false,
      error: (error as Error).message
    };
  }
}
