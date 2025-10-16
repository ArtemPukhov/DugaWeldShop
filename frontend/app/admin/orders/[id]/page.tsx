'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Package, Trash2 } from 'lucide-react';
import AdminTopBar from '@/components/AdminTopBar';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  productPrice: number;
  totalPrice: number;
  productImageUrl?: string;
  categoryId?: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalPrice: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  customerPostalCode?: string;
  comment?: string;
  orderDate: string;
  orderItems: OrderItem[];
}

const orderStatuses = [
  { value: 'PENDING', label: 'Ожидает обработки' },
  { value: 'CONFIRMED', label: 'Подтвержден' },
  { value: 'PROCESSING', label: 'В обработке' },
  { value: 'SHIPPED', label: 'Отправлен' },
  { value: 'DELIVERED', label: 'Доставлен' },
  { value: 'CANCELLED', label: 'Отменен' }
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders-proxy/${orderId}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}`);
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Ошибка при загрузке заказа:', error);
      setError('Не удалось загрузить заказ');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(`/api/orders-proxy/${orderId}/status?status=${newStatus}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}`);
      }

      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      alert('Не удалось обновить статус заказа');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders-proxy/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}`);
      }

      router.push('/admin/orders');
    } catch (error) {
      console.error('Ошибка при удалении заказа:', error);
      alert('Не удалось удалить заказ');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
      PENDING: { label: 'Ожидает обработки', variant: 'secondary' },
      CONFIRMED: { label: 'Подтвержден', variant: 'default' },
      PROCESSING: { label: 'В обработке', variant: 'default' },
      SHIPPED: { label: 'Отправлен', variant: 'default' },
      DELIVERED: { label: 'Доставлен', variant: 'default' },
      CANCELLED: { label: 'Отменен', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminTopBar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Загрузка заказа...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminTopBar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-8">
            <p className="text-red-500">{error || 'Заказ не найден'}</p>
            <Button onClick={() => router.push('/admin/orders')} className="mt-4">
              Вернуться к списку заказов
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopBar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/orders')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Заказ {order.orderNumber}
              </h1>
              <p className="text-gray-600">
                От {formatDate(order.orderDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Информация о клиенте */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <User className="w-5 h-5 mr-2" />
                  Информация о клиенте
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Имя</p>
                    <p className="text-gray-900 font-medium">
                      {order.customerFirstName} {order.customerLastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </p>
                    <p className="text-gray-900 font-medium">{order.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Телефон
                    </p>
                    <p className="text-gray-900 font-medium">{order.customerPhone}</p>
                  </div>
                  {order.customerAddress && (
                    <div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Адрес
                      </p>
                      <p className="text-gray-900 font-medium">{order.customerAddress}</p>
                    </div>
                  )}
                  {order.customerCity && (
                    <div>
                      <p className="text-sm text-gray-600">Город</p>
                      <p className="text-gray-900 font-medium">{order.customerCity}</p>
                    </div>
                  )}
                  {order.customerPostalCode && (
                    <div>
                      <p className="text-sm text-gray-600">Почтовый индекс</p>
                      <p className="text-gray-900 font-medium">{order.customerPostalCode}</p>
                    </div>
                  )}
                </div>
                {order.comment && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Комментарий</p>
                    <p className="text-gray-900 font-medium">{order.comment}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Товары в заказе */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Package className="w-5 h-5 mr-2" />
                  Товары в заказе
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(order.orderItems || []).length > 0 ? (
                    (order.orderItems || []).map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        {item.productImageUrl && (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.productName}</h4>
                          <p className="text-sm text-gray-600">Количество: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Цена: {item.productPrice.toLocaleString()} ₽</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {item.totalPrice.toLocaleString()} ₽
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Товары в заказе не найдены</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Статус заказа */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Статус заказа</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Текущий статус</p>
                    {getStatusBadge(order.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Изменить статус</p>
                    <Select
                      value={order.status}
                      onValueChange={handleStatusChange}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Сумма заказа */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Сумма заказа</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Товары:</span>
                    <span className="text-gray-900 font-medium">
                      {(order.orderItems || []).reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()} ₽
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Доставка:</span>
                    <span className="text-gray-900 font-medium">0 ₽</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Итого:</span>
                    <span className="text-gray-900">{order.totalPrice.toLocaleString()} ₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Действия */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Действия</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDeleteOrder}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить заказ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
