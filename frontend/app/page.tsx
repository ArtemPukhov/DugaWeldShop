"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryHierarchy from "@/components/ui/CategoryHierarchy";
import ImageCarousel from "@/components/ImageCarousel";
import HeroSection from "@/components/HeroSection";
import { useCarousel } from "@/hooks/useCarousel";
import { useAuth } from "@/contexts/AuthContext";

type Category = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Хук для управления каруселью
  const { slides: carouselSlides, loading: carouselLoading, carouselEnabled } = useCarousel();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    fetch(`/api/categories/root`)
      .then((res) => {
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки:", err);
        setError(`Не удалось загрузить категории: ${err.message}. Убедитесь, что бэкенд запущен на порту 8080.`);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Head>
        <title>DugaWeld - Главная | Сварочное оборудование для профессионалов</title>
        <meta name="description" content="Главная страница интернет-магазина DugaWeld. Широкий ассортимент сварочного оборудования, лучшие бренды, выгодные цены. Доставка по всей стране." />
        <meta name="keywords" content="сварочное оборудование, сварочные аппараты, главная, каталог, сварка" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        {isAuthenticated && !isLoading && (user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
          <div className="bg-amber-50 border-b border-amber-200">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 py-3 text-sm flex items-center justify-between">
              <span className="text-amber-800">Режим администратора доступен</span>
              <Link href="/admin" className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-md transition-colors">
                Перейти в админ-панель
              </Link>
            </div>
          </div>
        )}

        {/* Hero блок с заголовком и слоганом */}
        <HeroSection />

        {/* Карусель изображений */}
        {carouselEnabled && (
          <section className="w-full">
            {carouselLoading ? (
              <div className="w-full h-96 md:h-[500px] lg:h-[600px] bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Загрузка карусели...</p>
                </div>
              </div>
            ) : (
              <ImageCarousel 
                slides={carouselSlides}
                autoPlay={true}
                autoPlayInterval={5000}
                showIndicators={true}
                showArrows={true}
              />
            )}
          </section>
        )}

      <div className="max-w-7xl mx-auto p-6 sm:p-10 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Наши категории</h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Широкий ассортимент профессионального сварочного оборудования для любых задач
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            <p className="col-span-full text-center text-gray-500 py-12">
              Загрузка категорий...
            </p>
          ) : error ? (
            <p className="col-span-full text-center text-red-500 py-12">{error}</p>
          ) : categories.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">
              Категории отсутствуют
            </p>
          ) : (
            categories.map((category) => (
              <CategoryHierarchy key={category.id} category={category} />
            ))
          )}
        </div>
      </div>

        <Footer />
      </div>
    </>
  );
}
