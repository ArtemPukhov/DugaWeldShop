/**
 * Утилиты для работы с изображениями
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
 * Получает URL для изображения товара
 * @param imageUrl - URL изображения или имя файла
 * @returns Полный URL изображения товара
 */
export function getProductImageUrl(imageUrl?: string): string {
  return getImageUrl(imageUrl);
}

/**
 * Получает URL для изображения категории
 * @param imageUrl - URL изображения или имя файла
 * @returns Полный URL изображения категории
 */
export function getCategoryImageUrl(imageUrl?: string): string {
  return getImageUrl(imageUrl);
}
