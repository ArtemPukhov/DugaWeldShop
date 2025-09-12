"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
};

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories") // через прокси
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Ошибка загрузки категорий:", err));
  }, []);

  return (
<aside className="w-full md:w-1/4 bg-white p-4 rounded-2xl shadow-md border border-gray-200">
  <h2 className="text-xl font-semibold mb-4 text-gray-900">Категории</h2>

  <div className="bg-yellow-400 rounded-xl p-3 flex flex-col gap-2">
    {categories.map(cat => (
      <Link
        key={cat.id}
        href={`/categories/${cat.id}`}
        className="px-4 py-2 rounded-md font-semibold text-black
                   transition-all duration-200 transform hover:bg-red-500 hover:scale-105 hover:text-white"
      >
        {cat.name}
      </Link>
    ))}
  </div>
</aside>

  );
}
