'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasToken } from '@/lib/api';
import AdminTopBar from '@/components/AdminTopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Download
} from 'lucide-react';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  statusDisplayName: string;
  totalPrice: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  orderItems: OrderItem[];
}

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  productImageUrl?: string;
}

interface OrdersPage {
  content: Order[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export default function OrdersAdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  
  const [orders, setOrders] = useState<OrdersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры и поиск
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Статусы заказов
  const orderStatuses = [
    { value: 'PENDING', label: 'Ожидает обработки', color: 'bg-yellow-200 text-yellow-900 border border-yellow-300' },
    { value: 'CONFIRMED', label: 'Подтвержден', color: 'bg-blue-200 text-blue-900 border border-blue-300' },
    { value: 'PROCESSING', label: 'В обработке', color: 'bg-purple-200 text-purple-900 border border-purple-300' },
    { value: 'SHIPPED', label: 'Отправлен', color: 'bg-indigo-200 text-indigo-900 border border-indigo-300' },
    { value: 'DELIVERED', label: 'Доставлен', color: 'bg-green-200 text-green-900 border border-green-300' },
    { value: 'CANCELLED', label: 'Отменен', color: 'bg-red-200 text-red-900 border border-red-300' },
  ];

  useEffect(() => {
    if (!hasToken()) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);
    fetchOrders();
  }, [router, currentPage, pageSize, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        sortBy: 'orderDate',
        sortDir: 'desc'
      });
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/orders-proxy?${params}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      setError(`Не удалось загрузить заказы: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders-proxy/${orderId}/status?status=${newStatus}`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка обновления статуса');
      }
      
      // Обновляем локальное состояние
      setOrders(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus, statusDisplayName: orderStatuses.find(s => s.value === newStatus)?.label || newStatus }
              : order
          )
        };
      });
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
      alert('Не удалось обновить статус заказа');
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/orders-proxy/${orderId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка удаления заказа');
      }
      
      fetchOrders(); // Перезагружаем список
    } catch (err) {
      console.error('Ошибка удаления заказа:', err);
      alert('Не удалось удалить заказ');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = orderStatuses.find(s => s.value === status);
    return (
      <Badge className={statusInfo?.color || 'bg-gray-100 text-gray-800'}>
        {statusInfo?.label || status}
      </Badge>
    );
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

  if (!ready) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление заказами
          </h1>
          <p className="text-gray-600">
            Просмотр, редактирование и управление заказами клиентов
          </p>
        </div>

        {/* Фильтры и поиск */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Filter className="w-5 h-5 mr-2" />
              Фильтры и поиск
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search" className="text-gray-900">Поиск</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Поиск по имени, email, номеру заказа..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-gray-900">Статус заказа</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    {orderStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-900">Размер страницы</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 заказов</SelectItem>
                    <SelectItem value="10">10 заказов</SelectItem>
                    <SelectItem value="20">20 заказов</SelectItem>
                    <SelectItem value="50">50 заказов</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Таблица заказов */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">
              Заказы {orders && `(${orders.totalElements})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Загрузка заказов...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
                <Button onClick={fetchOrders} className="mt-4">
                  Попробовать снова
                </Button>
              </div>
            ) : orders && orders.content.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Заказы не найдены</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-900 font-semibold">Номер заказа</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Клиент</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Email</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Сумма</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Статус</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Дата</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.content.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium text-gray-900">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {order.customerFirstName} {order.customerLastName}
                          </TableCell>
                          <TableCell className="text-gray-900">{order.customerEmail}</TableCell>
                          <TableCell className="text-gray-900">
                            {order.totalPrice.toLocaleString()} ₽
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {formatDate(order.orderDate)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value)}
                              >
                                <SelectTrigger className="w-32">
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
                              <Button
                                onClick={() => handleDeleteOrder(order.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Пагинация */}
                {orders && orders.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Показано {orders.number * orders.size + 1}-{Math.min((orders.number + 1) * orders.size, orders.totalElements)} из {orders.totalElements}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={orders.first}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="px-3 py-2 text-sm">
                        Страница {orders.number + 1} из {orders.totalPages}
                      </span>
                      <Button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={orders.last}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
