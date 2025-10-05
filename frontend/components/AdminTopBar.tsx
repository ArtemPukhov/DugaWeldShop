"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("dw_admin_token") : null;
    setUsername(parseUsernameFromToken(token));
  }, []);

  async function handleLogout() {
    await apiLogout();
    location.href = "/admin/login";
  }

  return (
    <div className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-medium">Админ</Link>
          <Link href="/admin/categories" className="text-blue-600">Категории</Link>
          <Link href="/admin/products" className="text-blue-600">Товары</Link>
        </div>
        <div className="flex items-center gap-3">
          {username ? (
            <>
              <span className="text-sm text-gray-700">{username}</span>
              <button onClick={handleLogout} className="px-3 py-1 rounded border">Выйти</button>
            </>
          ) : (
            <Link href="/admin/login" className="px-3 py-1 rounded border">Войти</Link>
          )}
        </div>
      </div>
    </div>
  );
}








