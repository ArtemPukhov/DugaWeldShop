"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { getProductImageUrl, handleImageError } from "@/lib/imageUtils";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: number;
};

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, items } = useCart();

  // Функция для добавления товара в корзину
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId || 0,
      quantity: 1
    });
  };

  // Функция для проверки, есть ли товар в корзине
  const isInCart = () => {
    return items.some(item => item.id === product.id);
  };

  return (
    <div className="group relative rounded-2xl bg-white shadow-lg overflow-hidden transition-shadow hover:shadow-2xl">
      {/* Картинка */}
      <div className="h-64 w-full overflow-hidden image-container">
        <img
          src={getProductImageUrl(product.imageUrl)}
          alt={product.name}
          className="product-image"
          onError={handleImageError}
        />
      </div>

      {/* Содержимое */}
      <div className="p-4 flex flex-col justify-between h-40">
        <div>
          <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
          {product.description && (
            <p className="text-gray-500 text-sm mb-2 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-gray-800 font-bold">{product.price.toLocaleString()} ₽</p>
          {isInCart() ? (
            <Link href="/cart">
              <Button className="opacity-100 transition-all duration-300 px-4 py-2 text-sm bg-green-500 hover:bg-green-600">
                Перейти в корзину
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={handleAddToCart}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 text-sm bg-yellow-500 hover:bg-red-500"
            >
              В корзину
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
