package com.quizrank.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Locale;
import java.util.UUID;

@Service
public class UploadStorageService {
    private final Path root;
    public UploadStorageService(@Value("${quizrank.upload-dir:uploads}") String dir) {
        this.root = Paths.get(dir).toAbsolutePath().normalize();
    }
    public String savePdf(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Please select a PDF file.");
        String original = file.getOriginalFilename() == null ? "document.pdf" : Paths.get(file.getOriginalFilename()).getFileName().toString();
        if (!original.toLowerCase(Locale.ROOT).endsWith(".pdf")) throw new IllegalArgumentException("Only PDF files are allowed.");
        if (file.getSize() > 10L * 1024 * 1024) throw new IllegalArgumentException("PDF must be 10 MB or less.");
        byte[] bytes = file.getBytes();
        if (bytes.length < 5 || bytes[0] != '%' || bytes[1] != 'P' || bytes[2] != 'D' || bytes[3] != 'F' || bytes[4] != '-')
            throw new IllegalArgumentException("Uploaded file is not a valid PDF.");
        Files.createDirectories(root);
        String stored = UUID.randomUUID() + ".pdf";
        Files.write(root.resolve(stored), bytes, StandardOpenOption.CREATE_NEW);
        return stored;
    }
    public Path path(String stored) {
        Path p = root.resolve(stored).normalize();
        if (!p.startsWith(root)) throw new IllegalArgumentException("Invalid file path");
        return p;
    }
    public void delete(String stored) throws IOException { Files.deleteIfExists(path(stored)); }
}
