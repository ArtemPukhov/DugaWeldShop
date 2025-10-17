// app/catalog/page.tsx
"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getProductImageUrl, handleImageError } from "@/lib/imageUtils";
import { useCart } from "@/contexts/CartContext";
import { useSearchParams } from "next/navigation";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
};

type Category = {
  id: number;
  name: string;
  imageUrl?: string;
};

type FilterState = {
  category: string;
  priceRange: string;
  sortBy: string;
  search: string;
};

export default function CatalogPage() {
  const { addItem, items } = useCart();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    priceRange: "all",
    sortBy: "name",
    search: ""
  });

  useEffect(() => {
    // Получаем параметр поиска из URL
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
  }, [searchParams]);

  useEffect(() => {
    // Загрузка товаров
    fetch("/api/products")
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

    // Загрузка категорий
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Ошибка загрузки категорий:", err));
  }, []);

  // Фильтрация и сортировка товаров
  const filteredProducts = products
    .filter(product => {
      // Фильтр по категории
      if (filters.category !== "all" && product.categoryId !== parseInt(filters.category)) {
        return false;
      }

      // Фильтр по цене
      if (filters.priceRange !== "all") {
        const price = product.price;
        switch (filters.priceRange) {
          case "0-10000":
            if (price > 10000) return false;
            break;
          case "10000-50000":
            if (price < 10000 || price > 50000) return false;
            break;
          case "50000-100000":
            if (price < 50000 || price > 100000) return false;
            break;
          case "100000+":
            if (price < 100000) return false;
            break;
        }
      }

      // Поиск
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Сортировка
      switch (filters.sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = (product: Product) => {
    // Если товар уже в корзине, переходим в корзину
    if (isInCart(product.id)) {
      window.location.href = '/cart';
      return;
    }
    
    // Если товара нет в корзине, добавляем его
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || '',
      categoryId: product.category?.id || 0
    });
  };

  // Функция для проверки, есть ли товар в корзине
  const isInCart = (productId: number) => {
    return items.some(item => item.id === productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Загрузка каталога...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Каталог товаров | DugaWeld - Сварочное оборудование</title>
        <meta name="description" content="Каталог сварочного оборудования DugaWeld. Сварочные аппараты, принадлежности, газосварочное оборудование. Широкий выбор товаров для профессионалов." />
        <meta name="keywords" content="каталог, сварочное оборудование, сварочные аппараты, товары, сварка" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

      {/* Заголовок */}
      <section className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Каталог товаров</h1>
          <p className="text-xl">Широкий выбор сварочного оборудования и расходных материалов</p>
        </div>
      </section>

      {/* Основной контент */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Сайдбар с фильтрами */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Фильтры</h2>

        {/* Поиск */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Поиск
          </label>
          <input
            type="text"
            placeholder="Название товара..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            style={{ color: 'black' }}
          />
        </div>

              {/* Категории */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  style={{ color: 'black' }}
                >
                      <option value="all" style={{ color: 'black' }}> {/* <- Добавлено */}
                        Все категории
                      </option>
                      {categories.map(category => (
                        <option
                          key={category.id}
                          value={category.id}
                          style={{ color: 'black' }} // <- Добавлено
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

              {/* Цена */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ценовой диапазон
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  style={{ color: 'black' }}
                >
                  <option value="all">Любая цена</option>
                  <option value="0-10000">До 10 000 ₽</option>
                  <option value="10000-50000">10 000 - 50 000 ₽</option>
                  <option value="50000-100000">50 000 - 100 000 ₽</option>
                  <option value="100000+">От 100 000 ₽</option>
                </select>
              </div>

              {/* Сортировка */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сортировка
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  style={{ color: 'black' }}
                >
                  <option value="name">По названию</option>
                  <option value="price-asc">По возрастанию цены</option>
                  <option value="price-desc">По убыванию цены</option>
                </select>
              </div>

              {/* Сброс фильтров */}
              <Button
                onClick={() => setFilters({
                  category: "all",
                  priceRange: "all",
                  sortBy: "name",
                  search: ""
                })}
                className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Сбросить фильтры
              </Button>
            </div>
          </aside>

          {/* Список товаров */}
          <div className="lg:col-span-3">
            {/* Информация о результатах */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Найдено товаров: <span className="font-semibold">{filteredProducts.length}</span>
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Вид:</span>
                <button className="p-2 bg-yellow-400 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                  </svg>
                </button>
                <button className="p-2 bg-gray-200 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Сетка товаров */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-4">Попробуйте изменить параметры фильтрации</p>
                <Button
                  onClick={() => setFilters({
                    category: "all",
                    priceRange: "all",
                    sortBy: "name",
                    search: ""
                  })}
                >
                  Сбросить фильтры
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/products/${product.id}`}>
                      <div className="h-48 bg-gray-100 overflow-hidden image-container">
                        <img
                          src={getProductImageUrl(product.imageUrl)}
                          alt={product.name}
                          className="product-image"
                          onError={handleImageError}
                        />
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold text-black mb-2 hover:text-yellow-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>

                      {product.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 text-justify">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-gray-900">
                          {product.price.toLocaleString()} ₽
                        </span>
                        {product.category && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                            {product.category.name}
                          </span>
                        )}
                      </div>

                      {isInCart(product.id) ? (
                        <Link href="/cart" className="w-full">
                          <Button className="w-full bg-green-500 hover:bg-green-600">
                            Перейти в корзину
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          onClick={() => handleAddToCart(product)}
                          className="w-full"
                        >
                          В корзину
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Пагинация (если нужно) */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center gap-2">
                  <button className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button className="px-3 py-2 bg-yellow-500 text-gray-700 rounded-lg font-semibold">1</button>
                  <button className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">2</button>
                  <button className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">3</button>

                  <button className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

        <Footer />
      </div>
    </>
  );
}