"use client";

import { useState } from "react";
import { useCarousel } from "@/hooks/useCarousel";
import { CarouselSlide } from "@/components/ImageCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown,
  Save,
  X
} from "lucide-react";

export default function CarouselAdminPage() {
  const {
    slides,
    loading,
    error,
    addSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
  } = useCarousel();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<CarouselSlide>>({
    imageUrl: "",
    title: "",
    subtitle: "",
    linkUrl: "",
    isActive: true,
    order: slides.length + 1,
  });

  const resetForm = () => {
    setFormData({
      imageUrl: "",
      title: "",
      subtitle: "",
      linkUrl: "",
      isActive: true,
      order: slides.length + 1,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateSlide(editingId, formData);
      } else {
        await addSlide(formData as Omit<CarouselSlide, 'id'>);
      }
      resetForm();
    } catch (err) {
      console.error("Ошибка сохранения:", err);
    }
  };

  const handleEdit = (slide: CarouselSlide) => {
    setFormData(slide);
    setEditingId(slide.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этот слайд?")) {
      try {
        await deleteSlide(id);
      } catch (err) {
        console.error("Ошибка удаления:", err);
      }
    }
  };

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const newSlides = [...slides];
    [newSlides[currentIndex], newSlides[newIndex]] = [newSlides[newIndex], newSlides[currentIndex]];
    
    const slideIds = newSlides.map(s => s.id);
    await reorderSlides(slideIds);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка слайдов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление каруселью
          </h1>
          <p className="text-gray-600">
            Добавляйте, редактируйте и управляйте слайдами карусели на главной странице
          </p>
        </div>

        {/* Форма добавления/редактирования */}
        {isAdding && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-900">
                {editingId ? "Редактировать слайд" : "Добавить новый слайд"}
                <Button variant="ghost" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="imageUpload">Изображение</Label>
                    <FileUpload
                      value={formData.imageUrl || ""}
                      onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                      accept="image/*"
                      showSpecs={true}
                    />
                    <div className="text-center text-sm text-gray-500">или</div>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl || ""}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Введите URL изображения"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="order">Порядок отображения</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order || 1}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Заголовок</Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="DIGITAL X SMART"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Подзаголовок</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle || ""}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="ДОСТУП В НОВОЕ ИЗМЕРЕНИЕ"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkUrl">Ссылка (необязательно)</Label>
                    <Input
                      id="linkUrl"
                      value={formData.linkUrl || ""}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      placeholder="/catalog"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Активный слайд</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Отмена
                  </Button>
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? "Сохранить изменения" : "Добавить слайд"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Кнопка добавления */}
        {!isAdding && (
          <div className="mb-6">
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить слайд
            </Button>
          </div>
        )}

        {/* Список слайдов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {slides
            .sort((a, b) => a.order - b.order)
            .map((slide, index) => (
            <Card key={slide.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReorder(slide.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReorder(slide.id, 'down')}
                    disabled={index === slides.length - 1}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-black/50 text-white px-2 py-1 rounded text-sm">
                    #{slide.order}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-2 mb-4">
                  <h3 className="font-bold text-lg">{slide.title}</h3>
                  <p className="text-gray-600 text-sm">{slide.subtitle}</p>
                  {slide.linkUrl && (
                    <p className="text-blue-600 text-sm">Ссылка: {slide.linkUrl}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {slide.isActive ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {slide.isActive ? "Активен" : "Неактивен"}
                    </span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(slide)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(slide.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {slides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Слайды не найдены</p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить первый слайд
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
