'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Check } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem, isInCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем переход по ссылке
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group">
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.imageUrl || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.png';
            }}
          />
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xl font-bold text-gray-900 mb-4">
            {product.price.toLocaleString()} ₽
          </p>
        </div>
      </Link>
      
      <div className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className={`w-full font-semibold transition-all duration-300 flex items-center justify-center ${
            addedToCart 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : isInCart(product.id)
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-yellow-500 hover:bg-yellow-600 text-black'
          }`}
        >
          {addedToCart ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Добавлено!
            </>
          ) : isInCart(product.id) ? (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              В корзине
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              В корзину
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
