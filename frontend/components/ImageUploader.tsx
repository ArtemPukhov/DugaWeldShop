"use client";

import React, { useState, useRef } from 'react';
import { 
  compressImage, 
  validateFileSize, 
  validateFileFormat, 
  getImageDimensions,
  formatFileSize,
  getOptimizationRecommendations,
  UPLOAD_RECOMMENDATIONS 
} from '@/lib/imageOptimization';

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
  currentImageUrl?: string;
  type: 'category' | 'product';
  disabled?: boolean;
  onRemoveCurrentImage?: () => void;
}

export default function ImageUploader({ 
  onFileSelect, 
  currentImageUrl, 
  type, 
  disabled = false,
  onRemoveCurrentImage
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSize = type === 'category' ? 
    UPLOAD_RECOMMENDATIONS.categories.maxFileSize : 
    UPLOAD_RECOMMENDATIONS.products.maxFileSize;

  const maxSizeFormatted = type === 'category' ? 
    UPLOAD_RECOMMENDATIONS.categories.maxFileSizeFormatted : 
    UPLOAD_RECOMMENDATIONS.products.maxFileSizeFormatted;

  const recommendedSize = type === 'category' ? 
    UPLOAD_RECOMMENDATIONS.categories.recommended : 
    UPLOAD_RECOMMENDATIONS.products.recommended;

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Валидация формата
    if (!validateFileFormat(file)) {
      setError('Неподдерживаемый формат файла. Используйте JPG, PNG или WebP.');
      return;
    }
    
    // Проверяем размер только для очень больших файлов (больше 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(`Файл слишком большой. Максимальный размер: 10MB`);
      return;
    }

    try {
      setIsCompressing(true);
      
      // Получаем рекомендации по оптимизации
      const recs = await getOptimizationRecommendations(file);
      setRecommendations(recs);

      // Всегда сжимаем изображение для оптимизации
      const processedFile = await compressImage(
        file, 
        type === 'category' ? 400 : 800,
        type === 'category' ? 300 : 600,
        0.85
      );
      
      setIsCompressing(false);
      setSelectedFile(processedFile);
      
      // Создаем превью
      const url = URL.createObjectURL(processedFile);
      setPreviewUrl(url);
      
      onFileSelect(processedFile);
    } catch (err) {
      setError('Ошибка обработки изображения: ' + (err as Error).message);
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRecommendations(null);
    setError(null);
    onFileSelect(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveCurrentImage = () => {
    if (onRemoveCurrentImage) {
      onRemoveCurrentImage();
    }
    onFileSelect(null);
  };

  return (
    <div className="space-y-4">
      {/* Загрузка нового изображения */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {type === 'category' ? 'Изображение категории' : 'Изображение товара'}
        </label>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          disabled={disabled || isCompressing}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
        
        <p className="text-xs text-gray-500 mt-1">
          Рекомендуемый размер: {recommendedSize} | 
          Максимальный размер файла: {maxSizeFormatted} | 
          Поддерживаемые форматы: {type === 'category' ? 
            UPLOAD_RECOMMENDATIONS.categories.formats : 
            UPLOAD_RECOMMENDATIONS.products.formats}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          💡 Изображение будет автоматически сжато до оптимального размера
        </p>
      </div>

      {/* Состояние загрузки */}
      {isCompressing && (
        <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Сжатие изображения для оптимизации...</span>
        </div>
      )}

      {/* Рекомендации по оптимизации */}
      {recommendations && (
        <div className={`p-3 rounded-md text-sm ${
          recommendations.needsCompression 
            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' 
            : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          <div className="font-medium mb-1">
            {recommendations.needsCompression ? 'Рекомендации по оптимизации:' : 'Изображение оптимизировано ✓'}
          </div>
          <div className="space-y-1">
            <div>Текущий размер: {recommendations.currentSize}</div>
            {recommendations.needsCompression && (
              <div>Рекомендуемый размер: {recommendations.recommendedSize}</div>
            )}
            {recommendations.compressionRatio < 1 && (
              <div>Коэффициент сжатия: {(recommendations.compressionRatio * 100).toFixed(0)}%</div>
            )}
          </div>
        </div>
      )}

      {/* Ошибки */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-800 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Превью нового изображения */}
      {previewUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Предварительный просмотр:</span>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Удалить
            </button>
          </div>
          <div className="relative">
            <img
              src={previewUrl}
              alt="Предварительный просмотр"
              className="w-32 h-32 object-cover rounded border"
            />
            {selectedFile && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                {formatFileSize(selectedFile.size)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Текущее изображение */}
      {currentImageUrl && !previewUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Текущее изображение:</span>
            <button
              type="button"
              onClick={handleRemoveCurrentImage}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Удалить
            </button>
          </div>
          <div className="relative">
            <img
              src={currentImageUrl}
              alt="Текущее изображение"
              className="w-32 h-32 object-cover rounded border"
            />
          </div>
        </div>
      )}
    </div>
  );
}
