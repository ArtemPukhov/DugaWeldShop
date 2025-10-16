'use client';

import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/components/ui/button';
import { Save, Eye, Edit3 } from 'lucide-react';

interface ProductDescriptionEditorProps {
  productId?: number;
  initialValue?: string;
  onSave?: (description: string) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  onEdit?: () => void;
}

export default function ProductDescriptionEditor({ 
  productId, 
  initialValue = '', 
  onSave, 
  onCancel,
  isEditing = false,
  onEdit
}: ProductDescriptionEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(isEditing);

  // Загружаем текущее описание товара, если передан productId
  useEffect(() => {
    if (productId && !initialValue) {
      setLoading(true);
      fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(data => {
          setValue(data.description || '');
          setLoading(false);
        })
        .catch(err => {
          console.error('Ошибка загрузки описания:', err);
          setLoading(false);
        });
    } else {
      setValue(initialValue);
    }
  }, [productId, initialValue]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (productId) {
        // Сохраняем через API
        await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description: value }),
        });
      }
      
      // Вызываем callback если передан
      if (onSave) {
        onSave(value);
      }
      
      setEditMode(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении описания');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setEditMode(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    if (onEdit) {
      onEdit();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Загрузка описания...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Заголовок с кнопками */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Описание товара</h3>
        <div className="flex items-center space-x-2">
          {!editMode ? (
            <Button
              onClick={handleEdit}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Edit3 className="w-4 h-4" />
              <span>Редактировать</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                disabled={saving}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                disabled={saving}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Сохраняю...' : 'Сохранить'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Редактор */}
      <div className="p-4">
        {editMode ? (
          <div className="space-y-4">
            <MDEditor 
              value={value} 
              onChange={setValue} 
              height={400}
              data-color-mode="light"
              preview="edit"
              hideToolbar={false}
            />
            
            {/* Предварительный просмотр */}
            {value && (
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Предварительный просмотр:</span>
                </div>
                <div className="prose max-w-none text-sm border rounded-lg p-4 bg-gray-50">
                  <MDEditor.Markdown source={value} />
                </div>
              </div>
            )}
            
            {/* Справка по Markdown */}
            <div className="border-t pt-4">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  📝 Справка по Markdown синтаксису
                </summary>
                <div className="mt-3 text-xs text-gray-600 space-y-2">
                  <div><strong>Заголовки:</strong> # Заголовок 1, ## Заголовок 2, ### Заголовок 3</div>
                  <div><strong>Жирный текст:</strong> **жирный** или __жирный__</div>
                  <div><strong>Курсив:</strong> *курсив* или _курсив_</div>
                  <div><strong>Списки:</strong> - элемент списка или 1. нумерованный</div>
                  <div><strong>Ссылки:</strong> [текст](https://example.com)</div>
                  <div><strong>Изображения:</strong> ![alt](https://example.com/image.jpg)</div>
                  <div><strong>Код:</strong> `код` или ```блок кода```</div>
                </div>
              </details>
            </div>
          </div>
        ) : (
          <div className="prose max-w-none">
            {value ? (
              <MDEditor.Markdown source={value} />
            ) : (
              <p className="text-gray-500 italic">Описание не указано</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
