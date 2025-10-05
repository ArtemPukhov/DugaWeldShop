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
        dto.setImageUrl(uploadImageToMinIO(image));
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
        
        // Удаляем изображение из MinIO, если оно существует
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            try {
                String fileName = extractFileNameFromUrl(product.getImageUrl());
                minIOService.deleteFile(fileName);
                log.info("Изображение '{}' удалено из MinIO", fileName);
            } catch (Exception e) {
                log.warn("Не удалось удалить изображение из MinIO: {}", e.getMessage());
            }
        }
        
        productRepository.deleteById(id);
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
        dto.setImageUrl(product.getImageUrl());
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
            String fileUrl = minIOService.getFileUrl(fileName);
            log.info("Изображение загружено в MinIO: {}", fileName);
            return fileUrl;
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
        
        // Извлекаем имя файла из URL
        // Например: "http://localhost:9000/dugaweld-images/uuid.jpg" -> "uuid.jpg"
        String[] parts = url.split("/");
        return parts[parts.length - 1];
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
















