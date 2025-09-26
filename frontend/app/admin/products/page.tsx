"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiFetchForm, apiFetchJSON } from "@/lib/api";
import AdminTopBar from "@/components/AdminTopBar";

type Category = { id: number; name: string };
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

      <form
        onSubmit={isEditing ? handleSave : handleCreate}
        className="space-y-3 border p-4 rounded"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Название</label>
            <input
              className="border rounded px-3 py-2 w-full"
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
              className="border rounded px-3 py-2 w-full"
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
              className="border rounded px-3 py-2 w-full"
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Категория</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.categoryId}
              onChange={(e) =>
                setForm((s) => ({ ...s, categoryId: Number(e.target.value) }))
              }
              required
            >
              <option value={0} disabled>
                Выберите категорию
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
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
        {loading ? (
          <div>Загрузка...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">ID</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Категория</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.id}</td>
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


