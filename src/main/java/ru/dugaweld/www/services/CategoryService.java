package ru.dugaweld.www.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.dugaweld.www.dto.CategoryDto;
import ru.dugaweld.www.models.Category;
import ru.dugaweld.www.repositories.CategoryRepository;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final MinIOService minIOService;

    public CategoryService(CategoryRepository categoryRepository, MinIOService minIOService) {
        this.categoryRepository = categoryRepository;
        this.minIOService = minIOService;
    }

    public List<CategoryDto> findAll() {
        return categoryRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public CategoryDto findById(Long id) {
        return categoryRepository.findById(id).map(this::toDto).orElse(null);
    }

    public CategoryDto create(CategoryDto dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        category.setParentCategoryId(dto.getParentCategoryId());
        return toDto(categoryRepository.save(category));
    }

    public CategoryDto update(Long id, CategoryDto dto) {
        Category existing = categoryRepository.findById(id).orElseThrow();
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setImageUrl(dto.getImageUrl());
        existing.setParentCategoryId(dto.getParentCategoryId());
        return toDto(categoryRepository.save(existing));
    }

    public void delete(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow();
        
        log.info("Удаление категории ID: {}, название: {}", id, category.getName());
        
        // Удаляем изображение из MinIO, если оно существует
        if (category.getImageUrl() != null && !category.getImageUrl().isEmpty()) {
            log.info("Найдено изображение для удаления: {}", category.getImageUrl());
            try {
                String fileName;
                
                // Проверяем, является ли imageUrl полным URL или просто именем файла
                if (category.getImageUrl().startsWith("http")) {
                    // Это полный URL, извлекаем имя файла
                    fileName = extractFileNameFromUrl(category.getImageUrl());
                } else {
                    // Это уже имя файла
                    fileName = category.getImageUrl();
                }
                
                if (fileName != null && !fileName.isEmpty()) {
                    minIOService.deleteFile(fileName);
                    log.info("Изображение '{}' успешно удалено из MinIO", fileName);
                } else {
                    log.warn("Не удалось определить имя файла для удаления: {}", category.getImageUrl());
                }
            } catch (Exception e) {
                log.error("Ошибка при удалении изображения из MinIO: {}", e.getMessage(), e);
            }
        } else {
            log.info("У категории нет изображения для удаления");
        }
        
        categoryRepository.deleteById(id);
        log.info("Категория ID: {} удалена из базы данных", id);
    }

    public CategoryDto createWithImage(CategoryDto dto, MultipartFile image) {
        Category category = new Category();
        String fileName = uploadImageToMinIO(image);
        dto.setImageUrl(fileName); // Сохраняем только имя файла
        apply(dto, category);
        return toDto(categoryRepository.save(category));
    }

    public CategoryDto updateWithImage(Long id, CategoryDto dto, MultipartFile image) {
        Category existing = categoryRepository.findById(id).orElseThrow();
        
        // Если есть новое изображение, загружаем его
        if (image != null && !image.isEmpty()) {
            // Удаляем старое изображение, если оно есть
            if (existing.getImageUrl() != null && !existing.getImageUrl().isEmpty()) {
                try {
                    String oldFileName = extractFileNameFromUrl(existing.getImageUrl());
                    if (oldFileName != null && !oldFileName.isEmpty()) {
                        minIOService.deleteFile(oldFileName);
                        log.info("Старое изображение '{}' удалено из MinIO", oldFileName);
                    }
                } catch (Exception e) {
                    log.error("Ошибка при удалении старого изображения: {}", e.getMessage());
                }
            }
            
            // Загружаем новое изображение
            String fileName = uploadImageToMinIO(image);
            dto.setImageUrl(fileName);
        }
        
        apply(dto, existing);
        return toDto(categoryRepository.save(existing));
    }

    public List<CategoryDto> findRootCategories() {
        return categoryRepository.findAll().stream()
            .filter(category -> category.getParentCategoryId() == null)
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public List<CategoryDto> findSubcategories(Long parentId) {
        return categoryRepository.findAll().stream()
            .filter(category -> parentId.equals(category.getParentCategoryId()))
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    private CategoryDto toDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setImageUrl(category.getImageUrl());
        dto.setParentCategoryId(category.getParentCategoryId());
        
        // Добавляем имя родительской категории если есть
        if (category.getParentCategoryId() != null) {
            categoryRepository.findById(category.getParentCategoryId())
                .ifPresent(parent -> dto.setParentCategoryName(parent.getName()));
        }
        
        return dto;
    }

    private void apply(CategoryDto dto, Category category) {
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        category.setParentCategoryId(dto.getParentCategoryId());
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
            log.info("Изображение категории загружено в MinIO: {}", fileName);
            return fileName; // Возвращаем только имя файла
        } catch (Exception e) {
            log.error("Ошибка при загрузке изображения категории в MinIO: {}", e.getMessage());
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
            return parts[parts.length - 1];
        } catch (Exception e) {
            log.error("Ошибка при извлечении имени файла из URL: {}", e.getMessage());
            return null;
        }
    }
}



















