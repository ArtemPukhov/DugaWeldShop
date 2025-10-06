"use client";

import { useState, useEffect } from "react";
import { apiPreviewCsv, apiImportCsv, apiImportCsvWithCategory, apiFetch } from "@/lib/api";

interface CsvImportProps {
  onImportComplete?: (count: number) => void;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
}

interface PreviewData {
  csvHeaders: string[];
  targetFields: string[];
  previewData: any[];
  totalRows: number;
}

interface ColumnMapping {
  csvColumn: string;
  targetField: string;
}

export function CsvImport({ onImportComplete }: CsvImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [useTargetCategory, setUseTargetCategory] = useState(false);

  // Загружаем категории при монтировании компонента
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await apiFetch<Category[]>("/categories");
        setCategories(categoriesData);
      } catch (err) {
        console.error("Ошибка загрузки категорий:", err);
      }
    };
    loadCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.toLowerCase().endsWith(".csv")) {
        setError("Пожалуйста, выберите CSV файл");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
      setMessage("");
      setPreviewData(null);
      setShowPreview(false);
      setShowMapping(false);
      setColumnMappings([]);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setError("Пожалуйста, выберите файл");
      return;
    }

    setPreviewLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await apiPreviewCsv(file);
      setPreviewData(result);
      setShowPreview(true);
      
      // Инициализируем маппинг по умолчанию
      const defaultMappings: ColumnMapping[] = result.targetFields.map(field => ({
        csvColumn: result.csvHeaders[0] || "",
        targetField: field
      }));
      setColumnMappings(defaultMappings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при предзагрузке");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Пожалуйста, выберите файл");
      return;
    }

    if (useTargetCategory && !selectedCategoryId) {
      setError("Пожалуйста, выберите категорию для импорта");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      let result;
      if (useTargetCategory && selectedCategoryId) {
        result = await apiImportCsvWithCategory(file, selectedCategoryId);
        const selectedCategory = categories.find(c => c.id === selectedCategoryId);
        setMessage(`Успешно импортировано ${result.importedCount} товаров в категорию "${selectedCategory?.name || selectedCategoryId}"`);
      } else {
        result = await apiImportCsv(file);
        setMessage(`Успешно импортировано ${result.importedCount} товаров`);
      }
      
      setFile(null);
      setUseTargetCategory(false);
      setSelectedCategoryId(null);
      if (onImportComplete) {
        onImportComplete(result.importedCount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при импорте");
    } finally {
      setLoading(false);
    }
  };

  const getFieldDisplayName = (fieldName: string) => {
    const fieldNames: { [key: string]: string } = {
      name: "Название",
      description: "Описание", 
      price: "Цена",
      categoryId: "ID категории",
      imageUrl: "URL изображения"
    };
    return fieldNames[fieldName] || fieldName;
  };

  const downloadTemplate = () => {
    const csvContent = "name,description,price,categoryId,imageUrl\n" +
      "Пример товара,Описание товара,100.50,1,https://example.com/image.jpg";
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-gray-700 font-semibold mb-4">Импорт товаров из CSV</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Выберите CSV файл
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={loading}
          />
        </div>

        {file && (
          <div className="text-sm text-gray-600">
            Выбран файл: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useTargetCategory}
              onChange={(e) => setUseTargetCategory(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Импортировать все товары в одну категорию
            </span>
          </label>
        </div>

        {useTargetCategory && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите категорию для импорта
            </label>
            <select
              value={selectedCategoryId || ""}
              onChange={(e) => setSelectedCategoryId(e.target.value ? parseInt(e.target.value) : null)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-black bg-white"
            >
              <option value="">Выберите категорию</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Все товары из CSV будут импортированы в выбранную категорию, независимо от категорий в файле
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handlePreview}
            disabled={!file || previewLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {previewLoading ? "Предзагрузка..." : "Предзагрузка"}
          </button>
          
          <button
            onClick={() => setShowMapping(!showMapping)}
            disabled={!previewData}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {showMapping ? "Скрыть маппинг" : "Настроить колонки"}
          </button>
          
          <button
            onClick={handleImport}
            disabled={!file || loading || !previewData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Импорт..." : "Импортировать"}
          </button>
          
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Скачать шаблон
          </button>
        </div>

        {message && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {showMapping && previewData && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3 text-black">Сопоставление колонок</h4>
            <div className="space-y-4">
              {previewData.targetFields.map((targetField, index) => (
                <div key={targetField} className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-black">
                    {getFieldDisplayName(targetField)}:
                  </label>
                  <select
                    value={columnMappings[index]?.csvColumn || ""}
                    onChange={(e) => {
                      const newMappings = [...columnMappings];
                      newMappings[index] = {
                        csvColumn: e.target.value,
                        targetField: targetField
                      };
                      setColumnMappings(newMappings);
                    }}
                    className="flex-1 border rounded px-3 py-2 text-black"
                  >
                    <option value="">Выберите колонку из CSV</option>
                    {previewData.csvHeaders.map((header, headerIndex) => (
                      <option key={headerIndex} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {showPreview && previewData && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3 text-black">Предварительный просмотр ({previewData.totalRows} строк)</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left text-black">Название</th>
                    <th className="border border-gray-300 px-2 py-1 text-left text-black">Описание</th>
                    <th className="border border-gray-300 px-2 py-1 text-left text-black">Цена</th>
                    <th className="border border-gray-300 px-2 py-1 text-left text-black">ID категории</th>
                    <th className="border border-gray-300 px-2 py-1 text-left text-black">URL изображения</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.previewData.slice(0, 10).map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-2 py-1 text-black">{row.name || ""}</td>
                      <td className="border border-gray-300 px-2 py-1 text-black">{row.description || ""}</td>
                      <td className="border border-gray-300 px-2 py-1 text-black">{row.price || ""}</td>
                      <td className="border border-gray-300 px-2 py-1 text-black">{row.categoryId || ""}</td>
                      <td className="border border-gray-300 px-2 py-1 text-black">{row.imageUrl || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.totalRows > 10 && (
                <p className="text-sm text-gray-500 mt-2">
                  Показаны первые 10 строк из {previewData.totalRows}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Формат CSV файла:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Первая строка - заголовки: name, description, price, categoryId, imageUrl</li>
            <li>name - название товара (обязательно)</li>
            <li>description - описание товара</li>
            <li>price - цена (число, обязательно)</li>
            <li>categoryId - ID категории (число, обязательно, игнорируется при выборе целевой категории)</li>
            <li>imageUrl - URL изображения (необязательно)</li>
          </ul>
          <p className="font-medium mt-3 mb-2">Особенности:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>При включении опции "Импортировать все товары в одну категорию" поле categoryId из CSV игнорируется</li>
            <li>Все товары будут добавлены в выбранную категорию</li>
            <li>Без этой опции используются категории, указанные в CSV файле</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
