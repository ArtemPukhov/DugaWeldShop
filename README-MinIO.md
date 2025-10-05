# Интеграция MinIO для работы с файлами

## Описание

В проект DugaWeld Shop добавлена интеграция с MinIO для хранения файлов (изображений товаров и других документов). MinIO - это объектное хранилище, совместимое с Amazon S3.

## Преимущества MinIO

- **Масштабируемость**: Легко масштабируется для больших объемов данных
- **Производительность**: Высокая скорость загрузки и скачивания файлов
- **Надежность**: Репликация и отказоустойчивость
- **Совместимость**: S3-совместимый API
- **Простота**: Легкая настройка и использование

## Конфигурация

### Переменные окружения

```yaml
# MinIO Configuration
minio:
  endpoint: ${MINIO_ENDPOINT:http://localhost:9000}
  access-key: ${MINIO_ACCESS_KEY:minioadmin}
  secret-key: ${MINIO_SECRET_KEY:minioadmin}
  bucket-name: ${MINIO_BUCKET_NAME:dugaweld-images}
```

### Переменные окружения для продакшена

```bash
MINIO_ENDPOINT=http://your-minio-server:9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=dugaweld-images
```

## Запуск MinIO

### С помощью Docker Compose

```bash
# Запуск MinIO вместе с PostgreSQL
docker-compose up -d minio

# Только MinIO
docker-compose up -d minio
```

### Доступ к MinIO

- **API Endpoint**: http://localhost:9000
- **Web Console**: http://localhost:9001
- **Логин**: minioadmin
- **Пароль**: minioadmin

## API Endpoints

### Загрузка файла
```http
POST /api/files/upload
Content-Type: multipart/form-data

file: [выбранный файл]
```

### Получение файла
```http
GET /api/files/{fileName}
```

### Получение URL файла
```http
GET /api/files/{fileName}/url
```

### Удаление файла
```http
DELETE /api/files/{fileName}
```

### Проверка существования файла
```http
GET /api/files/{fileName}/exists
```

## Использование в коде

### MinIOService

```java
@Autowired
private MinIOService minIOService;

// Загрузка файла
String fileName = minIOService.uploadFile(multipartFile);

// Получение файла
InputStream inputStream = minIOService.getFile(fileName);

// Получение URL
String fileUrl = minIOService.getFileUrl(fileName);

// Удаление файла
minIOService.deleteFile(fileName);

// Проверка существования
boolean exists = minIOService.fileExists(fileName);
```

### ProductService

`ProductService` автоматически использует MinIO для загрузки изображений товаров:

```java
// При создании товара изображение автоматически загружается в MinIO
ProductDto product = productService.create(productDto, imageFile);

// При удалении товара изображение автоматически удаляется из MinIO
productService.delete(productId);
```

## Структура файлов

Все файлы сохраняются в bucket `dugaweld-images` с уникальными именами:

```
dugaweld-images/
├── uuid1.jpg
├── uuid2.png
├── uuid3.pdf
└── ...
```

## Миграция с файловой системы

Если у вас уже есть файлы в файловой системе, вы можете:

1. Загрузить их в MinIO через API
2. Обновить URL в базе данных
3. Удалить старые файлы

## Мониторинг

### Проверка состояния MinIO

```bash
# Проверка health check
curl http://localhost:9000/minio/health/live

# Логи контейнера
docker-compose logs minio
```

### Web Console

Откройте http://localhost:9001 для доступа к веб-интерфейсу MinIO, где можно:
- Просматривать файлы
- Управлять bucket'ами
- Настраивать политики доступа
- Мониторить использование

## Безопасность

### Продакшен настройки

1. **Измените пароли по умолчанию**:
```yaml
MINIO_ROOT_USER=secure-username
MINIO_ROOT_PASSWORD=secure-password
```

2. **Настройте HTTPS**:
```yaml
MINIO_SERVER_URL=https://your-domain.com
```

3. **Ограничьте доступ**:
```yaml
MINIO_BROWSER_REDIRECT_URL=https://your-domain.com
```

### Политики доступа

Настройте политики доступа в MinIO Console для:
- Чтения файлов
- Записи файлов
- Удаления файлов

## Troubleshooting

### Проблемы с подключением

1. **Проверьте доступность MinIO**:
```bash
curl http://localhost:9000/minio/health/live
```

2. **Проверьте логи**:
```bash
docker-compose logs minio
```

3. **Проверьте конфигурацию**:
```bash
docker-compose exec minio mc admin info
```

### Проблемы с загрузкой файлов

1. **Проверьте размер файла** (максимум 20MB по умолчанию)
2. **Проверьте права доступа к bucket'у**
3. **Проверьте логи приложения**

## Производительность

### Оптимизация

1. **Используйте CDN** для статических файлов
2. **Настройте кэширование** в MinIO
3. **Используйте multipart upload** для больших файлов

### Мониторинг производительности

- Используйте MinIO Console для мониторинга
- Настройте алерты на использование диска
- Мониторьте скорость загрузки/скачивания

## Заключение

Интеграция MinIO обеспечивает надежное, масштабируемое и производительное хранение файлов для проекта DugaWeld Shop. Все файлы автоматически управляются через MinIOService, что упрощает работу с файлами в приложении.




