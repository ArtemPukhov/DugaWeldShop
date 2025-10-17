'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-400">Нет изображений</span>
      </div>
    );
  }

  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="w-full">
      {/* Главное изображение */}
      <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
        <Image
          src={sortedImages[currentIndex].imageUrl}
          alt={`${productName} - изображение ${currentIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={currentIndex === 0}
        />

        {/* Кнопки навигации (если больше одного изображения) */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
              aria-label="Следующее изображение"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Индикатор текущего изображения */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {sortedImages.length}
            </div>
          </>
        )}
      </div>

      {/* Миниатюры (если больше одного изображения) */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleThumbnailClick(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Image
                src={image.imageUrl}
                alt={`${productName} - миниатюра ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 10vw"
              />
              {image.isPrimary && (
                <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1 rounded">
                  Главное
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

