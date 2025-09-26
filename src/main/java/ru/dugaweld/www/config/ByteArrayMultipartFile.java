package ru.dugaweld.www.config;

import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class ByteArrayMultipartFile implements MultipartFile {
    private final byte[] content;
    private final String name;

    public ByteArrayMultipartFile(String name, byte[] content) {
        this.name = name;
        this.content = content;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getOriginalFilename() {
        return name;
    }

    @Override
    public String getContentType() {
        return "image/jpeg"; // Можно улучшить логику определения MIME-типа
    }

    @Override
    public boolean isEmpty() {
        return content.length == 0;
    }

    @Override
    public long getSize() {
        return content.length;
    }

    @Override
    public byte[] getBytes() throws IOException {
        return content;
    }

    @Override
    public InputStream getInputStream() throws IOException {
        return new ByteArrayInputStream(content);
    }

    @Override
    public void transferTo(File dest) throws IOException, IllegalStateException {
        if (dest.exists()) {
            dest.delete();
        }
        Files.write(dest.toPath(), content);
    }

    // Вспомогательный метод для сохранения файла в указанную директорию
    public void saveToFile(String directoryPath) throws IOException {
        File dir = new File(directoryPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        Path filePath = Paths.get(directoryPath, name);
        transferTo(filePath.toFile());
    }
}
