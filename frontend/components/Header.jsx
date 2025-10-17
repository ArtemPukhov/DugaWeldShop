"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import CartIcon from "@/components/CartIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { User, LogOut, ShoppingBag } from "lucide-react";

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };


  return (
    <header className="bg-black text-white p-4 flex justify-between items-center shadow-md">
      <Link href="/" className="text-2xl font-bold hover:text-yellow-400">
        DugaWeld
      </Link>
      <nav className="space-x-6">
        <Link href="/" className="hover:text-yellow-400">Главная</Link>
        <Link href="/catalog" className="hover:text-yellow-400">Каталог</Link>
        <Link href="/about" className="hover:text-yellow-400">О компании</Link>
        <Link href="/contacts" className="hover:text-yellow-400">Контакты</Link>
      </nav>
      <div className="flex items-center space-x-4">
        <CartIcon />
        
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover:text-yellow-400"
            >
              <User className="w-5 h-5" />
              <span>{user?.firstName || user?.username}</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                  <div className="text-gray-500">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="bg-white text-black border-white hover:bg-gray-100 hover:text-black">
                Войти
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                Регистрация
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
