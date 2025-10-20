package ru.dugaweld.www.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.dugaweld.www.dto.ProductDto;
import ru.dugaweld.www.dto.CsvProductDto;
import ru.dugaweld.www.dto.CsvImportRequest;
import ru.dugaweld.www.dto.BulkMoveRequest;
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
    public List<ProductDto> all(@RequestParam(required = false) String query) {
        log.info("Получение товаров");
        List<ProductDto> products;
        if (query != null && !query.isBlank()) {
            log.info("Получение списка товаров. query={}", query);
            // Используем полнотекстовый поиск PostgreSQL с русской морфологией
            products = productService.searchFullText(query);
        } else {
            products = productService.findAll();
        }
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
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "imageUrl", required = false) String imageUrl) {

        ProductDto dto = new ProductDto();
        dto.setName(name);
        dto.setDescription(description);
        dto.setPrice(price);
        dto.setCategoryId(categoryId);

        ProductDto created = productService.create(dto, image, imageUrl);
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

    @DeleteMapping("/bulk")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteBulk(@RequestBody List<Long> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest().body("Список ID не может быть пустым");
            }
            
            int deletedCount = productService.deleteBulk(ids);
            return ResponseEntity.ok(java.util.Map.of(
                "message", "Удаление завершено",
                "deletedCount", deletedCount
            ));
        } catch (Exception e) {
            log.error("Ошибка при массовом удалении товаров", e);
            return ResponseEntity.internalServerError().body("Ошибка при удалении: " + e.getMessage());
        }
    }

    @PostMapping("/cleanup-presigned-urls")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> cleanupPresignedUrls() {
        try {
            productService.cleanupPresignedUrls();
            return ResponseEntity.ok("Очистка presigned URL завершена успешно");
        } catch (Exception e) {
            log.error("Ошибка при очистке presigned URL: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body("Ошибка при очистке presigned URL: " + e.getMessage());
        }
    }

    @PostMapping(value = "/preview-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> previewCsv(@RequestParam("file") MultipartFile csvFile) {
        log.info("Получен запрос на предзагрузку CSV файла: {}", csvFile.getOriginalFilename());
        try {
            if (csvFile.isEmpty()) {
                return ResponseEntity.badRequest().body("Файл не выбран");
            }
            
            String filename = csvFile.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
                return ResponseEntity.badRequest().body("Файл должен иметь расширение .csv");
            }
            
            log.info("Начинаем парсинг CSV файла для предзагрузки");
            List<CsvProductDto> previewData = csvProductService.parseCsvFile(csvFile);
            
            // Получаем заголовки из первой строки файла
            String[] csvHeaders = csvProductService.getCsvHeaders(csvFile);
            
            log.info("Предзагрузка завершена. Найдено {} товаров", previewData.size());
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

    @PostMapping(value = "/import-csv-with-category", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importFromCsvWithCategory(
            @RequestParam("file") MultipartFile csvFile,
            @RequestParam("targetCategoryId") Long targetCategoryId) {
        try {
            if (csvFile.isEmpty()) {
                return ResponseEntity.badRequest().body("Файл не выбран");
            }
            
            String filename = csvFile.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
                return ResponseEntity.badRequest().body("Файл должен иметь расширение .csv");
            }
            
            if (targetCategoryId == null) {
                return ResponseEntity.badRequest().body("ID целевой категории не указан");
            }
            
            List<ProductDto> importedProducts = csvProductService.importProductsFromCsv(csvFile, targetCategoryId);
            
            return ResponseEntity.ok(java.util.Map.of(
                "message", "Импорт завершен успешно",
                "importedCount", importedProducts.size(),
                "targetCategoryId", targetCategoryId,
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

    @PutMapping("/bulk-move")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> moveBulk(@RequestBody BulkMoveRequest request) {
        try {
            if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
                return ResponseEntity.badRequest().body("Список ID товаров не может быть пустым");
            }
            
            if (request.getTargetCategoryId() == null) {
                return ResponseEntity.badRequest().body("ID целевой категории не указан");
            }
            
            int movedCount = productService.moveBulk(request.getProductIds(), request.getTargetCategoryId());
            return ResponseEntity.ok(java.util.Map.of(
                "message", "Перенос завершен",
                "movedCount", movedCount,
                "targetCategoryId", request.getTargetCategoryId()
            ));
        } catch (Exception e) {
            log.error("Ошибка при массовом переносе товаров", e);
            return ResponseEntity.internalServerError().body("Ошибка при переносе: " + e.getMessage());
        }
    }
    
    // Эндпоинты для работы с изображениями товаров
    
    @PostMapping("/{productId}/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ru.dugaweld.www.dto.ProductImageDto> addProductImage(
            @PathVariable Long productId,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "displayOrder", required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "isPrimary", required = false, defaultValue = "false") Boolean isPrimary
    ) {
        try {
            log.info("Добавление изображения к товару ID: {}", productId);
            ru.dugaweld.www.dto.ProductImageDto imageDto = productService.addProductImage(productId, image, displayOrder, isPrimary);
            return ResponseEntity.ok(imageDto);
        } catch (Exception e) {
            log.error("Ошибка при добавлении изображения", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{productId}/images")
    public ResponseEntity<List<ru.dugaweld.www.dto.ProductImageDto>> getProductImages(@PathVariable Long productId) {
        try {
            List<ru.dugaweld.www.dto.ProductImageDto> images = productService.getProductImages(productId);
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            log.error("Ошибка при получении изображений товара", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProductImage(@PathVariable Long imageId) {
        try {
            log.info("Удаление изображения ID: {}", imageId);
            productService.deleteProductImage(imageId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Ошибка при удалении изображения", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}




