package ru.dugaweld.www.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.dugaweld.www.dto.CategoryDto;
import ru.dugaweld.www.models.Category;
import ru.dugaweld.www.repositories.CategoryRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
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
        categoryRepository.deleteById(id);
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
}



















