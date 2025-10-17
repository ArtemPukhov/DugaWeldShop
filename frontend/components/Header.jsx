"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import CartIcon from "@/components/CartIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { User, LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-black text-white shadow-md">
      {/* Верхняя часть хедера */}
      <div className="p-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-yellow-400 transition-colors">
          DugaWeld
        </Link>
        
        {/* Навигационные ссылки */}
        <nav className="hidden lg:flex space-x-6">
          <Link href="/" className="hover:text-yellow-400 transition-colors">Главная</Link>
          <Link href="/catalog" className="hover:text-yellow-400 transition-colors">Каталог</Link>
          <Link href="/about" className="hover:text-yellow-400 transition-colors">О компании</Link>
          <Link href="/contacts" className="hover:text-yellow-400 transition-colors">Контакты</Link>
        </nav>
        
        {/* Правая часть */}
        <div className="flex items-center space-x-4">
          <CartIcon />
          
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 hover:text-yellow-400 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">{user?.firstName || user?.username}</span>
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
      </div>

      {/* Строка поиска */}
      <div className="bg-gray-900 px-4 py-3 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск товаров по названию..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition-all placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-2 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-md transition-all duration-200 hover:shadow-lg"
              >
                Найти
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
