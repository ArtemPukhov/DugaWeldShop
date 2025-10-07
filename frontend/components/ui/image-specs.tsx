import { Monitor, Smartphone, Tablet } from "lucide-react";

export function ImageSpecs() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-blue-900 flex items-center">
        <Monitor className="w-4 h-4 mr-2" />
        Рекомендуемые параметры изображений
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-4 h-4 text-gray-500" />
          <div>
            <p className="font-medium">Мобильные</p>
            <p className="text-gray-600">384×384px</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Tablet className="w-4 h-4 text-gray-500" />
          <div>
            <p className="font-medium">Планшеты</p>
            <p className="text-gray-600">768×500px</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Monitor className="w-4 h-4 text-gray-500" />
          <div>
            <p className="font-medium">Десктоп</p>
            <p className="text-gray-600">1920×600px</p>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-600 space-y-1">
        <p><strong>Оптимальный размер:</strong> 1920×600px (соотношение 16:5)</p>
        <p><strong>Формат:</strong> JPG, PNG, WebP</p>
        <p><strong>Размер файла:</strong> до 500KB для быстрой загрузки</p>
        <p><strong>Качество:</strong> 85-90% для JPG</p>
      </div>
    </div>
  );
}
