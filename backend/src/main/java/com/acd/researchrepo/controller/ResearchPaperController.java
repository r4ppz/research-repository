package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.model.ResearchPaperDto;
import com.acd.researchrepo.dto.external.papers.PaginatedResponse;
import com.acd.researchrepo.dto.external.papers.PaperCreateRequest;
import com.acd.researchrepo.dto.external.papers.PaperUserRequestResponse;
import com.acd.researchrepo.dto.external.papers.ResearchPaperSearchRequest;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.ResearchPaperService;
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

/**
 * Endpoints for students and faculty to browse and access research papers. Access to individual
 * papers requires an accepted document request (enforced in {@link
 * com.acd.researchrepo.service.ResearchPaperService}). Archived papers are hidden from students.
 */
@Slf4j
@RestController
@RequestMapping("/api/papers")
public class ResearchPaperController {
  private final ResearchPaperService researchPaperService;
  private final ObjectMapper objectMapper;

  public ResearchPaperController(ResearchPaperService service, ObjectMapper objectMapper) {
    this.researchPaperService = service;
    this.objectMapper = objectMapper;
  }

  @GetMapping
  public ResponseEntity<PaginatedResponse<ResearchPaperDto>> listPapers(
      @Valid ResearchPaperSearchRequest request,
      @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {
    log.debug("api/papers endpoint hit");

    return ResponseEntity.ok(researchPaperService.getPapers(request, userPrincipal));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ResearchPaperDto> getPaperById(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {
    log.debug("api/papers/{} endpoint hit", id);

    return ResponseEntity.ok(researchPaperService.getPaperById(id, userPrincipal));
  }

  @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ResearchPaperDto> submitPaper(
      @RequestPart("metadata") String metadataJson,
      @RequestPart("file") MultipartFile file,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("POST /api/papers/submit endpoint hit");

    PaperCreateRequest metadata;
    try {
      metadata = objectMapper.readValue(metadataJson, PaperCreateRequest.class);
    } catch (JsonProcessingException e) {
      log.warn("Failed to parse submission metadata", e);
      throw new ApiException(ErrorCode.INVALID_REQUEST, "The metadata part must be valid JSON");
    }

    ResearchPaperDto response = researchPaperService.createSubmission(metadata, file, principal);

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PutMapping(value = "/submit/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ResearchPaperDto> updateSubmission(
      @PathVariable Integer id,
      @RequestPart("metadata") String metadataJson,
      @RequestPart(value = "file", required = false) MultipartFile file,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("PUT /api/papers/submit/{} endpoint hit", id);

    PaperCreateRequest metadata;
    try {
      metadata = objectMapper.readValue(metadataJson, PaperCreateRequest.class);
    } catch (JsonProcessingException e) {
      log.warn("Failed to parse submission metadata", e);
      throw new ApiException(ErrorCode.INVALID_REQUEST, "The metadata part must be valid JSON");
    }

    ResearchPaperDto response =
        researchPaperService.updateSubmission(id, metadata, file, principal);

    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/submit/{id}")
  public ResponseEntity<Void> deleteSubmission(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("DELETE /api/papers/submit/{} endpoint hit", id);
    researchPaperService.deleteSubmission(id, principal);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/my-submissions")
  public ResponseEntity<PaginatedResponse<ResearchPaperDto>> getMySubmissions(
      @Valid ResearchPaperSearchRequest request,
      @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("api/papers/my-submissions endpoint hit");

    return ResponseEntity.ok(researchPaperService.getMySubmissions(request, principal));
  }

  @GetMapping("/{id}/my-request")
  public ResponseEntity<PaperUserRequestResponse> getUserRequestForPaper(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {
    log.debug("api/papers/{}/my-request endpoint hit", id);

    PaperUserRequestResponse response =
        researchPaperService.getUserRequestForPaper(id, userPrincipal);
    return ResponseEntity.ok(response);
  }
}
