package com.acd.researchrepo.storage;

import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.errors.MinioException;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
/**
 * Ensures the configured MinIO bucket exists when the application starts. Only active when {@code
 * app.storage.provider=minio}.
 */
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "minio")
public class MinioBucketInitializer {

  private final MinioClient minioClient;
  private final String bucket;

  public MinioBucketInitializer(
      MinioClient minioClient, @Value("${app.minio.bucket}") String bucket) {
    this.minioClient = minioClient;
    this.bucket = bucket;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void ensureBucketExists() {
    try {
      boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());

      if (!exists) {
        minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        log.info("Created MinIO bucket: {}", bucket);
      } else {
        log.info("MinIO bucket already exists: {}", bucket);
      }
    } catch (MinioException | IOException | InvalidKeyException | NoSuchAlgorithmException e) {
      log.error("Could not initialize MinIO bucket: {}", bucket, e);
      throw new ApiException(ErrorCode.FILE_STORAGE_ERROR, "Could not initialize MinIO bucket");
    }
  }
}
