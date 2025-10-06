/**
 * Утилиты для работы с изображениями
 * 
 * Поддерживает два режима работы:
 * - Локально: использует Spring Boot API (/api/files/{filename})
 * - Продакшн: использует MinIO напрямую (/api/v1/buckets/{bucket}/objects/download)
 * 
 * Переменные окружения:
 * - NEXT_PUBLIC_MINIO_URL: URL MinIO сервера (по умолчанию: http://141.105.71.70:9001)
 * - NEXT_PUBLIC_MINIO_BUCKET: Имя bucket в MinIO (по умолчанию: dugaweld-images)
 * - NEXT_PUBLIC_API_BASE_URL: URL Spring Boot API для локальной разработки
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
  if (process.env.NODE_ENV === 'production') {
    // На продакшн сервере используем MinIO напрямую
    const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL || 'http://141.105.71.70:9001';
    const bucketName = process.env.NEXT_PUBLIC_MINIO_BUCKET || 'dugaweld-images';
    return `${minioUrl}/api/v1/buckets/${bucketName}/objects/download?preview=true&prefix=${encodeURIComponent(imageUrl)}`;
  } else {
    // Локально используем наш API
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/api/files/${imageUrl}`;
  }
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
  if (process.env.NODE_ENV === 'production') {
    // На продакшн сервере используем MinIO напрямую
    const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL || 'http://141.105.71.70:9001';
    const bucketName = process.env.NEXT_PUBLIC_MINIO_BUCKET || 'dugaweld-images';
    
    // Правильно кодируем имя файла для MinIO
    const encodedFileName = encodeURIComponent(imageUrl);
    return `${minioUrl}/api/v1/buckets/${bucketName}/objects/download?preview=true&prefix=${encodedFileName}`;
  } else {
    // Локально используем наш API
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/api/files/${imageUrl}`;
  }
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
  minioUrl?: string; 
  bucketName?: string; 
} {
  const processed = getImageUrlWithEncoding(imageUrl);
  
  return {
    original: imageUrl || 'undefined',
    processed,
    environment: process.env.NODE_ENV || 'development',
    minioUrl: process.env.NEXT_PUBLIC_MINIO_URL,
    bucketName: process.env.NEXT_PUBLIC_MINIO_BUCKET
  };
}
