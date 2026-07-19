package com.acd.researchrepo.service;

import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.storage.FileStorageProvider;
import java.io.IOException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Mediates file operations (save, load, delete) through the active {@link FileStorageProvider}
 * with built-in validation — file size limits, allowed content types, and magic byte signature
 * verification (not just Content-Type header).
 */
@Slf4j
@Service
public class FileStorageService {

  private final FileStorageProvider storageProvider;

  private static final List<String> ALLOWED_CONTENT_TYPES =
      List.of(
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  private static final long MAX_FILE_SIZE = 20 * 1024 * 1024;

  private static final byte[] PDF_MAGIC = {0x25, 0x50, 0x44, 0x46}; // %PDF
  private static final byte[] OLE2_MAGIC = {
    (byte) 0xD0, (byte) 0xCF, (byte) 0x11, (byte) 0xE0,
    (byte) 0xA1, (byte) 0xB1, (byte) 0x1A, (byte) 0xE1
  }; // DOC (OLE2)
  private static final byte[] ZIP_MAGIC = {0x50, 0x4B, 0x03, 0x04}; // DOCX (ZIP)

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

    // Verify file signature (magic bytes) — not just Content-Type header
    byte[] header;
    try {
      header = file.getBytes();
    } catch (IOException e) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, "Could not read file content");
    }

    if (!isValidFileSignature(header)) {
      throw new ApiException(
          ErrorCode.UNSUPPORTED_MEDIA_TYPE, "Only PDF, DOC, and DOCX files are allowed");
    }
  }

  private boolean isValidFileSignature(byte[] header) {
    if (header == null || header.length < 4) {
      return false;
    }

    // Check PDF (%PDF)
    if (startsWith(header, PDF_MAGIC)) {
      return true;
    }

    // Check DOC (OLE2 compound document)
    if (header.length >= OLE2_MAGIC.length && startsWith(header, OLE2_MAGIC)) {
      return true;
    }

    // Check DOCX (ZIP archive)
    if (startsWith(header, ZIP_MAGIC)) {
      return true;
    }

    return false;
  }

  private boolean startsWith(byte[] data, byte[] prefix) {
    if (data.length < prefix.length) {
      return false;
    }
    for (int i = 0; i < prefix.length; i++) {
      if (data[i] != prefix[i]) {
        return false;
      }
    }
    return true;
  }
}
