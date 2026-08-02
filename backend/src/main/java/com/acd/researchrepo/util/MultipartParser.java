package com.acd.researchrepo.util;

import com.acd.researchrepo.dto.external.papers.PaperCreateRequest;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class MultipartParser {

  private MultipartParser() {}

  public static PaperCreateRequest parseMetadata(String json, ObjectMapper mapper) {
    try {
      return mapper.readValue(json, PaperCreateRequest.class);
    } catch (JsonProcessingException e) {
      throw new ApiException(ErrorCode.INVALID_REQUEST, "The metadata part must be valid JSON");
    }
  }
}
