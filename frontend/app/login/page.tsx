'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<LoginForm>({
    username: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Неверный логин или пароль');
      }

      const data = await response.json();
      
      console.log('✅ Успешный ответ от сервера:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken
      });
      
      // Декодируем токен для проверки
      if (data.accessToken) {
        try {
          const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
          console.log('🔑 Полученный токен:', {
            sub: payload.sub,
            roles: payload.roles
          });
        } catch (e) {
          console.error('Ошибка декодирования токена:', e);
        }
      }
      
      // Используем AuthContext для входа
      await login(data.accessToken, data.refreshToken);
      
      console.log('✅ Токены сохранены в AuthContext');
      
      // Перенаправляем на главную страницу
      router.push('/');

    } catch (error) {
      console.error('❌ Ошибка при входе:', error);
      setError(error instanceof Error ? error.message : 'Произошла ошибка при входе');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Вход в аккаунт
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Войдите в свой аккаунт для удобных покупок
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Войти</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Имя пользователя *</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Пароль *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Входим...' : 'Войти'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Нет аккаунта?{' '}
                  <button
                    onClick={() => router.push('/register')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Зарегистрироваться
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
