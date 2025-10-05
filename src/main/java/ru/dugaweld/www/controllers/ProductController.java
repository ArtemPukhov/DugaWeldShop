package ru.dugaweld.www.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.dugaweld.www.dto.ProductDto;
import ru.dugaweld.www.dto.CsvProductDto;
import ru.dugaweld.www.dto.CsvImportRequest;
import ru.dugaweld.www.services.ProductService;
import ru.dugaweld.www.services.CsvProductService;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/products")
@Tag(name = "Товары")
public class ProductController {
    private final ProductService productService;
    private final CsvProductService csvProductService;
    
    public ProductController(ProductService productService, CsvProductService csvProductService) {
        this.productService = productService;
        this.csvProductService = csvProductService;
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

    @PostMapping(value = "/preview-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> previewCsv(@RequestParam("file") MultipartFile csvFile) {
        try {
            if (csvFile.isEmpty()) {
                return ResponseEntity.badRequest().body("Файл не выбран");
            }
            
            String filename = csvFile.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
                return ResponseEntity.badRequest().body("Файл должен иметь расширение .csv");
            }
            
            List<CsvProductDto> previewData = csvProductService.parseCsvFile(csvFile);
            
            // Получаем заголовки из первой строки файла
            String[] csvHeaders = csvProductService.getCsvHeaders(csvFile);
            
            return ResponseEntity.ok(java.util.Map.of(
                "csvHeaders", csvHeaders,
                "targetFields", new String[]{"name", "description", "price", "categoryId", "imageUrl"},
                "previewData", previewData,
                "totalRows", previewData.size()
            ));
            
        } catch (IOException e) {
            log.error("Ошибка при чтении CSV файла", e);
            return ResponseEntity.badRequest().body("Ошибка при чтении файла: " + e.getMessage());
        } catch (Exception e) {
            log.error("Ошибка при парсинге CSV", e);
            return ResponseEntity.internalServerError().body("Ошибка при парсинге: " + e.getMessage());
        }
    }

    @PostMapping(value = "/import-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importFromCsv(@RequestParam("file") MultipartFile csvFile) {
        try {
            if (csvFile.isEmpty()) {
                return ResponseEntity.badRequest().body("Файл не выбран");
            }
            
            String filename = csvFile.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
                return ResponseEntity.badRequest().body("Файл должен иметь расширение .csv");
            }
            
            List<ProductDto> importedProducts = csvProductService.importProductsFromCsv(csvFile);
            
            return ResponseEntity.ok(java.util.Map.of(
                "message", "Импорт завершен успешно",
                "importedCount", importedProducts.size(),
                "products", importedProducts
            ));
            
        } catch (IOException e) {
            log.error("Ошибка при чтении CSV файла", e);
            return ResponseEntity.badRequest().body("Ошибка при чтении файла: " + e.getMessage());
        } catch (Exception e) {
            log.error("Ошибка при импорте товаров", e);
            return ResponseEntity.internalServerError().body("Ошибка при импорте: " + e.getMessage());
        }
    }

    @PostMapping(value = "/import-csv-mapped", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> importFromCsvWithMapping(@RequestBody CsvImportRequest request) {
        try {
            // Здесь нужно получить файл из сессии или кеша
            // Пока что возвращаем ошибку
            return ResponseEntity.badRequest().body("Функция в разработке");
        } catch (Exception e) {
            log.error("Ошибка при импорте с маппингом", e);
            return ResponseEntity.internalServerError().body("Ошибка при импорте: " + e.getMessage());
        }
    }
}




