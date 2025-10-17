import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  
  try {
    // Получаем токен из cookies или headers
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value || 
                       request.headers.get('authorization')?.replace('Bearer ', '');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch(`${API_BASE}/products/${productId}/images`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching product images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  
  try {
    // Получаем токен из localStorage через headers запроса
    const authHeader = request.headers.get('authorization');
    
    console.log('[API Route] POST /products/${productId}/images', {
      productId,
      hasAuth: !!authHeader,
      authPreview: authHeader ? authHeader.substring(0, 20) + '...' : 'none'
    });
    
    const formData = await request.formData();
    
    const headers: HeadersInit = {};
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    console.log('[API Route] Calling backend:', `${API_BASE}/products/${productId}/images`);
    
    const response = await fetch(`${API_BASE}/products/${productId}/images`, {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('[API Route] Backend response:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Route] Backend error:', errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Error uploading product image:', error);
    return NextResponse.json({ error: 'Failed to upload image', details: String(error) }, { status: 500 });
  }
}

