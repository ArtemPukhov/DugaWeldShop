"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselSlide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
}

interface ImageCarouselProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
}

export default function ImageCarousel({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showIndicators = true,
  showArrows = true,
}: ImageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Нормализация ссылок MinIO: переводим истекающие presigned URL в стабильный прокси /api/files/{key}
  const normalizeToProxy = (urlStr: string): string => {
    try {
      const url = new URL(urlStr);
      const parts = url.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('dugaweld-images');
      if (idx >= 0 && parts.length > idx + 1) {
        const key = parts.slice(idx + 1).join('/');
        return `/api/files/${key}`;
      }
      return urlStr;
    } catch {
      return urlStr;
    }
  };

  // Фильтруем только активные слайды и сортируем по порядку
  const activeSlides = slides
    .filter(slide => slide.isActive)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!isPlaying || activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, activeSlides.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  // Функция для извлечения URL из строки или объекта
  function getImageUrl(imageUrl: string | { url: string }) {
    if (!imageUrl) return "";
    if (typeof imageUrl === "string") {
      // Попробуем распарсить как JSON, если это строка-объект
      try {
        const parsed = JSON.parse(imageUrl);
        if (parsed && typeof parsed.url === "string") return parsed.url;
      } catch {
        // Если не JSON, возвращаем как есть
        return imageUrl;
      }
    }
    if (typeof imageUrl === "object" && imageUrl.url) return imageUrl.url;
    return "";
  }

  if (activeSlides.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Нет доступных слайдов</p>
      </div>
    );
  }

  const currentSlideData = activeSlides[currentSlide];
  const imageUrl = normalizeToProxy(getImageUrl(currentSlideData.imageUrl));

  return (
    <div 
      className="relative w-full h-96 md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg shadow-lg"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(autoPlay)}
    >
      {/* Основное изображение */}
      <div className="relative w-full h-full">
        <img
          src={imageUrl}
          alt={currentSlideData.title}
          className="w-full h-full object-cover"
        />
        
        {/* Градиентный оверлей для лучшей читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        
        {/* Текст поверх изображения */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-2xl px-8 md:px-12">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {currentSlideData.title}
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-blue-300 font-medium">
              {currentSlideData.subtitle}
            </p>
            {currentSlideData.linkUrl && (
              <div className="mt-6">
                <a
                  href={currentSlideData.linkUrl}
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Подробнее
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Стрелки навигации */}
      {showArrows && activeSlides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200"
            aria-label="Предыдущий слайд"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200"
            aria-label="Следующий слайд"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Индикаторы */}
      {showIndicators && activeSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentSlide
                  ? "bg-yellow-500"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Пример использования слайдов
const slides: CarouselSlide[] = [
  {
    id: 1,
    imageUrl: JSON.stringify({ url: "https://via.placeholder.com/800x600.png?text=Slide+1" }),
    title: "Слайд 1",
    subtitle: "Подзаголовок 1",
    linkUrl: "https://example.com/1",
    isActive: true,
    order: 1,
  },
  {
    id: 2,
    imageUrl: JSON.stringify({ url: "https://via.placeholder.com/800x600.png?text=Slide+2" }),
    title: "Слайд 2",
    subtitle: "Подзаголовок 2",
    linkUrl: "https://example.com/2",
    isActive: true,
    order: 2,
  },
  {
    id: 3,
    imageUrl: JSON.stringify({ url: "https://via.placeholder.com/800x600.png?text=Slide+3" }),
    title: "Слайд 3",
    subtitle: "Подзаголовок 3",
    linkUrl: "https://example.com/3",
    isActive: true,
    order: 3,
  },
];

// Пример функции загрузки слайдов
async function loadSlides() {
  const response = await fetch("/api/slides", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Ошибка при загрузке слайдов");
  }

  const data = await response.json();
  return data.slides as CarouselSlide[];
}

// Пример отправки формы с использованием fetch
async function submitForm(formData: FormData) {
  const response = await fetch("/api/submit", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${yourToken}`,
      // другие заголовки
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Ошибка при отправке формы");
  }

  return response.json();
}
