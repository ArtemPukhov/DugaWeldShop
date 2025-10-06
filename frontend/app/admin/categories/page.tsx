"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiFetchJSON } from "@/lib/api";
import { getCategoryImageUrl, handleImageError } from "@/lib/imageUtils";
import AdminTopBar from "@/components/AdminTopBar";

type Category = {
  id?: number;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Category>({ name: "", description: "", imageUrl: "", parentCategoryId: undefined });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    setForm({ name: "", description: "", imageUrl: "", parentCategoryId: undefined });
    setEditingId(null);
    setImageFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        // Для редактирования используем FormData если есть новое изображение
        if (imageFile) {
          const fd = new FormData();
          fd.append("name", form.name);
          fd.append("description", form.description || "");
          fd.append("parentCategoryId", String(form.parentCategoryId || ""));
          fd.append("image", imageFile);
          
          await apiFetch(`/categories/${editingId}`, { method: "PUT", body: fd });
        } else {
          // Если нет нового изображения, используем JSON
          await apiFetchJSON(`/categories/${editingId}`, "PUT", form);
        }
      } else {
        // Для создания используем FormData если есть изображение
        if (imageFile) {
          const fd = new FormData();
          fd.append("name", form.name);
          fd.append("description", form.description || "");
          fd.append("parentCategoryId", String(form.parentCategoryId || ""));
          fd.append("image", imageFile);
          
          await apiFetch(`/categories`, { method: "POST", body: fd });
        } else {
          await apiFetchJSON(`/categories`, "POST", form);
        }
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
    setForm({ 
      name: cat.name, 
      description: cat.description || "", 
      imageUrl: cat.imageUrl || "",
      parentCategoryId: cat.parentCategoryId || undefined
    });
    setImageFile(null);
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
            className="border rounded px-3 py-2 w-full text-black bg-white"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            required
          />
        </div>
        <div>
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
          <label className="block text-sm mb-1">Изображение</label>
          <input
            type="file"
            accept="image/*"
            className="border rounded px-3 py-2 w-full text-black bg-white"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {imageFile && (
            <p className="text-sm text-green-600 mt-1">
              Выбран файл: {imageFile.name}
            </p>
          )}
          {form.imageUrl && !imageFile && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Текущее изображение:</p>
              <div className="flex items-center gap-2">
                <img 
                  src={getCategoryImageUrl(form.imageUrl)} 
                  alt="Текущее изображение"
                  className="w-20 h-20 object-cover rounded border"
                  onError={handleImageError}
                />
                <button
                  type="button"
                  className="text-sm text-red-600 underline"
                  onClick={() => setForm(s => ({ ...s, imageUrl: "" }))}
                >
                  Удалить изображение
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Родительская категория</label>
          <select
            className="border rounded px-3 py-2 w-full text-black bg-white"
            value={form.parentCategoryId || ""}
            onChange={(e) => setForm((s) => ({ 
              ...s, 
              parentCategoryId: e.target.value ? Number(e.target.value) : undefined 
            }))}
          >
            <option value="" className="text-gray-500">
              Корневая категория (без родителя)
            </option>
            {categories
              .filter(cat => cat.id !== editingId) // Исключаем саму категорию из списка родителей
              .map((cat) => (
                <option key={cat.id} value={cat.id} className="text-black">
                  {cat.parentCategoryName ? `${cat.parentCategoryName} → ${cat.name}` : cat.name}
                </option>
              ))}
          </select>
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
                <th>Изображение</th>
                <th>Родительская категория</th>
                <th>Описание</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="py-2">{c.id}</td>
                  <td>
                    {c.parentCategoryId ? (
                      <span className="ml-4">↳ {c.name}</span>
                    ) : (
                      <span className="font-semibold">{c.name}</span>
                    )}
                  </td>
                  <td className="py-2">
                    {c.imageUrl ? (
                      <img 
                        src={getCategoryImageUrl(c.imageUrl)} 
                        alt={c.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={handleImageError}
                      />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="text-gray-600">
                    {c.parentCategoryName || "—"}
                  </td>
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


