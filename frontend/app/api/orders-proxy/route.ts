import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_TARGET || 'http://127.0.0.1:8080';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`;
    
    console.log('API Proxy - Request URL:', url);
    console.log('API Proxy - Query:', queryString);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API Proxy - Response status:', response.status);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Backend error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`;
    
    const body = await request.json();
    
    console.log('API Proxy POST - Request URL:', url);
    console.log('API Proxy POST - Body:', body);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('API Proxy POST - Response status:', response.status);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Backend error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
