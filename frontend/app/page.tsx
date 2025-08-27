"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryList from "@/components/ui/CategoryList";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки:", err);
        setError("Не удалось загрузить товары");
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
        <Button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl">
          Перейти в каталог
        </Button>
      </section>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-6 sm:p-10 flex-1">
        <CategoryList />

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            <p className="col-span-full text-center text-gray-500">
              Загрузка товаров...
            </p>
          ) : error ? (
            <p className="col-span-full text-center text-red-500">{error}</p>
          ) : products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              Товары отсутствуют
            </p>
          ) : (
            products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <div className="relative rounded-2xl bg-white shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow max-w-md mx-auto">
                  <div className="h-64 overflow-hidden">
                    <img
                      src={p.imageUrl || "/placeholder.png"}
                      alt={p.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between h-40">
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-2">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-800 font-bold">{p.price.toLocaleString()} ₽</p>
                      <Button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 text-sm">
                        В корзину
                      </Button>
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
