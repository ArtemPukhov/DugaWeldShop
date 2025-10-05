package ru.dugaweld.www.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.ByteArrayMultipartFileEditor;
import ru.dugaweld.www.config.ByteArrayMultipartFile;
import ru.dugaweld.www.dto.CsvProductDto;
import ru.dugaweld.www.dto.ProductDto;
import ru.dugaweld.www.dto.ColumnMappingDto;
import ru.dugaweld.www.repositories.CategoryRepository;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

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
        List<CsvProductDto> csvProducts = parseCsvFile(csvFile);
        List<ProductDto> importedProducts = new ArrayList<>();

        for (CsvProductDto csvProduct : csvProducts) {
            try {
                ProductDto productDto = convertCsvToProductDto(csvProduct);

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
        return parseCsvFileWithMapping(csvFile, null);
    }

    public List<CsvProductDto> parseCsvFileWithMapping(MultipartFile csvFile, List<ColumnMappingDto> columnMappings) throws IOException {
        List<CsvProductDto> products = new ArrayList<>();
        
        // Пробуем разные кодировки для лучшей совместимости
        String[] encodings = {"UTF-8", "Windows-1251", "CP1251", "ISO-8859-1"};
        BufferedReader reader = null;
        
        for (String encoding : encodings) {
            try {
                reader = new BufferedReader(new InputStreamReader(csvFile.getInputStream(), encoding));
                break;
            } catch (Exception e) {
                // Пробуем следующую кодировку
                if (reader != null) {
                    reader.close();
                }
            }
        }
        
        if (reader == null) {
            // Fallback на UTF-8
            reader = new BufferedReader(new InputStreamReader(csvFile.getInputStream(), "UTF-8"));
        }
        
        try (BufferedReader finalReader = reader) {
            String line;
            boolean isFirstLine = true;
            String[] headers = null;
            
            while ((line = finalReader.readLine()) != null) {
                if (isFirstLine) {
                    headers = parseCsvLine(line);
                    isFirstLine = false;
                    continue;
                }
                
                String[] values = parseCsvLine(line);
                if (values.length > 0) {
                    CsvProductDto product = new CsvProductDto();
                    
                    if (columnMappings != null && headers != null) {
                        // Используем маппинг колонок
                        Map<String, String> valueMap = new HashMap<>();
                        for (int i = 0; i < Math.min(headers.length, values.length); i++) {
                            valueMap.put(headers[i].trim(), values[i].trim());
                        }
                        
                        for (ColumnMappingDto mapping : columnMappings) {
                            String value = valueMap.get(mapping.getCsvColumn());
                            if (value != null) {
                                setProductField(product, mapping.getTargetField(), value);
                            }
                        }
                    } else {
                        // Стандартное сопоставление по позиции
                        product.setName(values.length > 0 ? values[0].trim() : "");
                        product.setDescription(values.length > 1 ? values[1].trim() : "");
                        product.setPrice(values.length > 2 ? values[2].trim() : "0");
                        product.setCategoryId(values.length > 3 ? values[3].trim() : "1");
                        product.setImageUrl(values.length > 4 ? values[4].trim() : "");
                    }
                    
                    products.add(product);
                }
            }
        }
        
        return products;
    }

    public String[] getCsvHeaders(MultipartFile csvFile) throws IOException {
        // Пробуем разные кодировки для лучшей совместимости
        String[] encodings = {"UTF-8", "Windows-1251", "CP1251", "ISO-8859-1"};
        BufferedReader reader = null;
        
        for (String encoding : encodings) {
            try {
                reader = new BufferedReader(new InputStreamReader(csvFile.getInputStream(), encoding));
                break;
            } catch (Exception e) {
                if (reader != null) {
                    reader.close();
                }
            }
        }
        
        if (reader == null) {
            reader = new BufferedReader(new InputStreamReader(csvFile.getInputStream(), "UTF-8"));
        }
        
        try (BufferedReader finalReader = reader) {
            String firstLine = finalReader.readLine();
            if (firstLine != null) {
                return parseCsvLine(firstLine);
            }
        }
        
        return new String[0];
    }

    private String[] parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder currentValue = new StringBuilder();
        
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ';' && !inQuotes) {
                values.add(currentValue.toString());
                currentValue = new StringBuilder();
            } else {
                currentValue.append(c);
            }
        }
        
        values.add(currentValue.toString());
        return values.toArray(new String[0]);
    }

    private ProductDto convertCsvToProductDto(CsvProductDto csvProduct) {
        ProductDto productDto = new ProductDto();
        productDto.setName(csvProduct.getName());
        productDto.setDescription(csvProduct.getDescription());
        
        try {
            productDto.setPrice(new BigDecimal(csvProduct.getPrice()));
        } catch (NumberFormatException e) {
            productDto.setPrice(BigDecimal.ZERO);
        }
        
        try {
            Long categoryId = Long.parseLong(csvProduct.getCategoryId());
            // Проверяем, что категория существует
            categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Категория с ID " + categoryId + " не найдена"));
            productDto.setCategoryId(categoryId);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Неверный ID категории: " + csvProduct.getCategoryId());
        }
        
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
