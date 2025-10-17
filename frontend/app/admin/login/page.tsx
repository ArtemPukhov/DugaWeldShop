"use client";

import { useState } from "react";
import { apiFetchJSON, saveToken, saveRefreshToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetchJSON<{ accessToken?: string; token?: string; refreshToken?: string }>("/auth/login-user", "POST", {
        username,
        password,
      });
      
      // Backend возвращает accessToken, но старый код ожидал token
      const tokenToSave = res.accessToken || res.token;
      
      if (!tokenToSave) {
        throw new Error("Токен не получен от сервера");
      }
      
      // Декодируем токен для проверки
      try {
        const payload = JSON.parse(atob(tokenToSave.split('.')[1]));
        console.log('🔑 Вошли как:', payload.sub, '| Роль:', payload.roles);
      } catch (e) {
        console.error('Ошибка декодирования токена:', e);
      }
      
      saveToken(tokenToSave);
      if (res.refreshToken) saveRefreshToken(res.refreshToken);
      router.push("/admin");
    } catch (e: any) {
      setError(e.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="mb-4 flex justify-end">
        <a href="/admin" className="text-blue-600 underline">Назад в админку</a>
      </div>
      <h1 className="text-2xl font-semibold mb-6">Вход администратора</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Логин</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Пароль</label>
          <input
            type="password"
            className="border rounded px-3 py-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
    </div>
  );
}



