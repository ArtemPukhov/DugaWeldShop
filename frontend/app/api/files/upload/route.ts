import { NextRequest, NextResponse } from 'next/server';

const API_TARGET = process.env.NEXT_PUBLIC_API_TARGET || "http://127.0.0.1:8080";

export async function POST(request: NextRequest) {
  try {
    // Получаем токен авторизации
    const authHeader = request.headers.get('authorization');
    
    // Перенаправляем запрос на Spring Boot API
    const response = await fetch(`${API_TARGET}/api/files/upload`, {
      method: 'POST',
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        // Не устанавливаем Content-Type, чтобы браузер сам установил multipart/form-data
      },
      body: request.body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Ошибка загрузки: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const fileUrl = await response.text();
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

