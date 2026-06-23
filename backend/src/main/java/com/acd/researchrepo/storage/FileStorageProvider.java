package com.acd.researchrepo.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageProvider {

  String saveFile(MultipartFile file, String subPath);

  Resource loadFile(String subPath);

  void deleteFile(String subPath);
}
