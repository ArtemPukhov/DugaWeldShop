package ru.dugaweld.www.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.dugaweld.www.dto.CategoryDto;
import ru.dugaweld.www.services.CategoryService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/categories")
@Tag(name = "Категории")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryDto> all() { return categoryService.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> byId(@PathVariable Long id) {
        CategoryDto dto = categoryService.findById(id);
        return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<CategoryDto> create(@Valid @RequestBody CategoryDto dto) {
        CategoryDto created = categoryService.create(dto);
        return ResponseEntity.created(URI.create("/categories/" + created.getId())).body(created);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<CategoryDto> createWithImage(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "parentCategoryId", required = false) Long parentCategoryId,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        CategoryDto dto = new CategoryDto();
        dto.setName(name);
        dto.setDescription(description);
        dto.setParentCategoryId(parentCategoryId);
        
        CategoryDto created = categoryService.createWithImage(dto, image);
        return ResponseEntity.created(URI.create("/categories/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public CategoryDto update(@PathVariable Long id, @Valid @RequestBody CategoryDto dto) {
        return categoryService.update(id, dto);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public CategoryDto updateWithImage(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "parentCategoryId", required = false) Long parentCategoryId,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        CategoryDto dto = new CategoryDto();
        dto.setName(name);
        dto.setDescription(description);
        dto.setParentCategoryId(parentCategoryId);
        
        return categoryService.updateWithImage(id, dto, image);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/root")
    public List<CategoryDto> rootCategories() { 
        return categoryService.findRootCategories(); 
    }

    @GetMapping("/{parentId}/subcategories")
    public List<CategoryDto> subcategories(@PathVariable Long parentId) { 
        return categoryService.findSubcategories(parentId); 
    }
}




