import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_TARGET || 'http://127.0.0.1:8080';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Преобразуем данные в формат, ожидаемый backend
    const createOrderDto = {
      items: orderData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        categoryId: item.categoryId
      })),
      totalPrice: orderData.totalPrice,
      customerInfo: orderData.customerInfo
    };

    // Отправляем заказ на backend
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createOrderDto),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const order = await response.json();

    // Возвращаем успешный ответ
    return NextResponse.json({
      success: true,
      orderId: order.orderNumber,
      order: order,
      message: 'Заказ успешно оформлен',
    });

  } catch (error) {
    console.error('Ошибка при обработке заказа:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Произошла ошибка при оформлении заказа' 
      },
      { status: 500 }
    );
  }
}
