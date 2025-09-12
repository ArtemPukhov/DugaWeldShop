package ru.dugaweld.www.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.dugaweld.www.dto.ProductDto;
import ru.dugaweld.www.services.ProductService;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/products")
@Tag(name = "Товары")
public class ProductController {
    private final ProductService productService;
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductDto> all() {
        log.info("Получение товаров");
        List<ProductDto> products = productService.findAll();
        log.info("Найдено товаров: {}", products.size());
        for (ProductDto product : products) {
            System.out.println("Название: " + product.getName());
        }
        return products;
    }

    @GetMapping("/by-category/{categoryId}")
    public List<ProductDto> byCategory(@PathVariable Long categoryId) { return productService.findByCategory(categoryId); }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> byId(@PathVariable Long id) {
        ProductDto dto = productService.findById(id);
        return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> create(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("categoryId") Long categoryId,
            @RequestPart("image") MultipartFile image) {

        ProductDto dto = new ProductDto();
        dto.setName(name);
        dto.setDescription(description);
        dto.setPrice(price);
        dto.setCategoryId(categoryId);

        ProductDto created = productService.create(dto, image);
        return ResponseEntity.created(URI.create("/products/" + created.getId())).body(created);
    }


    @PutMapping("/{id}")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody ProductDto dto) {
        return productService.update(id, dto);
    }

    @DeleteMapping("/{id}")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}




