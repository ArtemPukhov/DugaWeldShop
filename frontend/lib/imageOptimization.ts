/**
 * Утилиты для оптимизации изображений
 */

/**
 * Типы размеров изображений для разных компонентов
 */
export const IMAGE_SIZES = {
  // Карточки категорий на главной странице
  categoryCard: {
    width: 400,
    height: 300,
    quality: 85,
    format: 'webp' as const
  },
  
  // Миниатюры категорий в админ панели
  categoryThumbnail: {
    width: 120,
    height: 120,
    quality: 80,
    format: 'webp' as const
  },
  
  // Карточки товаров в каталоге
  productCard: {
    width: 400,
    height: 300,
    quality: 85,
    format: 'webp' as const
  },
  
  // Детальная страница товара
  productDetail: {
    width: 800,
    height: 600,
    quality: 90,
    format: 'webp' as const
  },
  
  // Миниатюры товаров в админ панели
  productThumbnail: {
    width: 100,
    height: 100,
    quality: 80,
    format: 'webp' as const
  },
  
  // Подкатегории
  subcategory: {
    width: 80,
    height: 80,
    quality: 75,
    format: 'webp' as const
  }
} as const;

/**
 * Рекомендации по размерам изображений для загрузки
 */
export const UPLOAD_RECOMMENDATIONS = {
  // Максимальные размеры для загрузки
  maxWidth: 1024,
  maxHeight: 1024,
  maxFileSize: 2 * 1024 * 1024, // 2MB
  recommendedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  
  // Оптимальные размеры для разных типов контента
  categories: {
    recommended: '400x300px',
    maxFileSize: 1 * 1024 * 1024, // 1MB в байтах
    maxFileSizeFormatted: '1MB',
    formats: 'JPG, PNG, WebP'
  },
  
  products: {
    recommended: '800x600px',
    maxFileSize: 2 * 1024 * 1024, // 2MB в байтах
    maxFileSizeFormatted: '2MB', 
    formats: 'JPG, PNG, WebP'
  }
};

/**
 * Сжимает изображение на клиенте
 * @param file - Файл изображения
 * @param maxWidth - Максимальная ширина
 * @param maxHeight - Максимальная высота
 * @param quality - Качество сжатия (0-1)
 * @returns Сжатый файл
 */
export function compressImage(
  file: File, 
  maxWidth: number, 
  maxHeight: number, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Вычисляем новые размеры с сохранением пропорций
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      // Устанавливаем размеры canvas
      canvas.width = width;
      canvas.height = height;
      
      // Рисуем сжатое изображение
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Конвертируем в blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Ошибка сжатия изображения'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Проверяет размер файла
 * @param file - Файл для проверки
 * @param maxSize - Максимальный размер в байтах
 * @returns true если файл подходит по размеру
 */
export function validateFileSize(file: File, maxSize: number = UPLOAD_RECOMMENDATIONS.maxFileSize): boolean {
  // Увеличиваем лимит в 5 раз для автоматического сжатия
  return file.size <= (maxSize * 5);
}

/**
 * Проверяет формат файла
 * @param file - Файл для проверки
 * @returns true если формат поддерживается
 */
export function validateFileFormat(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
}

/**
 * Получает размеры изображения
 * @param file - Файл изображения
 * @returns Promise с размерами
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Форматирует размер файла в читаемый вид
 * @param bytes - Размер в байтах
 * @returns Форматированная строка
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Получает рекомендации по оптимизации для загруженного файла
 * @param file - Файл изображения
 * @returns Рекомендации по оптимизации
 */
export async function getOptimizationRecommendations(file: File): Promise<{
  needsCompression: boolean;
  recommendedSize: string;
  currentSize: string;
  compressionRatio: number;
}> {
  const dimensions = await getImageDimensions(file);
  const currentSize = formatFileSize(file.size);
  
  const needsCompression = 
    dimensions.width > UPLOAD_RECOMMENDATIONS.maxWidth ||
    dimensions.height > UPLOAD_RECOMMENDATIONS.maxHeight ||
    file.size > UPLOAD_RECOMMENDATIONS.maxFileSize;
  
  const compressionRatio = needsCompression ? 
    Math.min(
      UPLOAD_RECOMMENDATIONS.maxWidth / dimensions.width,
      UPLOAD_RECOMMENDATIONS.maxHeight / dimensions.height,
      UPLOAD_RECOMMENDATIONS.maxFileSize / file.size
    ) : 1;
  
  return {
    needsCompression,
    recommendedSize: `${UPLOAD_RECOMMENDATIONS.maxWidth}x${UPLOAD_RECOMMENDATIONS.maxHeight}px`,
    currentSize,
    compressionRatio
  };
}
