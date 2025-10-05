// app/categories/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryList from "@/components/ui/CategoryList";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
};

type Category = {
  id: number;
  name: string;
  imageUrl?: string;
};

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Получаем категорию
        const categoryRes = await fetch(`/api/categories/${resolvedParams.id}`);
        if (!categoryRes.ok) {
          throw new Error(`Категория не найдена (${categoryRes.status})`);
        }
        const categoryData = await categoryRes.json();
        setCategory(categoryData);

        // Получаем все товары из категории и её дочерних категорий
        const allProducts = await fetchProductsWithSubcategories(resolvedParams.id);
        setProducts(allProducts);
      } catch (err: any) {
        console.error("Ошибка загрузки:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [resolvedParams.id]);

  // Функция для получения всех товаров из категории и её дочерних категорий
  async function fetchProductsWithSubcategories(categoryId: string): Promise<Product[]> {
    const allProducts: Product[] = [];
    
    // Получаем товары из текущей категории
    try {
      const productsRes = await fetch(`/api/products/by-category/${categoryId}`);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        allProducts.push(...productsData);
      }
    } catch (error) {
      console.error("Ошибка загрузки товаров категории:", error);
    }

    // Получаем дочерние категории
    try {
      const subcategoriesRes = await fetch(`/api/categories/${categoryId}/subcategories`);
      if (subcategoriesRes.ok) {
        const subcategories = await subcategoriesRes.json();
        
        // Рекурсивно получаем товары из каждой дочерней категории
        for (const subcategory of subcategories) {
          const subcategoryProducts = await fetchProductsWithSubcategories(subcategory.id.toString());
          allProducts.push(...subcategoryProducts);
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки дочерних категорий:", error);
    }

    return allProducts;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-500">Загрузка...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-red-500 mb-4">
              {error || "Категория не найдена"}
            </p>
            <Link href="/" className="text-blue-500 hover:underline">
              Вернуться на главную
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Баннер категории */}
      <section className="bg-yellow-400 text-black text-center py-16">
        <h1 className="text-4xl font-bold">{category.name}</h1>
        {products.length > 0 && (
          <p className="text-lg mt-2">
            Найдено товаров: {products.length}
          </p>
        )}
      </section>

      {/* Основной блок: слева категории, справа товары */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 p-6 sm:p-10 flex-1">
        {/* Слева: категории */}
        <CategoryList />

        {/* Справа: товары выбранной категории */}
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Товары в категории "{category.name}" и подкатегориях
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">
                Товары отсутствуют
              </p>
            ) : (
            products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <div className="relative rounded-2xl bg-white shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow mx-auto max-w-sm">
                  <div className="h-64 overflow-hidden">
                    <img
                      src={p.imageUrl || "/placeholder.png"}
                      alt={p.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between h-48">
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
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 text-sm bg-yellow-500 hover:bg-red-500 rounded-md">
                        В корзину
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
