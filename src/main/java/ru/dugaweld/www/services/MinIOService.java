package ru.dugaweld.www.services;

import io.minio.*;
import io.minio.http.Method;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
public class MinIOService {
    
    private final MinioClient minioClient;
    private final String bucketName;
    
    public MinIOService(
            @Value("${minio.endpoint}") String endpoint,
            @Value("${minio.access-key}") String accessKey,
            @Value("${minio.secret-key}") String secretKey,
            @Value("${minio.bucket-name}") String bucketName) {
        
        this.minioClient = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
        this.bucketName = bucketName;
        
        initializeBucket();
    }
    
    /**
     * Инициализация bucket'а, если он не существует
     */
    private void initializeBucket() {
        try {
            boolean bucketExists = minioClient.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(bucketName)
                            .build()
            );
            
            if (!bucketExists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(bucketName)
                                .build()
                );
                log.info("Bucket '{}' создан успешно", bucketName);
            } else {
                log.info("Bucket '{}' уже существует", bucketName);
            }
        } catch (Exception e) {
            log.error("Ошибка при инициализации bucket'а: {}", e.getMessage());
            throw new RuntimeException("Не удалось инициализировать MinIO bucket", e);
        }
    }
    
    /**
     * Загрузка файла в MinIO
     */
    public String uploadFile(MultipartFile file) {
        try {
            String fileName = generateFileName(file.getOriginalFilename());
            
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            
            log.info("Файл '{}' успешно загружен в MinIO", fileName);
            return fileName;
            
        } catch (Exception e) {
            log.error("Ошибка при загрузке файла в MinIO: {}", e.getMessage());
            throw new RuntimeException("Не удалось загрузить файл в MinIO", e);
        }
    }
    
    /**
     * Получение файла из MinIO
     */
    public InputStream getFile(String fileName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .build()
            );
        } catch (Exception e) {
            log.error("Ошибка при получении файла '{}' из MinIO: {}", fileName, e.getMessage());
            throw new RuntimeException("Не удалось получить файл из MinIO", e);
        }
    }
    
    /**
     * Удаление файла из MinIO
     */
    public void deleteFile(String fileName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .build()
            );
            log.info("Файл '{}' успешно удален из MinIO", fileName);
        } catch (Exception e) {
            log.error("Ошибка при удалении файла '{}' из MinIO: {}", fileName, e.getMessage());
            throw new RuntimeException("Не удалось удалить файл из MinIO", e);
        }
    }
    
    /**
     * Получение URL для доступа к файлу
     */
    public String getFileUrl(String fileName) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(fileName)
                            .expiry(60 * 60 * 24) // 24 часа
                            .build()
            );
        } catch (Exception e) {
            log.error("Ошибка при получении URL для файла '{}': {}", fileName, e.getMessage());
            throw new RuntimeException("Не удалось получить URL файла", e);
        }
    }
    
    /**
     * Генерация уникального имени файла
     */
    private String generateFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return UUID.randomUUID() + extension;
    }
    
    /**
     * Проверка существования файла
     */
    public boolean fileExists(String fileName) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .build()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
