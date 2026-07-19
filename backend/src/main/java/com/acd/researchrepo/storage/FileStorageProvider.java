package com.acd.researchrepo.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction for file storage, backed by either the local filesystem or MinIO depending on {@code
 * app.storage.provider}. The {@code subPath} parameter is a relative path (e.g. {@code
 * 2025/it/paper_1234.pdf}) that is resolved against the provider's root location or bucket.
 */
public interface FileStorageProvider {

  /**
   * Stores a file at the given relative path. Creates intermediate directories as needed.
   *
   * @return the same {@code subPath} that was passed in
   */
  String saveFile(MultipartFile file, String subPath);

  /** Loads a file as a {@link Resource} for streaming. */
  Resource loadFile(String subPath);

  /** Deletes the file at the given relative path. No-op if the file does not exist. */
  void deleteFile(String subPath);
}
