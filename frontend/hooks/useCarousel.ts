import { useState, useEffect } from "react";
import { CarouselSlide } from "@/components/ImageCarousel";

// Функция для получения токена авторизации
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('dw_admin_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

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
  const [carouselEnabled, setCarouselEnabled] = useState<boolean>(true);
  const apiBase = process.env.NEXT_PUBLIC_API_TARGET || "";

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

  // Загружаем настройку карусели из localStorage
  const loadCarouselSetting = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('carousel-enabled');
      if (stored !== null) {
        return JSON.parse(stored);
      }
    }
    return true; // По умолчанию карусель включена
  };

  // Сохраняем настройку карусели в localStorage
  const saveCarouselSetting = (enabled: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carousel-enabled', JSON.stringify(enabled));
    }
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
      
      // Загружаем с API
      const response = await fetch(`${apiBase}/api/carousel/slides`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const apiSlides = await response.json();
        // Дедупликация по ID
        const uniqueSlides = apiSlides.filter((slide: CarouselSlide, index: number, self: CarouselSlide[]) => 
          self.findIndex(s => s.id === slide.id) === index
        );
        setSlides(uniqueSlides);
        // Сохраняем в localStorage для кэширования
        saveToStorage(uniqueSlides);
        return;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Ошибка загрузки слайдов:", err);
      setError("Не удалось загрузить слайды карусели");
      
      // Fallback на localStorage
      const storedSlides = loadFromStorage();
      setSlides(storedSlides);
    } finally {
      setLoading(false);
    }
  };

  // Добавление нового слайда
  const addSlide = async (slideData: Omit<CarouselSlide, 'id'>) => {
    try {
      const response = await fetch(`${apiBase}/api/carousel/slides`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(slideData),
      });
      
      if (response.ok) {
        const newSlide = await response.json();
        setSlides(prev => {
          const newSlides = [...prev, newSlide];
          saveToStorage(newSlides);
          return newSlides;
        });
        return newSlide;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Ошибка добавления слайда:", err);
      throw err;
    }
  };

  // Обновление слайда
  const updateSlide = async (id: number, slideData: Partial<CarouselSlide>) => {
    try {
      const response = await fetch(`${apiBase}/api/carousel/slides/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(slideData),
      });
      
      if (response.ok) {
        const updatedSlide = await response.json();
        setSlides(prev => {
          const updatedSlides = prev.map(slide => 
            slide.id === id ? updatedSlide : slide
          );
          saveToStorage(updatedSlides);
          return updatedSlides;
        });
        return updatedSlide;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Ошибка обновления слайда:", err);
      throw err;
    }
  };

  // Удаление слайда
  const deleteSlide = async (id: number) => {
    try {
      const response = await fetch(`${apiBase}/api/carousel/slides/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        setSlides(prev => {
          const updatedSlides = prev.filter(slide => slide.id !== id);
          saveToStorage(updatedSlides);
          return updatedSlides;
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Ошибка удаления слайда:", err);
      throw err;
    }
  };

  // Переупорядочивание слайдов
  const reorderSlides = async (slideIds: number[]) => {
    try {
      const response = await fetch(`${apiBase}/api/carousel/slides/reorder`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(slideIds),
      });
      
      if (response.ok) {
        const reorderedSlides = await response.json();
        setSlides(reorderedSlides);
        saveToStorage(reorderedSlides);
        return reorderedSlides;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Ошибка переупорядочивания слайдов:", err);
      throw err;
    }
  };

  // Функция для переключения состояния карусели
  const toggleCarousel = (enabled: boolean) => {
    setCarouselEnabled(enabled);
    saveCarouselSetting(enabled);
  };

  useEffect(() => {
    fetchSlides();
    setCarouselEnabled(loadCarouselSetting());
  }, []);

  return {
    slides,
    loading,
    error,
    carouselEnabled,
    addSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
    toggleCarousel,
    refetch: fetchSlides,
  };
}
