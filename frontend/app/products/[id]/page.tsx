// app/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryList from "@/components/ui/CategoryList";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
};

type Category = {
  id: number;
  name: string;
};

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`http://localhost:8080/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`http://localhost:8080/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  const categories = await getCategories();

  if (!product) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 p-6 sm:p-10 flex-1">
        {/* Слева: категории */}
        <CategoryList />

        {/* Справа: карточка товара */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row gap-6 md:gap-10 p-6">
          <div className="flex-1 flex flex-col gap-4">
            <img
              src={product.imageUrl || '/placeholder.png'}
              alt={product.name}
              className="w-full h-96 object-cover rounded-2xl"
            />
          </div>

          <div className="flex-1 flex flex-col justify-between p-4 md:p-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-2xl font-semibold text-gray-900">
                {product.price.toLocaleString()} ₽
              </p>
              <div className="flex gap-4 mt-4">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105">
                  В корзину
                </button>
                <Link
                  href="/"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  На главную
                </Link>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              {product.description && (
                <p className="text-gray-600 mb-4">{product.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
