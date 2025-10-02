"use client";

import { useState, useEffect } from "react";

export default function TestApiPage() {
  const [status, setStatus] = useState<string>("Проверяем подключение...");
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Тест подключения к API
    fetch('/api/categories')
      .then(res => {
        setStatus(`Статус ответа: ${res.status} ${res.statusText}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setCategories(data);
        setStatus("✅ API работает корректно!");
        setError(null);
      })
      .catch(err => {
        setError(`❌ Ошибка API: ${err.message}`);
        setStatus("Ошибка подключения");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Тест API подключения</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Статус подключения</h2>
          <p className="text-lg mb-2">{status}</p>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Данные категорий</h2>
          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((cat, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium">{cat.name}</h3>
                  {cat.description && <p className="text-gray-600">{cat.description}</p>}
                  {cat.imageUrl && <p className="text-sm text-blue-600">Изображение: {cat.imageUrl}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Нет данных для отображения</p>
          )}
        </div>

        <div className="mt-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h3 className="font-semibold">Инструкции:</h3>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Убедитесь, что бэкенд запущен на порту 8080</li>
            <li>Запустите Main.java через IDE или используйте start-backend.bat</li>
            <li>Обновите эту страницу после запуска бэкенда</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

