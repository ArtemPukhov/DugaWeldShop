"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  imageUrl?: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
};

interface CategoryTreeItemProps {
  category: Category;
  level?: number;
}

function CategoryTreeItem({ category, level = 0 }: CategoryTreeItemProps) {
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSubcategories, setHasSubcategories] = useState<boolean | null>(null);

  // Проверяем, есть ли подкатегории при первой загрузке
  useEffect(() => {
    fetch(`/api/categories/${category.id}/subcategories`)
      .then(res => res.json())
      .then(data => {
        setHasSubcategories(data.length > 0);
      })
      .catch(err => {
        console.error("Ошибка проверки подкатегорий:", err);
        setHasSubcategories(false);
      });
  }, [category.id]);

  const toggleExpanded = async () => {
    if (!hasSubcategories) return;

    if (!isExpanded && subcategories.length === 0) {
      setLoading(true);
      try {
        const response = await fetch(`/api/categories/${category.id}/subcategories`);
        if (response.ok) {
          const data = await response.json();
          setSubcategories(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки подкатегорий:", error);
      } finally {
        setLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const indentClass = level > 0 ? `ml-${level * 4}` : '';
  const paddingLeft = level * 16; // 16px на каждый уровень

  return (
    <div>
      <div 
        className="flex items-center px-3 py-2 rounded-md font-medium text-black transition-all duration-200 hover:bg-red-500 hover:text-white group"
        style={{ paddingLeft: `${12 + paddingLeft}px` }}
      >
        {/* Кнопка раскрытия/скрытия */}
        {hasSubcategories !== null && (
          <button
            onClick={toggleExpanded}
            className="mr-2 w-4 h-4 flex items-center justify-center text-xs hover:bg-black hover:bg-opacity-20 rounded transition-colors"
            disabled={!hasSubcategories}
          >
            {hasSubcategories ? (
              loading ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg 
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )
            ) : (
              <div className="w-3 h-3"></div> // Пустое место для выравнивания
            )}
          </button>
        )}

        {/* Ссылка на категорию */}
        <Link
          href={`/categories/${category.id}`}
          className="flex-1 hover:underline"
        >
          {category.name}
        </Link>
      </div>

      {/* Подкатегории */}
      {isExpanded && subcategories.length > 0 && (
        <div className="mt-1">
          {subcategories.map(subcat => (
            <CategoryTreeItem 
              key={subcat.id} 
              category={subcat} 
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryList() {
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories/root")
      .then(res => {
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        return res.json();
      })
      .then(data => {
        setRootCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки категорий:", err);
        setError("Не удалось загрузить категории");
        setLoading(false);
      });
  }, []);

  return (
    <aside className="w-full md:w-1/4 bg-white p-4 rounded-2xl shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Категории</h2>

      <div className="bg-yellow-400 rounded-xl p-3">
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-black">Загрузка...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : rootCategories.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Категории отсутствуют</p>
          </div>
        ) : (
          <div className="space-y-1">
            {rootCategories.map(category => (
              <CategoryTreeItem key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
