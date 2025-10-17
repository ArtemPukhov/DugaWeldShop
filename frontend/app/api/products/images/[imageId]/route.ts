import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const { imageId } = await params;
  
  try {
    // Получаем токен из cookies или headers
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value || 
                       request.headers.get('authorization')?.replace('Bearer ', '');
    
    const headers: HeadersInit = {};
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch(`${API_BASE}/products/images/${imageId}`, {
      method: 'DELETE',
      headers,
    });

    if (response.ok) {
      return NextResponse.json({ success: true }, { status: 204 });
    } else {
      return NextResponse.json({ error: 'Failed to delete image' }, { status: response.status });
    }
  } catch (error) {
    console.error('Error deleting product image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}

