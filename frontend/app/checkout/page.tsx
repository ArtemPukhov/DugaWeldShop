'use client';

import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface OrderForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  comment: string;
}

export default function CheckoutPage() {
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [formData, setFormData] = useState<OrderForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    comment: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Отправка заказа на сервер
      const orderData = {
        items: items,
        totalPrice: getTotalPrice(),
        customerInfo: formData,
        orderDate: new Date().toISOString(),
      };

      const response = await fetch('/api/orders-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка при оформлении заказа');
      }

      // Очищаем корзину после успешного заказа
      clearCart();
      setOrderSuccess(true);
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Корзина пуста</h1>
            <p className="text-gray-600 mb-8">Добавьте товары в корзину, чтобы оформить заказ</p>
            <Button onClick={() => router.push('/')}>
              Перейти к покупкам
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Заказ оформлен!</h1>
            <p className="text-gray-600 mb-8">
              Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время для подтверждения.
            </p>
            <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
              Вернуться на главную
            </Button>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Оформление заказа</h1>
          <p className="text-gray-600">
            Заполните данные для доставки и подтвердите заказ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма заказа */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Данные для доставки</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Личная информация */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Имя *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Фамилия *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Адрес */}
                  <div>
                    <Label htmlFor="address">Адрес</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Улица, дом, квартира"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Город</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Почтовый индекс</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment">Комментарий к заказу</Label>
                    <Textarea
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      placeholder="Дополнительная информация о заказе"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? 'Оформляем заказ...' : 'Подтвердить заказ'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Итого заказа */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-gray-900">Ваш заказ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{item.name}</p>
                        <p className="text-gray-900 text-sm">× {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString()} ₽
                      </p>
                    </div>
                  ))}
                  
                  <hr className="border-gray-200" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Товары ({getTotalItems()}):</span>
                      <span>{getTotalPrice().toLocaleString()} ₽</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Доставка:</span>
                      <span className="text-green-600">Бесплатно</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Всего:</span>
                      <span>{getTotalPrice().toLocaleString()} ₽</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => router.push('/cart')}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Вернуться в корзину
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
