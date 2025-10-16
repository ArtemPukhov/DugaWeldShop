'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CartIcon() {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <Link 
      href="/cart" 
      className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
    >
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
