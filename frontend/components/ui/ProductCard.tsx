"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative rounded-2xl bg-white shadow-lg overflow-hidden transition-shadow hover:shadow-2xl">
      {/* Картинка */}
      <div className="h-64 w-full overflow-hidden">
        <img
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
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
          <Button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 text-sm">
            В корзину
          </Button>
        </div>
      </div>
    </div>
  );
}
