package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.model.ResearchPaperDto;
import com.acd.researchrepo.dto.external.papers.PaginatedResponse;
import com.acd.researchrepo.dto.external.papers.PaperCreateRequest;
import com.acd.researchrepo.dto.external.papers.ResearchPaperSearchRequest;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.PaperSubmissionService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

  private final PaperSubmissionService paperSubmissionService;
  private final ObjectMapper objectMapper;

  public SubmissionController(
      PaperSubmissionService paperSubmissionService, ObjectMapper objectMapper) {
    this.paperSubmissionService = paperSubmissionService;
    this.objectMapper = objectMapper;
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ResearchPaperDto> submitPaper(
      @RequestPart("metadata") String metadataJson,
      @RequestPart("file") MultipartFile file,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("POST /api/submissions endpoint hit");

    PaperCreateRequest metadata;
    try {
      metadata = objectMapper.readValue(metadataJson, PaperCreateRequest.class);
    } catch (JsonProcessingException e) {
      log.debug("Failed to parse submission metadata", e);
      throw new ApiException(ErrorCode.INVALID_REQUEST, "The metadata part must be valid JSON");
    }

    ResearchPaperDto response = paperSubmissionService.createSubmission(metadata, file, principal);

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping
  public ResponseEntity<PaginatedResponse<ResearchPaperDto>> getMySubmissions(
      @Valid ResearchPaperSearchRequest request,
      @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("GET /api/submissions endpoint hit");

    return ResponseEntity.ok(paperSubmissionService.getMySubmissions(request, principal));
  }

  @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ResearchPaperDto> updateSubmission(
      @PathVariable Integer id,
      @RequestPart("metadata") String metadataJson,
      @RequestPart(value = "file", required = false) MultipartFile file,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("PUT /api/submissions/{} endpoint hit", id);

    PaperCreateRequest metadata;
    try {
      metadata = objectMapper.readValue(metadataJson, PaperCreateRequest.class);
    } catch (JsonProcessingException e) {
      log.debug("Failed to parse submission metadata", e);
      throw new ApiException(ErrorCode.INVALID_REQUEST, "The metadata part must be valid JSON");
    }

    ResearchPaperDto response =
        paperSubmissionService.updateSubmission(id, metadata, file, principal);

    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteSubmission(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("DELETE /api/submissions/{} endpoint hit", id);
    paperSubmissionService.deleteSubmission(id, principal);
    return ResponseEntity.noContent().build();
  }
}
