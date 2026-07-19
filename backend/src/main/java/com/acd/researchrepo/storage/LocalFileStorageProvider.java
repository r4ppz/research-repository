package com.acd.researchrepo.storage;

import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Component
/**
 * File storage on the local filesystem. The root directory is configured via {@code
 * app.storage.upload-dir}. Path traversal attacks are prevented by normalizing and verifying
 * that resolved paths stay within the root.
 */
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageProvider implements FileStorageProvider {

  private final Path rootLocation;

  public LocalFileStorageProvider(@Value("${app.storage.upload-dir}") String uploadDir) {
    this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    try {
      Files.createDirectories(rootLocation);
    } catch (IOException e) {
      log.error("Could not initialize storage location", e);
      throw new ApiException(ErrorCode.FILE_STORAGE_ERROR, "Could not initialize storage location");
    }
  }

  @Override
  public String saveFile(MultipartFile file, String subPath) {
    try {
      Path destinationFile = rootLocation.resolve(Paths.get(subPath)).normalize();

      if (!destinationFile.getParent().startsWith(rootLocation)) {
        throw new ApiException(
            ErrorCode.INVALID_REQUEST, "Cannot store file outside current directory");
      }

      Files.createDirectories(destinationFile.getParent());
      Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

      return subPath;
    } catch (IOException e) {
      log.error("Failed to store file: {}", subPath, e);
      throw new ApiException(ErrorCode.FILE_STORAGE_ERROR, "Failed to store file");
    }
  }

  @Override
  public Resource loadFile(String subPath) {
    try {
      Path file = rootLocation.resolve(subPath).normalize();

      if (!file.startsWith(rootLocation)) {
        throw new ApiException(ErrorCode.FILE_NOT_FOUND, "File not found");
      }

      if (!Files.exists(file)) {
        throw new ApiException(ErrorCode.FILE_NOT_FOUND, "File not found");
      }

      Resource resource = new UrlResource(file.toUri());
      if (!resource.exists() || !resource.isReadable()) {
        throw new ApiException(ErrorCode.FILE_NOT_FOUND, "File not found or not readable");
      }

      return resource;
    } catch (MalformedURLException e) {
      log.error("Could not read file: {}", subPath, e);
      throw new ApiException(ErrorCode.FILE_STORAGE_ERROR, "Could not read file");
    }
  }

  @Override
  public void deleteFile(String subPath) {
    try {
      Path file = rootLocation.resolve(subPath);
      Files.deleteIfExists(file);
    } catch (IOException e) {
      log.error("Could not delete file: {}", subPath, e);
      throw new ApiException(ErrorCode.FILE_STORAGE_ERROR, "Could not delete file");
    }
  }
}
