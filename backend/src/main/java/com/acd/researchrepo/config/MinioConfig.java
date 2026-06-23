package com.acd.researchrepo.config;

import com.acd.researchrepo.environment.AppProperties;
import io.minio.MinioClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "minio")
public class MinioConfig {

  @Bean
  public MinioClient minioClient(AppProperties appProperties) {
    AppProperties.Minio minio = appProperties.getMinio();
    return MinioClient.builder()
        .endpoint(minio.getEndpoint())
        .credentials(minio.getAccessKey(), minio.getSecretKey())
        .build();
  }
}
