"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryList from "@/components/ui/CategoryList";

type Category = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/categories`)
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
              <Link key={category.id} href={`/categories/${category.id}`} className="group">
                <div className="relative rounded-2xl bg-white shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-100">
                    <img
                      src={category.imageUrl || "/placeholder.png"}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-yellow-600 transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center text-yellow-600 font-medium text-sm group-hover:text-yellow-700">
                      Перейти к товарам
                      <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
