"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiFetchForm, apiFetchJSON, apiDeleteProductsBulk } from "@/lib/api";
import AdminTopBar from "@/components/AdminTopBar";
import { CsvImport } from "@/components/CsvImport";

type Category = { id: number; name: string; imageUrl?: string; };
type Product = {
  id?: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    categoryId: 0,
  });
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [pjson, cjson] = await Promise.all([
        apiFetch<Product[]>(`/products`, { cache: "no-store" }),
        apiFetch<Category[]>(`/categories`, { cache: "no-store" }),
      ]);
      setProducts(pjson);
      setCategories(cjson);
    } catch (e: any) {
      setError(e.message || "Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function resetForm() {
    setForm({ name: "", description: "", price: 0, categoryId: 0 });
    setImage(null);
    setEditingId(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description || "");
      fd.append("price", String(form.price));
      fd.append("categoryId", String(form.categoryId));
      if (image) fd.append("image", image);

      await apiFetch(`/products`, { method: "POST", body: fd });
      resetForm();
      await fetchData();
    } catch (e: any) {
      setError(e.message || "Ошибка создания");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    try {
      await apiFetchJSON(`/products/${editingId}`, "PUT", {
        name: form.name,
        description: form.description,
        price: form.price,
        categoryId: form.categoryId,
        imageUrl: form.imageUrl || "",
      });
      resetForm();
      await fetchData();
    } catch (e: any) {
      setError(e.message || "Ошибка сохранения");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить товар?")) return;
    setError(null);
    try {
      await apiFetch(`/products/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (e: any) {
      setError(e.message || "Ошибка удаления");
    }
  }

  async function handleBulkDelete() {
    if (selectedProducts.length === 0) {
      setError("Выберите товары для удаления");
      return;
    }
    
    if (!confirm(`Удалить ${selectedProducts.length} товаров?`)) return;
    
    setError(null);
    setLoading(true);
    try {
      const result = await apiDeleteProductsBulk(selectedProducts);
      setSelectedProducts([]);
      await fetchData();
      setError(null);
    } catch (e: any) {
      setError(e.message || "Ошибка массового удаления");
    } finally {
      setLoading(false);
    }
  }

  function toggleProductSelection(id: number) {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(productId => productId !== id)
        : [...prev, id]
    );
  }

  function selectAllProducts() {
    const allProductIds = products.map(p => p.id!).filter(Boolean);
    setSelectedProducts(allProductIds);
  }

  function clearSelection() {
    setSelectedProducts([]);
  }

  function startEdit(p: Product) {
    setEditingId(p.id!);
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || "",
      price: Number(p.price),
      categoryId: Number(p.categoryId),
      imageUrl: p.imageUrl,
    });
    setImage(null);
  }

  const isEditing = Boolean(editingId);

  return (
    <div>
      <AdminTopBar />
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Товары</h1>

      {error && <div className="text-red-600">{error}</div>}

      <CsvImport onImportComplete={fetchData} />

      <form
        onSubmit={isEditing ? handleSave : handleCreate}
        className="space-y-3 border p-4 rounded"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Название</label>
            <input
              className="border rounded px-3 py-2 w-full text-black bg-white"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Цена</label>
            <input
              type="number"
              step="0.01"
              className="border rounded px-3 py-2 w-full text-black bg-white"
              value={form.price}
              onChange={(e) =>
                setForm((s) => ({ ...s, price: Number(e.target.value) }))
              }
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Описание</label>
            <textarea
              className="border rounded px-3 py-2 w-full text-black bg-white"
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Категория</label>
            <select
              className="border rounded px-3 py-2 w-full text-black bg-white"
              value={form.categoryId}
              onChange={(e) =>
                setForm((s) => ({ ...s, categoryId: Number(e.target.value) }))
              }
              required
            >
              <option value={0} disabled className="text-gray-500">
                Выберите категорию
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="text-black">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {!isEditing && (
            <div>
              <label className="block text-sm mb-1">Изображение</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isEditing ? "Сохранить" : "Добавить"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={resetForm}
            >
              Отмена
            </button>
          )}
        </div>
      </form>

      <div>
        {selectedProducts.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                Выбрано товаров: {selectedProducts.length}
              </span>
              <div className="space-x-2">
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-100"
                >
                  Очистить выбор
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Удалить выбранные
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div>Загрузка...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 w-12">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={selectedProducts.length === products.length ? clearSelection : selectAllProducts}
                    className="rounded"
                  />
                </th>
                <th>Название</th>
                <th>Цена</th>
                <th>Категория</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(p.id!)}
                      onChange={() => p.id && toggleProductSelection(p.id)}
                      className="rounded"
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>
                    {categories.find((c) => c.id === p.categoryId)?.name ||
                      p.categoryId}
                  </td>
                  <td className="text-right space-x-2">
                    <button
                      className="underline text-blue-600"
                      onClick={() => startEdit(p)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="underline text-red-600"
                      onClick={() => p.id && handleDelete(p.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>
    </div>
  );
}


