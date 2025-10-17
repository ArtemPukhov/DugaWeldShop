"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiLogout, hasToken } from "@/lib/api";

function parseUsernameFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return payload?.sub || null;
  } catch {
    return null;
  }
}

export default function AdminTopBar() {
  const [username, setUsername] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("dw_admin_token") : null;
    setUsername(parseUsernameFromToken(token));
  }, []);

  const isActive = (path: string) => {
    return pathname === path || (pathname.startsWith(path) && path !== '/admin');
  };

  async function handleLogout() {
    await apiLogout();
    location.href = "/admin/login";
  }

  return (
    <div className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className={`font-medium ${isActive('/admin') ? 'text-blue-800 border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'}`}
          >
            Админ
          </Link>
          <Link 
            href="/admin/categories" 
            className={`${isActive('/admin/categories') ? 'text-blue-800 border-b-2 border-blue-600 pb-1' : 'text-blue-600 hover:text-blue-800'}`}
          >
            Категории
          </Link>
          <Link 
            href="/admin/products" 
            className={`${isActive('/admin/products') ? 'text-blue-800 border-b-2 border-blue-600 pb-1' : 'text-blue-600 hover:text-blue-800'}`}
          >
            Товары
          </Link>
          <Link 
            href="/admin/carousel" 
            className={`${isActive('/admin/carousel') ? 'text-blue-800 border-b-2 border-blue-600 pb-1' : 'text-blue-600 hover:text-blue-800'}`}
          >
            Карусель
          </Link>
          <Link 
            href="/admin/hero" 
            className={`${isActive('/admin/hero') ? 'text-blue-800 border-b-2 border-blue-600 pb-1' : 'text-blue-600 hover:text-blue-800'}`}
          >
            Главная
          </Link>
          <Link 
            href="/admin/orders" 
            className={`${isActive('/admin/orders') ? 'text-blue-800 border-b-2 border-blue-600 pb-1' : 'text-blue-600 hover:text-blue-800'}`}
          >
            Заказы
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {username ? (
            <>
              <span className="text-sm text-gray-700 font-medium">{username}</span>
              <button onClick={handleLogout} className="px-3 py-1 rounded border border-gray-300 bg-white text-black hover:bg-gray-100">Выйти</button>
            </>
          ) : (
            <Link href="/admin/login" className="px-3 py-1 rounded border border-gray-300 bg-white text-black hover:bg-gray-100">Войти</Link>
          )}
        </div>
      </div>
    </div>
  );
}











