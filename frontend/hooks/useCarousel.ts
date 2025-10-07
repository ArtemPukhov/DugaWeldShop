import { useState, useEffect } from "react";
import { CarouselSlide } from "@/components/ImageCarousel";

// Моковые данные для демонстрации
const mockSlides: CarouselSlide[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    title: "DIGITAL X SMART",
    subtitle: "ДОСТУП В НОВОЕ ИЗМЕРЕНИЕ",
    linkUrl: "/catalog",
    isActive: true,
    order: 1,
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    title: "ПРОФЕССИОНАЛЬНОЕ ОБОРУДОВАНИЕ",
    subtitle: "КАЧЕСТВО И НАДЕЖНОСТЬ",
    linkUrl: "/catalog",
    isActive: true,
    order: 2,
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    title: "СВАРОЧНЫЕ МАСКИ",
    subtitle: "ЗАЩИТА И КОМФОРТ",
    linkUrl: "/catalog",
    isActive: true,
    order: 3,
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    title: "ИННОВАЦИОННЫЕ ТЕХНОЛОГИИ",
    subtitle: "БУДУЩЕЕ СВАРКИ УЖЕ ЗДЕСЬ",
    linkUrl: "/catalog",
    isActive: true,
    order: 4,
  },
];

export function useCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем данные из localStorage при инициализации
  const loadFromStorage = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('carousel-slides');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Ошибка загрузки из localStorage:', e);
        }
      }
    }
    return mockSlides;
  };

  // Сохраняем данные в localStorage
  const saveToStorage = (newSlides: CarouselSlide[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carousel-slides', JSON.stringify(newSlides));
    }
  };

  // Загрузка слайдов
  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Пробуем загрузить с API, если не получается - используем localStorage
      try {
        const response = await fetch('/api/carousel/slides');
        if (response.ok) {
          const apiSlides = await response.json();
          setSlides(apiSlides);
          return;
        }
      } catch (apiError) {
        console.log('API недоступен, используем localStorage:', apiError);
      }
      
      // Fallback на localStorage
      const storedSlides = loadFromStorage();
      setSlides(storedSlides);
    } catch (err) {
      console.error("Ошибка загрузки слайдов:", err);
      setError("Не удалось загрузить слайды карусели");
      setSlides(mockSlides); // Fallback на моковые данные
    } finally {
      setLoading(false);
    }
  };

  // Добавление нового слайда
  const addSlide = async (slideData: Omit<CarouselSlide, 'id'>) => {
    try {
      // Пробуем добавить через API
      try {
        const response = await fetch('/api/carousel/slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slideData),
        });
        
        if (response.ok) {
          const newSlide = await response.json();
          setSlides(prev => [...prev, newSlide]);
          return newSlide;
        }
      } catch (apiError) {
        console.log('API недоступен, используем localStorage:', apiError);
      }
      
      // Fallback на localStorage
      const newSlide: CarouselSlide = {
        ...slideData,
        id: Date.now(),
      };
      
      setSlides(prev => {
        const newSlides = [...prev, newSlide];
        saveToStorage(newSlides);
        return newSlides;
      });
      
      return newSlide;
    } catch (err) {
      console.error("Ошибка добавления слайда:", err);
      throw err;
    }
  };

  // Обновление слайда
  const updateSlide = async (id: number, slideData: Partial<CarouselSlide>) => {
    try {
      // Обновляем состояние и сохраняем в localStorage
      setSlides(prev => {
        const updatedSlides = prev.map(slide => 
          slide.id === id ? { ...slide, ...slideData } : slide
        );
        saveToStorage(updatedSlides);
        return updatedSlides;
      });
    } catch (err) {
      console.error("Ошибка обновления слайда:", err);
      throw err;
    }
  };

  // Удаление слайда
  const deleteSlide = async (id: number) => {
    try {
      // Обновляем состояние и сохраняем в localStorage
      setSlides(prev => {
        const updatedSlides = prev.filter(slide => slide.id !== id);
        saveToStorage(updatedSlides);
        return updatedSlides;
      });
    } catch (err) {
      console.error("Ошибка удаления слайда:", err);
      throw err;
    }
  };

  // Переупорядочивание слайдов
  const reorderSlides = async (slideIds: number[]) => {
    try {
      // Обновляем состояние и сохраняем в localStorage
      setSlides(prev => {
        const reorderedSlides = slideIds.map((id, index) => {
          const slide = prev.find(s => s.id === id);
          return slide ? { ...slide, order: index + 1 } : null;
        }).filter(Boolean) as CarouselSlide[];
        
        const remainingSlides = prev.filter(slide => !slideIds.includes(slide.id));
        const updatedSlides = [...reorderedSlides, ...remainingSlides];
        saveToStorage(updatedSlides);
        return updatedSlides;
      });
    } catch (err) {
      console.error("Ошибка переупорядочивания слайдов:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  return {
    slides,
    loading,
    error,
    addSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
    refetch: fetchSlides,
  };
}
