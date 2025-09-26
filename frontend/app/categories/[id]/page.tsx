// app/categories/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

// Получаем категорию по ID
async function getCategory(id: string): Promise<Category | null> {
  try {
    const res = await fetch(`/api/categories/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Получаем товары этой категории
async function getProductsByCategory(id: string): Promise<Product[]> {
  try {
    const res = await fetch(`/api/products/by-category/${id}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const category = await getCategory(params.id);
  const products = await getProductsByCategory(params.id);

  if (!category) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Баннер категории */}
      <section className="bg-yellow-400 text-black text-center py-16">
        <h1 className="text-4xl font-bold">{category.name}</h1>
      </section>

      {/* Основной блок: слева категории, справа товары */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 p-6 sm:p-10 flex-1">
        {/* Слева: категории */}
        <CategoryList />

        {/* Справа: товары выбранной категории */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              Товары отсутствуют
            </p>
          ) : (
            products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <div className="relative rounded-2xl bg-white shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow mx-auto max-w-sm">
                  <div className="h-64 overflow-hidden">
                    <img
                      src={p.imageUrl || "/placeholder.png"}
                      alt={p.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between h-48">
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-2">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-800 font-bold">{p.price.toLocaleString()} ₽</p>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 text-sm bg-yellow-500 hover:bg-red-500 rounded-md">
                        В корзину
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
