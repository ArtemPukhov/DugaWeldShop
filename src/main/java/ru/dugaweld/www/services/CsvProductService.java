package ru.dugaweld.www.services;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import ru.dugaweld.www.config.ByteArrayMultipartFile;
import ru.dugaweld.www.dto.CsvProductDto;
import ru.dugaweld.www.dto.ProductDto;
import ru.dugaweld.www.dto.ColumnMappingDto;
import ru.dugaweld.www.repositories.CategoryRepository;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CsvProductService {
    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    @Value("${saveImagesPath}")
    private String saveImagesPath;
    @Value("${getImagesPath}")
    private String getImagesPath;

    public CsvProductService(ProductService productService, CategoryRepository categoryRepository) {
        this.productService = productService;
        this.categoryRepository = categoryRepository;
    }

    public List<ProductDto> importProductsFromCsv(MultipartFile csvFile) throws IOException {
        return importProductsFromCsv(csvFile, null);
    }

    public List<ProductDto> importProductsFromCsv(MultipartFile csvFile, Long targetCategoryId) throws IOException {
        List<CsvProductDto> csvProducts = parseCsvFile(csvFile);
        List<ProductDto> importedProducts = new ArrayList<>();

        for (CsvProductDto csvProduct : csvProducts) {
            try {
                ProductDto productDto = convertCsvToProductDto(csvProduct, targetCategoryId);

                MultipartFile imageFile = null;
                if (csvProduct.getImageUrl() != null && !csvProduct.getImageUrl().isEmpty()) {
                    imageFile = downloadImageFromUrl(csvProduct.getImageUrl());
                }
                ProductDto savedProduct = productService.create(productDto, imageFile);
                importedProducts.add(savedProduct);
            } catch (Exception e) {
                // Логируем ошибку и продолжаем с следующим товаром
                System.err.println("Ошибка при импорте товара: " + csvProduct.getName() + " - " + e.getMessage());
            }
        }

        return importedProducts;
    }

    public List<CsvProductDto> parseCsvFile(MultipartFile csvFile) throws IOException {
        log.info("Начинаем парсинг CSV файла: {} (размер: {} байт)", csvFile.getOriginalFilename(), csvFile.getSize());
        List<CsvProductDto> products = new ArrayList<>();
        
        // Пробуем разные кодировки и разделители
        String[] encodings = {"UTF-8", "Windows-1251", "CP1251", "ISO-8859-1"};
        
        for (String encoding : encodings) {
            for (char delimiter : new char[]{',', ';'}) {
                try (Reader reader = new InputStreamReader(csvFile.getInputStream(), encoding)) {
                    CSVFormat format = CSVFormat.Builder.create()
                            .setDelimiter(delimiter)
                            .setHeader()
                            .setIgnoreEmptyLines(true)
                            .setTrim(true)
                            .build();
                    
                    try (CSVParser parser = new CSVParser(reader, format)) {
                        log.info("Успешно открыт CSV с кодировкой {} и разделителем '{}'", encoding, delimiter);
                        log.info("Заголовки CSV: {}", parser.getHeaderNames());
                        
                        int recordCount = 0;
                        for (CSVRecord record : parser) {
                            try {
                                CsvProductDto product = new CsvProductDto();
                                product.setName(getValue(record, "name"));
                                product.setDescription(getValue(record, "description"));
                                product.setPrice(getValue(record, "price"));
                                product.setCategoryId(getValue(record, "categoryId"));
                                product.setImageUrl(getValue(record, "imageUrl"));
                                
                                // Логируем первые несколько записей для отладки
                                if (recordCount < 3) {
                                    log.info("Запись {}: name='{}', categoryId='{}'", 
                                            recordCount + 1, product.getName(), product.getCategoryId());
                                }
                                
                                products.add(product);
                                recordCount++;
                            } catch (Exception e) {
                                log.warn("Ошибка при обработке записи {}: {}", recordCount + 1, e.getMessage());
                            }
                        }
                        
                        log.info("Парсинг завершен. Обработано {} записей", recordCount);
                        return products; // Успешно распарсили, возвращаем результат
                        
                    }
                } catch (Exception e) {
                    log.debug("Не удалось парсить с кодировкой {} и разделителем '{}': {}", encoding, delimiter, e.getMessage());
                }
            }
        }
        
        // Fallback на UTF-8 с запятой
        log.warn("Используем fallback настройки (UTF-8, запятая)");
        try (Reader reader = new InputStreamReader(csvFile.getInputStream(), StandardCharsets.UTF_8)) {
            CSVFormat format = CSVFormat.Builder.create()
                    .setDelimiter(',')
                    .setHeader()
                    .setIgnoreEmptyLines(true)
                    .setTrim(true)
                    .build();
            
            try (CSVParser parser = new CSVParser(reader, format)) {
                log.info("Заголовки CSV: {}", parser.getHeaderNames());
                
                int recordCount = 0;
                for (CSVRecord record : parser) {
                    try {
                        CsvProductDto product = new CsvProductDto();
                        product.setName(getValue(record, "name"));
                        product.setDescription(getValue(record, "description"));
                        product.setPrice(getValue(record, "price"));
                        product.setCategoryId(getValue(record, "categoryId"));
                        product.setImageUrl(getValue(record, "imageUrl"));
                        
                        products.add(product);
                        recordCount++;
                    } catch (Exception e) {
                        log.warn("Ошибка при обработке записи {}: {}", recordCount + 1, e.getMessage());
                    }
                }
                
                log.info("Парсинг завершен. Обработано {} записей", recordCount);
            }
        }
        
        return products;
    }
    
    private String getValue(CSVRecord record, String columnName) {
        try {
            return record.get(columnName);
        } catch (IllegalArgumentException e) {
            // Колонка не найдена, пробуем альтернативные названия
            String[] alternatives = getAlternativeColumnNames(columnName);
            for (String alt : alternatives) {
                try {
                    return record.get(alt);
                } catch (IllegalArgumentException ignored) {}
            }
            log.warn("Колонка '{}' не найдена в CSV", columnName);
            return "";
        }
    }
    
    private String[] getAlternativeColumnNames(String columnName) {
        switch (columnName) {
            case "name": return new String[]{"название", "title", "product_name", "наименование"};
            case "description": return new String[]{"описание", "desc", "product_description"};
            case "price": return new String[]{"цена", "cost", "product_price", "стоимость"};
            case "categoryId": return new String[]{"category_id", "categoryld", "категория", "category"};
            case "imageUrl": return new String[]{"image_url", "image", "фото", "картинка", "url"};
            default: return new String[]{};
        }
    }

    public List<CsvProductDto> parseCsvFileWithMapping(MultipartFile csvFile, List<ColumnMappingDto> columnMappings) throws IOException {
        // Для совместимости с существующим кодом, используем новый парсер
        return parseCsvFile(csvFile);
    }

    public String[] getCsvHeaders(MultipartFile csvFile) throws IOException {
        log.info("Получение заголовков CSV файла: {}", csvFile.getOriginalFilename());
        
        // Пробуем разные кодировки и разделители
        String[] encodings = {"UTF-8", "Windows-1251", "CP1251", "ISO-8859-1"};
        
        for (String encoding : encodings) {
            for (char delimiter : new char[]{',', ';'}) {
                try (Reader reader = new InputStreamReader(csvFile.getInputStream(), encoding)) {
                    CSVFormat format = CSVFormat.Builder.create()
                            .setDelimiter(delimiter)
                            .setHeader()
                            .setIgnoreEmptyLines(true)
                            .setTrim(true)
                            .build();
                    
                    try (CSVParser parser = new CSVParser(reader, format)) {
                        List<String> headers = parser.getHeaderNames();
                        if (headers != null && !headers.isEmpty()) {
                            log.info("Успешно получены заголовки с кодировкой {} и разделителем '{}': {}", 
                                    encoding, delimiter, headers);
                            return headers.toArray(new String[0]);
                        }
                    }
                } catch (Exception e) {
                    log.debug("Не удалось получить заголовки с кодировкой {} и разделителем '{}': {}", 
                            encoding, delimiter, e.getMessage());
                }
            }
        }
        
        log.warn("Не удалось получить заголовки CSV, возвращаем пустой массив");
        return new String[0];
    }


    private ProductDto convertCsvToProductDto(CsvProductDto csvProduct) {
        return convertCsvToProductDto(csvProduct, null);
    }

    private ProductDto convertCsvToProductDto(CsvProductDto csvProduct, Long targetCategoryId) {
        ProductDto productDto = new ProductDto();
        productDto.setName(csvProduct.getName());
        productDto.setDescription(csvProduct.getDescription());
        
        try {
            productDto.setPrice(new BigDecimal(csvProduct.getPrice()));
        } catch (NumberFormatException e) {
            productDto.setPrice(BigDecimal.ZERO);
        }
        
        // Если указана целевая категория, используем её, иначе используем категорию из CSV
        final Long categoryId;
        if (targetCategoryId != null) {
            categoryId = targetCategoryId;
        } else {
            try {
                categoryId = Long.parseLong(csvProduct.getCategoryId());
            } catch (NumberFormatException e) {
                throw new RuntimeException("Неверный ID категории: " + csvProduct.getCategoryId());
            }
        }
        
        // Проверяем, что категория существует
        categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Категория с ID " + categoryId + " не найдена"));
        productDto.setCategoryId(categoryId);
        
        productDto.setImageUrl(csvProduct.getImageUrl());
        
        return productDto;
    }

    private void setProductField(CsvProductDto product, String fieldName, String value) {
        switch (fieldName) {
            case "name":
                product.setName(cleanHtmlTags(value));
                break;
            case "description":
                product.setDescription(cleanHtmlTags(value));
                break;
            case "price":
                product.setPrice(cleanHtmlTags(value));
                break;
            case "categoryId":
                product.setCategoryId(cleanHtmlTags(value));
                break;
            case "imageUrl":
                product.setImageUrl(cleanHtmlTags(value));
                break;
        }
    }

    private String cleanHtmlTags(String value) {
        if (value == null || value.isEmpty()) return "";
        return value.replaceAll("<[^>]*>", "").trim(); // Удаление всех HTML-тегов
    }

private MultipartFile downloadImageFromUrl(String imageUrl) {
    try {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.IMAGE_JPEG, MediaType.IMAGE_PNG));
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                imageUrl,
                HttpMethod.GET,
                entity,
                byte[].class
        );

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new IOException("Ошибка загрузки изображения: статус " + response.getStatusCode());
        }

        String fileName = generateFileNameFromUrlOrMimeType(imageUrl, response.getHeaders().getContentType());
        ByteArrayMultipartFile file = new ByteArrayMultipartFile(fileName, response.getBody());

        file.saveToFile(saveImagesPath);

        return file;

    } catch (Exception e) {
        throw new RuntimeException("Не удалось загрузить изображение по URL: " + imageUrl, e);
    }
}


    private String generateFileNameFromUrlOrMimeType(String imageUrl, MediaType contentType) {
        String defaultExtension = ".jpg"; // Расширение по умолчанию

        // Пытаемся извлечь расширение из URL
        String[] urlParts = imageUrl.split("\\.");
        if (urlParts.length > 1) {
            String ext = urlParts[urlParts.length - 1].toLowerCase();
            if (!ext.equals(urlParts[urlParts.length - 1])) { // Проверка на случай не корректного расширения
                defaultExtension = "." + ext;
            }
        }

        // Если есть contentType, используем его для определения расширения
        if (contentType != null) {
            switch (contentType.toString()) {
                case "image/png":
                    defaultExtension = ".png";
                    break;
                case "image/jpeg":
                    defaultExtension = ".jpg";
                    break;
                case "image/gif":
                    defaultExtension = ".gif";
                    break;
                case "image/webp":
                    defaultExtension = ".webp";
                    break;
            }
        }

        // Генерируем уникальное имя файла (например, из хэша URL)
        String uniqueName = Integer.toHexString(imageUrl.hashCode());
        return "image_" + uniqueName + defaultExtension;
    }
}
