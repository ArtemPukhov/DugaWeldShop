package ru.dugaweld.www.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.dugaweld.www.dto.ProductDto;
import ru.dugaweld.www.models.Category;
import ru.dugaweld.www.models.Product;
import ru.dugaweld.www.repositories.CategoryRepository;
import ru.dugaweld.www.repositories.ProductRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ProductDto> findAll() {
        return productRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> findByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProductDto findById(Long id) { return productRepository.findById(id).map(this::toDto).orElse(null); }

    public ProductDto create(ProductDto dto) {
        Product product = new Product();
        apply(dto, product);
        return toDto(productRepository.save(product));
    }

    public ProductDto update(Long id, ProductDto dto) {
        Product existing = productRepository.findById(id).orElseThrow();
        apply(dto, existing);
        return toDto(productRepository.save(existing));
    }

    public void delete(Long id) {
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
}











