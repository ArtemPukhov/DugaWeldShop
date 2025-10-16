import * as React from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageSpecs } from "@/components/ui/image-specs";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  className?: string;
  disabled?: boolean;
  showSpecs?: boolean;
}

export function FileUpload({ 
  value, 
  onChange, 
  accept = "image/*", 
  className,
  disabled = false,
  showSpecs = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер файла (максимум 2MB для карусели)
    if (file.size > 2 * 1024 * 1024) {
      alert('Размер файла не должен превышать 2MB для оптимальной загрузки');
      return;
    }

    setIsUploading(true);

    try {
      // Проверяем размеры изображения
      const img = new Image();
      img.onload = async () => {
        const { width, height } = img;
        const aspectRatio = width / height;
        
        // Рекомендуемое соотношение сторон для карусели: 16:5 (3.2)
        const recommendedRatio = 3.2;
        const tolerance = 0.5; // Допустимое отклонение
        
        if (Math.abs(aspectRatio - recommendedRatio) > tolerance) {
          const confirmUpload = confirm(
            `Изображение имеет соотношение сторон ${aspectRatio.toFixed(2)}:1. ` +
            `Рекомендуемое соотношение для карусели: 3.2:1 (1920×600px). ` +
            `Продолжить загрузку?`
          );
          
          if (!confirmUpload) {
            setIsUploading(false);
            return;
          }
        }
        
        // Загружаем файл в MinIO
        try {
          const formData = new FormData();
          formData.append('file', file);

          // Получаем токен из localStorage
          const token = localStorage.getItem('dw_admin_token');
          console.log('Токен для загрузки файла:', token ? 'Есть' : 'Отсутствует');
          console.log('Токен (первые 20 символов):', token ? token.substring(0, 20) + '...' : 'null');

          const response = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData,
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          
          console.log('Статус ответа:', response.status);
          console.log('Заголовки ответа:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Требуется авторизация. Пожалуйста, войдите в систему.');
            } else if (response.status === 403) {
              throw new Error('Доступ запрещен. Возможно, нужно войти в систему.');
            } else if (response.status === 413) {
              throw new Error('Файл слишком большой. Максимальный размер: 2MB');
            } else {
              const errorText = await response.text().catch(() => '');
              throw new Error(`Ошибка загрузки: ${response.status} ${errorText}`);
            }
          }
          
          const result = await response.json();
          const fileUrl = result.url || result;
          onChange(fileUrl);
          setIsUploading(false);
        } catch (uploadError) {
          console.error('Ошибка загрузки в MinIO:', uploadError);
          
          // Fallback: используем data URL если API недоступен
          if (uploadError.message.includes('401') || uploadError.message.includes('403') || 
              uploadError.message.includes('Доступ запрещен') || uploadError.message.includes('авторизация')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              onChange(result);
              setIsUploading(false);
            };
            reader.onerror = () => {
              alert('Ошибка при чтении файла');
              setIsUploading(false);
            };
            reader.readAsDataURL(file);
          } else {
            alert(`Ошибка при загрузке файла: ${uploadError.message}`);
            setIsUploading(false);
          }
        }
      };
      
      img.onerror = () => {
        alert('Ошибка при загрузке изображения');
        setIsUploading(false);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      alert('Ошибка при загрузке файла');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showSpecs && <ImageSpecs />}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      {value ? (
        <div className="space-y-2">
          <div className="relative">
            <img
              src={value}
              alt="Предварительный просмотр"
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Нажмите на изображение или перетащите новое для замены
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragOver 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-600">Загрузка...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Нажмите для выбора файла
                </p>
                <p className="text-xs text-gray-500">
                  или перетащите изображение сюда
                </p>
              </div>
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF до 5MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
