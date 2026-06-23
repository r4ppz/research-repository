package com.acd.researchrepo.storage;

import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.MinioException;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "minio")
public class MinioFileStorageProvider implements FileStorageProvider {

  private final MinioClient minioClient;
  private final String bucket;

  public MinioFileStorageProvider(
      MinioClient minioClient, @Value("${app.minio.bucket}") String bucket) {
    this.minioClient = minioClient;
    this.bucket = bucket;
  }

  @Override
  public String saveFile(MultipartFile file, String subPath) {
    try {
      PutObjectArgs args =
          PutObjectArgs.builder().bucket(bucket).object(subPath).stream(
                  file.getInputStream(), file.getSize(), -1)
              .contentType(file.getContentType())
              .build();

      minioClient.putObject(args);
      return subPath;
    } catch (MinioException | IOException | InvalidKeyException | NoSuchAlgorithmException e) {
      log.error("Failed to store file in MinIO: {}", subPath, e);
      throw new ApiException(ErrorCode.FILE_STORAGE_ERROR, "Failed to store file");
    }
  }

  @Override
  public Resource loadFile(String subPath) {
    try {
      GetObjectArgs args = GetObjectArgs.builder().bucket(bucket).object(subPath).build();

      InputStream inputStream = minioClient.getObject(args);
      return new InputStreamResource(inputStream);
    } catch (MinioException | IOException | InvalidKeyException | NoSuchAlgorithmException e) {
      log.error("Could not read file from MinIO: {}", subPath, e);
      throw new ApiException(ErrorCode.FILE_NOT_FOUND, "File not found");
    }
  }

  @Override
  public void deleteFile(String subPath) {
    try {
      RemoveObjectArgs args = RemoveObjectArgs.builder().bucket(bucket).object(subPath).build();

      minioClient.removeObject(args);
    } catch (MinioException | IOException | InvalidKeyException | NoSuchAlgorithmException e) {
      log.error("Could not delete file from MinIO: {}", subPath, e);
      throw new ApiException(ErrorCode.FILE_STORAGE_ERROR, "Could not delete file");
    }
  }
}
