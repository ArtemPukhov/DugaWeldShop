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

  // Загрузка слайдов
  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // В реальном приложении здесь будет API запрос
      // const response = await fetch('/api/carousel/slides');
      // const data = await response.json();
      
      // Пока используем моковые данные
      await new Promise(resolve => setTimeout(resolve, 500)); // Имитация загрузки
      setSlides(mockSlides);
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
      const newSlide: CarouselSlide = {
        ...slideData,
        id: Date.now(), // Временный ID, в реальном приложении будет от сервера
      };
      
      // В реальном приложении здесь будет API запрос
      // const response = await fetch('/api/carousel/slides', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(slideData),
      // });
      // const newSlide = await response.json();
      
      setSlides(prev => [...prev, newSlide]);
      return newSlide;
    } catch (err) {
      console.error("Ошибка добавления слайда:", err);
      throw err;
    }
  };

  // Обновление слайда
  const updateSlide = async (id: number, slideData: Partial<CarouselSlide>) => {
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await fetch(`/api/carousel/slides/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(slideData),
      // });
      // const updatedSlide = await response.json();
      
      setSlides(prev => 
        prev.map(slide => 
          slide.id === id ? { ...slide, ...slideData } : slide
        )
      );
    } catch (err) {
      console.error("Ошибка обновления слайда:", err);
      throw err;
    }
  };

  // Удаление слайда
  const deleteSlide = async (id: number) => {
    try {
      // В реальном приложении здесь будет API запрос
      // await fetch(`/api/carousel/slides/${id}`, {
      //   method: 'DELETE',
      // });
      
      setSlides(prev => prev.filter(slide => slide.id !== id));
    } catch (err) {
      console.error("Ошибка удаления слайда:", err);
      throw err;
    }
  };

  // Переупорядочивание слайдов
  const reorderSlides = async (slideIds: number[]) => {
    try {
      // В реальном приложении здесь будет API запрос
      // await fetch('/api/carousel/slides/reorder', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ slideIds }),
      // });
      
      setSlides(prev => {
        const reorderedSlides = slideIds.map((id, index) => {
          const slide = prev.find(s => s.id === id);
          return slide ? { ...slide, order: index + 1 } : null;
        }).filter(Boolean) as CarouselSlide[];
        
        const remainingSlides = prev.filter(slide => !slideIds.includes(slide.id));
        return [...reorderedSlides, ...remainingSlides];
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
