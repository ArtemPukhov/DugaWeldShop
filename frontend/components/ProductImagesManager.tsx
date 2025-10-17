'use client';

import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
}

interface ProductImagesManagerProps {
  productId: number;
  onImagesUpdate?: () => void;
}

export default function ProductImagesManager({ productId, onImagesUpdate }: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      // Проверяем оба токена: обычный и админский
      const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('dw_admin_token');
      const headers: HeadersInit = {};
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`/api/products/${productId}/images`, {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке изображений:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // Проверяем оба токена: обычный и админский
      const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('dw_admin_token');
      
      console.log('🔍 Проверка токенов:', {
        hasAccessToken: !!localStorage.getItem('accessToken'),
        hasAdminToken: !!localStorage.getItem('dw_admin_token'),
        selectedToken: accessToken ? 'found' : 'not found'
      });
      
      if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
        console.error('❌ Токен отсутствует или невалиден!');
        alert('Необходимо войти в систему. Пожалуйста, перейдите на страницу /admin/login');
        return;
      }
      
      // Декодируем токен для проверки
      try {
        const parts = accessToken.split('.');
        if (parts.length !== 3) {
          throw new Error('Неверный формат JWT токена');
        }
        const payload = JSON.parse(atob(parts[1]));
        console.log('🔑 Текущий токен:', {
          sub: payload.sub,
          roles: payload.roles,
          exp: new Date(payload.exp * 1000).toLocaleString()
        });
      } catch (e) {
        console.error('Ошибка декодирования токена:', e);
        alert('Токен поврежден. Пожалуйста, войдите заново.');
        return;
      }
      
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);
        formData.append('displayOrder', String(images.length + i));
        formData.append('isPrimary', String(images.length === 0 && i === 0));

        const headers: HeadersInit = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`/api/products/${productId}/images`, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Ошибка загрузки изображения:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Ошибка при загрузке изображения: ${response.status} ${errorText}`);
        }
      }

      await fetchImages();
      if (onImagesUpdate) onImagesUpdate();
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error);
      alert('Не удалось загрузить изображения');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('Удалить это изображение?')) return;

    try {
      // Проверяем оба токена: обычный и админский
      const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('dw_admin_token');
      const headers: HeadersInit = {};
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`/api/products/images/${imageId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        await fetchImages();
        if (onImagesUpdate) onImagesUpdate();
      }
    } catch (error) {
      console.error('Ошибка при удалении изображения:', error);
      alert('Не удалось удалить изображение');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Изображения товара</h3>
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            disabled={uploading}
            className="flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              input?.click();
            }}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Загрузка...' : 'Загрузить изображения'}
          </Button>
        </label>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Загрузка...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Нет изображений</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={image.imageUrl}
                  alt={`Изображение ${image.displayOrder + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Главное
                  </div>
                )}
                <button
                  onClick={() => handleDelete(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                Порядок: {image.displayOrder}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

