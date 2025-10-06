/**
 * Утилиты для оптимизации изображений
 */

// Максимальные размеры для загрузки
export const MAX_WIDTH = 1024;
export const MAX_HEIGHT = 1024;
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Поддерживаемые форматы
export const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Рекомендации по загрузке
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
 * Проверяет формат файла
 */
export function validateFileFormat(file: File): boolean {
  return SUPPORTED_FORMATS.includes(file.type);
}

/**
 * Проверяет размер файла
 */
export function validateFileSize(file: File, maxSize: number = UPLOAD_RECOMMENDATIONS.maxFileSize): boolean {
  // Увеличиваем лимит в 5 раз для автоматического сжатия
  return file.size <= (maxSize * 5);
}

/**
 * Форматирует размер файла в читаемый вид
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Получает размеры изображения
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось загрузить изображение'));
    };
    
    img.src = url;
  });
}

/**
 * Сжимает изображение
 */
export function compressImage(
  file: File,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Вычисляем новые размеры
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      // Создаем canvas для сжатия
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Не удалось создать контекст canvas'));
        return;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Рисуем изображение
      ctx.drawImage(img, 0, 0, width, height);
      
      // Конвертируем в blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Не удалось сжать изображение'));
            return;
          }
          
          // Создаем новый файл
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось загрузить изображение для сжатия'));
    };
    
    img.src = url;
  });
}

/**
 * Получает рекомендации по оптимизации
 */
export async function getOptimizationRecommendations(file: File): Promise<{
  currentSize: string;
  currentDimensions: string;
  recommendations: string[];
}> {
  const dimensions = await getImageDimensions(file);
  const currentSize = formatFileSize(file.size);
  const currentDimensions = `${dimensions.width}x${dimensions.height}px`;
  
  const recommendations: string[] = [];
  
  // Проверяем размер файла
  if (file.size > UPLOAD_RECOMMENDATIONS.maxFileSize) {
    recommendations.push('Файл будет автоматически сжат для оптимизации');
  }
  
  // Проверяем размеры
  if (dimensions.width > MAX_WIDTH || dimensions.height > MAX_HEIGHT) {
    recommendations.push('Изображение будет автоматически уменьшено до оптимального размера');
  }
  
  // Проверяем формат
  if (file.type === 'image/png' && file.size > 500 * 1024) {
    recommendations.push('PNG файлы больше 500KB будут конвертированы в JPEG для экономии места');
  }
  
  return {
    currentSize,
    currentDimensions,
    recommendations
  };
}