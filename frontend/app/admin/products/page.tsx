"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, apiFetchForm, apiFetchJSON, apiDeleteProductsBulk, apiMoveProductsBulk } from "@/lib/api";
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
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<number>(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number>(0); // 0 = все товары
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'none'>('none');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  async function handleBulkMove() {
    if (selectedProducts.length === 0) {
      setError("Выберите товары для переноса");
      return;
    }
    
    if (targetCategoryId === 0) {
      setError("Выберите целевую категорию");
      return;
    }
    
    if (!confirm(`Перенести ${selectedProducts.length} товаров в выбранную категорию?`)) return;
    
    setError(null);
    setLoading(true);
    try {
      const result = await apiMoveProductsBulk(selectedProducts, targetCategoryId);
      setSelectedProducts([]);
      setShowMoveDialog(false);
      setTargetCategoryId(0);
      await fetchData();
      setError(null);
    } catch (e: any) {
      setError(e.message || "Ошибка массового переноса");
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
    const allProductIds = filteredProducts.map(p => p.id!).filter(Boolean);
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

  // Фильтруем и сортируем товары
  const filteredProducts = React.useMemo(() => {
    let filtered = selectedCategoryFilter === 0 
      ? products 
      : products.filter(product => product.categoryId === selectedCategoryFilter);

    // Сортируем товары
    if (sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortBy === 'name') {
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
        } else if (sortBy === 'price') {
          aValue = Number(a.price);
          bValue = Number(b.price);
        } else {
          return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [products, selectedCategoryFilter, sortBy, sortOrder]);

  // Получаем количество товаров в каждой категории
  const getCategoryProductCount = (categoryId: number) => {
    return products.filter(product => product.categoryId === categoryId).length;
  };

  // Очищаем выбор при смене фильтра категории
  const handleCategoryFilterChange = (categoryId: number) => {
    setSelectedCategoryFilter(categoryId);
    setSelectedProducts([]);
  };

  // Функция для обработки сортировки
  const handleSort = (field: 'name' | 'price') => {
    if (sortBy === field) {
      // Если уже сортируем по этому полю, меняем порядок
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Если новое поле, устанавливаем его и порядок по умолчанию
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div>
      <AdminTopBar />
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Товары</h1>

      {error && <div className="text-red-600">{error}</div>}

      {/* Фильтр по категориям */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">Категории:</span>
          <button
            onClick={() => handleCategoryFilterChange(0)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedCategoryFilter === 0
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Все товары ({products.length})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryFilterChange(category.id)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                selectedCategoryFilter === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category.name} ({getCategoryProductCount(category.id)})
            </button>
          ))}
          
          {/* Кнопка сброса сортировки */}
          {sortBy !== 'none' && (
            <button
              onClick={() => setSortBy('none')}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors ml-4"
            >
              Сбросить сортировку
            </button>
          )}
        </div>
      </div>

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
                {selectedCategoryFilter !== 0 && (
                  <span className="text-sm text-gray-600 ml-2">
                    (в категории "{categories.find(c => c.id === selectedCategoryFilter)?.name}")
                  </span>
                )}
              </span>
              <div className="space-x-2">
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-100"
                >
                  Очистить выбор
                </button>
                <button
                  onClick={() => setShowMoveDialog(true)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Перенести в категорию
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
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {selectedCategoryFilter === 0 
              ? "Товары не найдены" 
              : `В категории "${categories.find(c => c.id === selectedCategoryFilter)?.name}" нет товаров`
            }
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 w-12">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={selectedProducts.length === filteredProducts.length ? clearSelection : selectAllProducts}
                    className="rounded"
                  />
                </th>
                <th>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Название
                    {sortBy === 'name' && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort('price')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Цена
                    {sortBy === 'price' && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th>Категория</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
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

      {/* Диалог переноса товаров */}
      {showMoveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Перенести товары в категорию</h3>
            <p className="text-sm text-gray-600 mb-4">
              Выбрано товаров: {selectedProducts.length}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm mb-2">Выберите целевую категорию:</label>
              <select
                className="border rounded px-3 py-2 w-full text-black bg-white"
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(Number(e.target.value))}
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
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowMoveDialog(false);
                  setTargetCategoryId(0);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleBulkMove}
                disabled={targetCategoryId === 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Перенести
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}


