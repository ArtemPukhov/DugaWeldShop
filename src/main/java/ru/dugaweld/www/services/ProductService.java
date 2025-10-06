package ru.dugaweld.www.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.dugaweld.www.dto.ProductDto;
import ru.dugaweld.www.models.Category;
import ru.dugaweld.www.models.Product;
import ru.dugaweld.www.repositories.CategoryRepository;
import ru.dugaweld.www.repositories.ProductRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MinIOService minIOService;
    
    @Value("${saveImagesPath}")
    private String saveImagesPath;
    @Value("${getImagesPath}")
    private String getImagesPath;
    @Value("${minio.endpoint}")
    private String minioEndpoint;

    public ProductService(ProductRepository productRepository, 
                         CategoryRepository categoryRepository,
                         MinIOService minIOService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.minIOService = minIOService;
    }

    public List<ProductDto> findAll() {
        return productRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> findByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProductDto findById(Long id) { return productRepository.findById(id).map(this::toDto).orElse(null); }

    public ProductDto create(ProductDto dto, MultipartFile image) {
        Product product = new Product();
        String fileName = uploadImageToMinIO(image);
        dto.setImageUrl(fileName); // Сохраняем только имя файла, не полный URL
        apply(dto, product);
        return toDto(productRepository.save(product));
    }

    public ProductDto update(Long id, ProductDto dto) {
        Product existing = productRepository.findById(id).orElseThrow();
        apply(dto, existing);
        return toDto(productRepository.save(existing));
    }

    public void delete(Long id) {
        Product product = productRepository.findById(id).orElseThrow();
        
        log.info("Удаление товара ID: {}, название: {}", id, product.getName());
        
        // Удаляем изображение из MinIO, если оно существует
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            log.info("Найдено изображение для удаления: {}", product.getImageUrl());
            try {
                String fileName;
                
                // Проверяем, является ли imageUrl полным URL или просто именем файла
                if (product.getImageUrl().startsWith("http")) {
                    // Это полный URL, извлекаем имя файла
                    fileName = extractFileNameFromUrl(product.getImageUrl());
                } else {
                    // Это уже имя файла
                    fileName = product.getImageUrl();
                }
                
                if (fileName != null && !fileName.isEmpty()) {
                    minIOService.deleteFile(fileName);
                    log.info("Изображение '{}' успешно удалено из MinIO", fileName);
                } else {
                    log.warn("Не удалось определить имя файла для удаления: {}", product.getImageUrl());
                }
            } catch (Exception e) {
                log.error("Ошибка при удалении изображения из MinIO: {}", e.getMessage(), e);
            }
        } else {
            log.info("У товара нет изображения для удаления");
        }
        
        productRepository.deleteById(id);
        log.info("Товар ID: {} удален из базы данных", id);
    }

    public int deleteBulk(List<Long> ids) {
        log.info("Начинаем массовое удаление {} товаров", ids.size());
        int deletedCount = 0;
        
        for (Long id : ids) {
            try {
                Product product = productRepository.findById(id).orElse(null);
                if (product != null) {
                    log.info("Удаление товара ID: {}, название: {}", id, product.getName());
                    
                    // Удаляем изображение из MinIO, если оно существует
                    if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                        try {
                            String fileName;
                            
                            // Проверяем, является ли imageUrl полным URL или просто именем файла
                            if (product.getImageUrl().startsWith("http")) {
                                // Это полный URL, извлекаем имя файла
                                fileName = extractFileNameFromUrl(product.getImageUrl());
                            } else {
                                // Это уже имя файла
                                fileName = product.getImageUrl();
                            }
                            
                            if (fileName != null && !fileName.isEmpty()) {
                                minIOService.deleteFile(fileName);
                                log.info("Изображение '{}' успешно удалено из MinIO", fileName);
                            }
                        } catch (Exception e) {
                            log.error("Ошибка при удалении изображения товара {}: {}", id, e.getMessage());
                        }
                    }
                    
                    productRepository.deleteById(id);
                    deletedCount++;
                    log.info("Товар ID: {} удален из базы данных", id);
                } else {
                    log.warn("Товар с ID {} не найден", id);
                }
            } catch (Exception e) {
                log.error("Ошибка при удалении товара ID {}: {}", id, e.getMessage());
            }
        }
        
        log.info("Массовое удаление завершено. Удалено товаров: {}", deletedCount);
        return deletedCount;
    }

    private void apply(ProductDto dto, Product entity) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setImageUrl(dto.getImageUrl());
        Category category = categoryRepository.findById(dto.getCategoryId()).orElseThrow();
        entity.setCategory(category);
    }

    private ProductDto toDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        
        // Если imageUrl содержит только имя файла, генерируем полный URL
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            if (product.getImageUrl().startsWith("http")) {
                // Это уже полный URL (для обратной совместимости)
                dto.setImageUrl(product.getImageUrl());
            } else {
                // Это имя файла, генерируем полный URL
                try {
                    String fullUrl = minIOService.getFileUrl(product.getImageUrl());
                    dto.setImageUrl(fullUrl);
                } catch (Exception e) {
                    log.warn("Не удалось сгенерировать URL для файла '{}': {}", product.getImageUrl(), e.getMessage());
                    dto.setImageUrl(product.getImageUrl()); // Возвращаем имя файла как есть
                }
            }
        } else {
            dto.setImageUrl(null);
        }
        
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        return dto;
    }

    /**
     * Загрузка изображения в MinIO
     */
    private String uploadImageToMinIO(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }
        
        try {
            String fileName = minIOService.uploadFile(image);
            log.info("Изображение загружено в MinIO: {}", fileName);
            return fileName; // Возвращаем только имя файла
        } catch (Exception e) {
            log.error("Ошибка при загрузке изображения в MinIO: {}", e.getMessage());
            throw new RuntimeException("Не удалось загрузить изображение", e);
        }
    }
    
    /**
     * Извлечение имени файла из URL
     */
    private String extractFileNameFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        try {
            // Удаляем query параметры (presigned URL)
            String urlWithoutParams = url.split("\\?")[0];
            
            // Извлекаем имя файла из URL
            // Например: "http://localhost:9000/dugaweld-images/uuid.jpg" -> "uuid.jpg"
            String[] parts = urlWithoutParams.split("/");
            String fileName = parts[parts.length - 1];
            
            // Проверяем, что извлеченное имя файла не пустое и не содержит недопустимых символов
            if (fileName == null || fileName.isEmpty()) {
                log.warn("Не удалось извлечь имя файла из URL: {}", url);
                return null;
            }
            
            // Дополнительная проверка на наличие расширения файла
            if (!fileName.contains(".")) {
                log.warn("Извлеченное имя файла '{}' не содержит расширения из URL: {}", fileName, url);
                return null;
            }
            
            log.info("Извлечено имя файла '{}' из URL: {}", fileName, url);
            return fileName;
        } catch (Exception e) {
            log.error("Ошибка при извлечении имени файла из URL '{}': {}", url, e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Очистка presigned URL в базе данных (миграция)
     * Заменяет полные URL на имена файлов
     */
    public void cleanupPresignedUrls() {
        log.info("Начинаем очистку presigned URL в базе данных");
        
        List<Product> products = productRepository.findAll();
        int updatedCount = 0;
        
        for (Product product : products) {
            if (product.getImageUrl() != null && 
                product.getImageUrl().startsWith("http") && 
                product.getImageUrl().contains("?")) {
                
                String fileName = extractFileNameFromUrl(product.getImageUrl());
                if (fileName != null && !fileName.isEmpty()) {
                    log.info("Обновляем товар ID: {} - заменяем URL '{}' на имя файла '{}'", 
                            product.getId(), product.getImageUrl(), fileName);
                    product.setImageUrl(fileName);
                    productRepository.save(product);
                    updatedCount++;
                } else {
                    log.warn("Не удалось извлечь имя файла из URL товара ID: {} - {}", 
                            product.getId(), product.getImageUrl());
                }
            }
        }
        
        log.info("Очистка завершена. Обновлено товаров: {}", updatedCount);
    }

    /**
     * Legacy метод для загрузки в файловую систему (для совместимости)
     */
    @Deprecated
    private String uploadImage(MultipartFile image) {
        // тут сохраняем картинку в папку /opt/dugaweld/images/
        // например:
        Path uploadPath = Paths.get(saveImagesPath);
        try {
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(image.getOriginalFilename());
            image.transferTo(filePath.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Ошибка сохранения файла: " + e.getMessage());
        }

        return getImagesPath + image.getOriginalFilename();
    }
}























