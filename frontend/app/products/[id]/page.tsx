// app/products/[id]/page.tsx
"use client"; // Делаем компонент клиентским

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryList from "@/components/ui/CategoryList";
import ProductDescriptionView from "@/components/ProductDescriptionView";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  specifications?: string;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');

  // Функция для парсинга характеристик из JSON
  const parseSpecifications = (specsJson?: string) => {
    if (!specsJson) return [];
    try {
      const parsed = JSON.parse(specsJson);
      return Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
    } catch (error) {
      console.error('Ошибка парсинга характеристик:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/404');
            return;
          }
          throw new Error(`Ошибка ${res.status}`);
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error('Ошибка загрузки продукта:', err);
        setError('Не удалось загрузить товар');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Загрузка товара...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-6">{error || 'Товар не найден'}</p>
            <Link
              href="/"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-xl"
            >
              На главную
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

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 p-6 sm:p-10 flex-1">
        {/* Слева: категории */}
        <CategoryList />

        {/* Справа: карточка товара */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row gap-6 md:gap-10 p-6">
          <div className="flex-1 flex flex-col gap-4">
            <img
              src={product.imageUrl || '/placeholder.png'}
              alt={product.name}
              className="w-full h-96 object-contain rounded-2xl" // изменил на object-contain
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.png';
              }}
            />
          </div>

          <div className="flex-1 flex flex-col justify-between p-4 md:p-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-2xl font-semibold text-gray-900">
                {product.price.toLocaleString()} ₽
              </p>
              <div className="flex gap-4 mt-4">
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    // Временная логика добавления в корзину
                    alert(`Товар "${product.name}" добавлен в корзину!`);
                  }}
                >
                  В корзину
                </button>
                <Link
                  href="/"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 flex items-center"
                >
                  На главную
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Вкладки с описанием и характеристиками */}
      {(product.description || product.specifications) && (
        <div className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-6xl mx-auto px-4">
            {/* Навигация по вкладкам */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'description'
                      ? 'bg-yellow-500 text-black shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ОПИСАНИЕ
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'specifications'
                      ? 'bg-yellow-500 text-black shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ХАРАКТЕРИСТИКИ
                </button>
              </div>
            </div>

            {/* Контент вкладок */}
            <div className="max-w-4xl mx-auto">
              {activeTab === 'description' && product.description && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">ОПИСАНИЕ</h3>
                  <ProductDescriptionView 
                    description={product.description}
                    className="text-lg"
                  />
                </div>
              )}

              {activeTab === 'specifications' && product.specifications && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        {parseSpecifications(product.specifications).map((spec, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200 w-1/2">
                              {spec.key}
                            </td>
                            <td className="px-6 py-4 text-gray-600 w-1/2">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}