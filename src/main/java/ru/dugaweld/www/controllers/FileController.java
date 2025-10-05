package ru.dugaweld.www.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.dugaweld.www.services.MinIOService;

import java.io.InputStream;

@Slf4j
@RestController
@RequestMapping("/api/files")
@Tag(name = "Файлы")
public class FileController {
    
    private final MinIOService minIOService;
    
    public FileController(MinIOService minIOService) {
        this.minIOService = minIOService;
    }
    
    @PostMapping("/upload")
    @Operation(summary = "Загрузка файла в MinIO")
    public ResponseEntity<String> uploadFile(
            @Parameter(description = "Файл для загрузки")
            @RequestParam("file") MultipartFile file) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Файл не может быть пустым");
            }
            
            String fileName = minIOService.uploadFile(file);
            String fileUrl = minIOService.getFileUrl(fileName);
            
            log.info("Файл '{}' успешно загружен", fileName);
            return ResponseEntity.ok(fileUrl);
            
        } catch (Exception e) {
            log.error("Ошибка при загрузке файла: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Ошибка при загрузке файла: " + e.getMessage());
        }
    }
    
    @GetMapping("/{fileName}")
    @Operation(summary = "Получение файла из MinIO")
    public ResponseEntity<InputStreamResource> getFile(
            @Parameter(description = "Имя файла")
            @PathVariable String fileName) {
        
        try {
            if (!minIOService.fileExists(fileName)) {
                return ResponseEntity.notFound().build();
            }
            
            InputStream inputStream = minIOService.getFile(fileName);
            InputStreamResource resource = new InputStreamResource(inputStream);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("Ошибка при получении файла '{}': {}", fileName, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{fileName}/url")
    @Operation(summary = "Получение URL файла из MinIO")
    public ResponseEntity<String> getFileUrl(
            @Parameter(description = "Имя файла")
            @PathVariable String fileName) {
        
        try {
            if (!minIOService.fileExists(fileName)) {
                return ResponseEntity.notFound().build();
            }
            
            String fileUrl = minIOService.getFileUrl(fileName);
            return ResponseEntity.ok(fileUrl);
            
        } catch (Exception e) {
            log.error("Ошибка при получении URL файла '{}': {}", fileName, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Ошибка при получении URL файла: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{fileName}")
    @Operation(summary = "Удаление файла из MinIO")
    public ResponseEntity<String> deleteFile(
            @Parameter(description = "Имя файла")
            @PathVariable String fileName) {
        
        try {
            if (!minIOService.fileExists(fileName)) {
                return ResponseEntity.notFound().build();
            }
            
            minIOService.deleteFile(fileName);
            log.info("Файл '{}' успешно удален", fileName);
            return ResponseEntity.ok("Файл успешно удален");
            
        } catch (Exception e) {
            log.error("Ошибка при удалении файла '{}': {}", fileName, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Ошибка при удалении файла: " + e.getMessage());
        }
    }
    
    @GetMapping("/{fileName}/exists")
    @Operation(summary = "Проверка существования файла в MinIO")
    public ResponseEntity<Boolean> fileExists(
            @Parameter(description = "Имя файла")
            @PathVariable String fileName) {
        
        boolean exists = minIOService.fileExists(fileName);
        return ResponseEntity.ok(exists);
    }
}



