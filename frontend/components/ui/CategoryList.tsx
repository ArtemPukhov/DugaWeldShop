"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2, Layers } from "lucide-react";

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
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSubcategories, setHasSubcategories] = useState<boolean | null>(null);

  // Проверяем, есть ли подкатегории при первой загрузке
  useEffect(() => {
    fetch(`/api/categories/${category.id}/subcategories`)
      .then(res => res.json())
      .then(data => {
        setHasSubcategories(data.length > 0);
        if (data.length > 0) {
          setSubcategories(data); // Загружаем сразу для быстрого отображения при hover
        }
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

  const handleMouseEnter = () => {
    if (hasSubcategories && subcategories.length > 0) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const paddingLeft = level * 16; // 16px на каждый уровень

  return (
    <div 
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="flex items-center px-4 py-3 rounded-lg font-medium text-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white hover:shadow-lg hover:scale-[1.02] cursor-pointer"
        style={{ paddingLeft: `${12 + paddingLeft}px` }}
      >
        {/* Кнопка раскрытия/скрытия */}
        {hasSubcategories !== null && (
          <button
            onClick={toggleExpanded}
            className="mr-2 w-5 h-5 flex items-center justify-center rounded-md hover:bg-white hover:bg-opacity-20 transition-all duration-200"
            disabled={!hasSubcategories}
          >
            {hasSubcategories ? (
              loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronRight 
                  className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} 
                />
              )
            ) : (
              <div className="w-4 h-4"></div>
            )}
          </button>
        )}

        {/* Ссылка на категорию */}
        <Link
          href={`/categories/${category.id}`}
          className="flex-1 hover:translate-x-1 transition-transform duration-200"
        >
          {category.name}
        </Link>

        {/* Индикатор подкатегорий */}
        {hasSubcategories && !isExpanded && (
          <span className="ml-2 text-xs text-gray-500 group-hover:text-white transition-colors">
            ({subcategories.length})
          </span>
        )}
      </div>

      {/* Подкатегории - выезжают вбок при hover (только для корневых категорий) */}
      {level === 0 && isHovered && !isExpanded && subcategories.length > 0 && (
        <div 
          className="absolute left-full top-0 ml-2 z-50 animate-slide-in-right"
          style={{ minWidth: '250px' }}
        >
          <div className="bg-yellow-400 rounded-xl shadow-2xl border-2 border-yellow-500 p-3 space-y-1">
            <div className="text-xs font-semibold text-gray-700 mb-2 pb-2 border-b border-yellow-500">
              {category.name}
            </div>
            {subcategories.map(subcat => (
              <Link
                key={subcat.id}
                href={`/categories/${subcat.id}`}
                className="block px-3 py-2 rounded-lg text-gray-800 font-medium hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white hover:shadow-md transition-all duration-200 hover:translate-x-1"
              >
                {subcat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Подкатегории - раскрываются вниз при клике */}
      {isExpanded && subcategories.length > 0 && (
        <div className="overflow-hidden transition-all duration-300 max-h-[1000px] opacity-100 mt-1">
          <div className="pl-4 space-y-0.5 bg-white bg-opacity-30 rounded-lg py-2">
            {subcategories.map(subcat => (
              <CategoryTreeItem 
                key={subcat.id} 
                category={subcat} 
                level={level + 1}
              />
            ))}
          </div>
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
    <aside className="w-full md:w-1/4 bg-white p-5 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      {/* Заголовок с иконкой */}
      <div className="flex items-center mb-5 pb-3 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
          <Layers className="w-5 h-5 text-gray-800" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Категории</h2>
      </div>

      {/* Контент категорий с ярким желтым фоном */}
      <div className="bg-yellow-400 rounded-xl p-4 shadow-md">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="inline-block w-8 h-8 text-gray-800 animate-spin mb-2" />
            <p className="text-sm text-gray-800 font-medium">Загрузка категорий...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        ) : rootCategories.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <Layers className="inline-block w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Категории отсутствуют</p>
          </div>
        ) : (
          <div className="space-y-1">
            {rootCategories.map(category => (
              <CategoryTreeItem key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>

      {/* Подсказка */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Наведите курсор для просмотра подкатегорий
      </div>

      {/* Добавляем кастомную анимацию */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease-out;
        }
      `}</style>
    </aside>
  );
}
