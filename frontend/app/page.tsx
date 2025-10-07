"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryHierarchy from "@/components/ui/CategoryHierarchy";

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

      <section className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-center py-20">
        <h2 className="text-4xl font-bold mb-4">
          Сварочное оборудование для профессионалов
        </h2>
        <p className="mb-6">Лучшие бренды, выгодные цены, доставка по всей стране</p>
        <Link href="/catalog">
          <Button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl">
            Перейти в каталог
          </Button>
        </Link>
      </section>

      <div className="max-w-7xl mx-auto p-6 sm:p-10 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Наши категории</h2>
          <p className="text-gray-600 text-lg">Выберите категорию для просмотра товаров</p>
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
