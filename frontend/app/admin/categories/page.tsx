"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiFetchJSON } from "@/lib/api";
import AdminTopBar from "@/components/AdminTopBar";

type Category = {
  id?: number;
  name: string;
  description?: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Category>({ name: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Category[]>(`/categories`, { cache: "no-store" });
      setCategories(data);
    } catch (e: any) {
      setError(e.message || "Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function resetForm() {
    setForm({ name: "", description: "" });
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await apiFetchJSON(`/categories/${editingId}`, "PUT", form);
      } else {
        await apiFetchJSON(`/categories`, "POST", form);
      }
      resetForm();
      await fetchCategories();
    } catch (e: any) {
      setError(e.message || "Ошибка сохранения");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить категорию?")) return;
    setError(null);
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      await fetchCategories();
    } catch (e: any) {
      setError(e.message || "Ошибка удаления");
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id!);
    setForm({ name: cat.name, description: cat.description || "" });
  }

  return (
    <div>
      <AdminTopBar />
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Категории</h1>

      {error && <div className="text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded">
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
          <label className="block text-sm mb-1">Описание</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            value={form.description}
            onChange={(e) =>
              setForm((s) => ({ ...s, description: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId && (
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
                <th>Описание</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="py-2">{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.description}</td>
                  <td className="text-right space-x-2">
                    <button
                      className="underline text-blue-600"
                      onClick={() => startEdit(c)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="underline text-red-600"
                      onClick={() => c.id && handleDelete(c.id)}
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


