'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Используем прокси роуты вместо прямых обращений к backend
  const API_BASE_URL = '';

  // Функция для получения информации о пользователе
  const fetchUserInfo = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Если токен недействителен, удаляем его
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return null;
      }

      const data = await response.json();
      return data.authenticated ? data.user : null;
    } catch (error) {
      console.error('Ошибка при получении информации о пользователе:', error);
      return null;
    }
  };

  // Проверяем аутентификацию при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const userInfo = await fetchUserInfo();
      
      if (userInfo) {
        setUser(userInfo);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Обновляем информацию о пользователе
    await updateUser();
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async () => {
    const userInfo = await fetchUserInfo();
    if (userInfo) {
      setUser(userInfo);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
