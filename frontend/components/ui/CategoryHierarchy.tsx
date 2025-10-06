"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCategoryImageUrl, handleImageError } from "@/lib/imageUtils";

type Category = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
};

interface CategoryHierarchyProps {
  category: Category;
}

export default function CategoryHierarchy({ category }: CategoryHierarchyProps) {
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSubcategories = async () => {
    if (subcategories.length > 0) {
      setShowSubcategories(!showSubcategories);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/categories/${category.id}/subcategories`);
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
        setShowSubcategories(true);
      }
    } catch (error) {
      console.error("Ошибка загрузки подкатегорий:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <Link href={`/categories/${category.id}`}>
        <div className="h-48 overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-100 image-container">
          <img
            src={getCategoryImageUrl(category.imageUrl)}
            alt={category.name}
            className="category-image"
            onError={handleImageError}
          />
        </div>
      </Link>
      
      <div className="p-6">
        <Link href={`/categories/${category.id}`}>
          <h3 className="text-xl font-bold mb-2 text-gray-900 hover:text-yellow-600 transition-colors">
            {category.name}
          </h3>
        </Link>
        
        {category.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {category.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Link 
            href={`/categories/${category.id}`}
            className="text-yellow-600 font-medium text-sm hover:text-yellow-700 flex items-center"
          >
            Перейти к товарам
            <svg className="w-4 h-4 ml-2 transition-transform hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <button
            onClick={fetchSubcategories}
            className="text-blue-600 font-medium text-sm hover:text-blue-700 flex items-center"
            disabled={loading}
          >
            {loading ? "Загрузка..." : showSubcategories ? "Скрыть" : "Подкатегории"}
            <svg 
              className={`w-4 h-4 ml-1 transition-transform ${showSubcategories ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showSubcategories && subcategories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Подкатегории:</h4>
            <div className="grid grid-cols-1 gap-2">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${sub.id}`}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 mr-3 overflow-hidden image-container">
                    <img
                      src={getCategoryImageUrl(sub.imageUrl)}
                      alt={sub.name}
                      className="thumbnail-image"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-yellow-600 transition-colors truncate">
                      {sub.name}
                    </p>
                    {sub.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {sub.description}
                      </p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-yellow-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
