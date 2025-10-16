'use client';

import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalItems, getTotalPrice } = useCart();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = async () => {
    if (confirm('Вы уверены, что хотите очистить корзину?')) {
      setIsClearing(true);
      clearCart();
      setIsClearing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Корзина пуста</h1>
            <p className="text-gray-600 mb-8">Добавьте товары в корзину, чтобы продолжить покупки</p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Перейти к покупкам
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-6xl mx-auto w-full p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Корзина ({getTotalItems()} {getTotalItems() === 1 ? 'товар' : 'товаров'})
          </h1>
          <p className="text-gray-600">
            Проверьте выбранные товары и оформите заказ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Список товаров */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Товары в корзине</h2>
                  <Button
                    onClick={handleClearCart}
                    disabled={isClearing}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Очистить корзину
                  </Button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Изображение товара */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.imageUrl || '/placeholder.png'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.png';
                          }}
                        />
                      </div>

                      {/* Информация о товаре */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {item.price.toLocaleString()} ₽
                        </p>
                      </div>

                      {/* Управление количеством */}
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <span className="text-lg font-medium text-black w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Цена за позицию */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {(item.price * item.quantity).toLocaleString()} ₽
                        </p>
                      </div>

                      {/* Удалить товар */}
                      <Button
                        onClick={() => removeItem(item.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Итого и оформление заказа */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Итого
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Товары ({getTotalItems()}):</span>
                  <span>{getTotalPrice().toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Доставка:</span>
                  <span className="text-green-600">Бесплатно</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Всего:</span>
                  <span>{getTotalPrice().toLocaleString()} ₽</span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold">
                  Оформить заказ
                </Button>
              </Link>

              <div className="mt-4 text-center">
                <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                  ← Продолжить покупки
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
