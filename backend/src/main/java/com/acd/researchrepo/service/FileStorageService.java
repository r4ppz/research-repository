package com.acd.researchrepo.service;

import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.storage.FileStorageProvider;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
public class FileStorageService {

  private final FileStorageProvider storageProvider;

  private static final List<String> ALLOWED_CONTENT_TYPES =
      List.of(
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  private static final long MAX_FILE_SIZE = 20 * 1024 * 1024;

  public FileStorageService(FileStorageProvider storageProvider) {
    this.storageProvider = storageProvider;
  }

  public String saveFile(MultipartFile file, String subPath) {
    validateFile(file);
    return storageProvider.saveFile(file, subPath);
  }

  public Resource loadFile(String subPath) {
    return storageProvider.loadFile(subPath);
  }

  public void deleteFile(String subPath) {
    storageProvider.deleteFile(subPath);
  }

  private void validateFile(MultipartFile file) {
    if (file.isEmpty()) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, "File is empty");
    }

    if (file.getSize() > MAX_FILE_SIZE) {
      throw new ApiException(ErrorCode.FILE_TOO_LARGE, "File exceeds 20MB limit");
    }

    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
      throw new ApiException(
          ErrorCode.UNSUPPORTED_MEDIA_TYPE, "Only PDF and DOCX files are allowed");
    }
  }
}
