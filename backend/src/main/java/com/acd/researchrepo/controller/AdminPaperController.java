package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.model.ResearchPaperDto;
import com.acd.researchrepo.dto.external.papers.PaginatedResponse;
import com.acd.researchrepo.dto.external.papers.PaperCreateRequest;
import com.acd.researchrepo.dto.external.papers.PaperUpdateRequest;
import com.acd.researchrepo.dto.external.papers.ResearchPaperSearchRequest;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.PaperSubmissionService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Admin paper management — CRUD, archive, and unarchive. Paper creation accepts multipart
 * (metadata JSON + file). DEPARTMENT_ADMINs are scoped to their own department; SUPER_ADMINs
 * see all.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/papers")
public class AdminPaperController {

  private final ResearchPaperService researchPaperService;
  private final PaperSubmissionService paperSubmissionService;
  private final ObjectMapper objectMapper;

  public AdminPaperController(
      ResearchPaperService researchPaperService,
      PaperSubmissionService paperSubmissionService,
      ObjectMapper objectMapper) {
    this.researchPaperService = researchPaperService;
    this.paperSubmissionService = paperSubmissionService;
    this.objectMapper = objectMapper;
  }

  @GetMapping
  public ResponseEntity<PaginatedResponse<ResearchPaperDto>> getAdminPapers(
      @Valid ResearchPaperSearchRequest request,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("GET /api/admin/papers endpoint hit");

    PaginatedResponse<ResearchPaperDto> response =
        researchPaperService.getAdminPapers(request, principal);

    return ResponseEntity.ok(response);
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ResearchPaperDto> createPaper(
      @RequestPart("metadata") String metadataJson,
      @RequestPart("file") MultipartFile file,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("POST /api/admin/papers endpoint hit");

    PaperCreateRequest metadata;
    try {
      metadata = objectMapper.readValue(metadataJson, PaperCreateRequest.class);
    } catch (JsonProcessingException e) {
      log.debug("Failed to parse paper metadata", e);
      throw new ApiException(ErrorCode.INVALID_REQUEST, "The metadata part must be valid JSON");
    }

    ResearchPaperDto response = researchPaperService.createPaper(metadata, file, principal);

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PutMapping("/{id}")
  public ResponseEntity<ResearchPaperDto> updatePaper(
      @PathVariable Integer id,
      @Valid @RequestBody PaperUpdateRequest metadata,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("PUT /api/admin/papers/{} endpoint hit", id);

    ResearchPaperDto response = researchPaperService.updatePaper(id, metadata, principal);

    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePaper(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("DELETE /api/admin/papers/{} endpoint hit", id);

    researchPaperService.deletePaper(id, principal);

    return ResponseEntity.noContent().build();
  }

  @PutMapping("/{id}/approve")
  public ResponseEntity<ResearchPaperDto> approveSubmission(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("PUT /api/admin/papers/{}/approve endpoint hit", id);
    ResearchPaperDto response = paperSubmissionService.approveSubmission(id, principal);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}/reject-submission")
  public ResponseEntity<Void> rejectSubmission(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("PUT /api/admin/papers/{}/reject-submission endpoint hit", id);
    paperSubmissionService.rejectSubmission(id, principal);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/{id}/archive")
  public ResponseEntity<Void> archivePaper(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("PUT /api/admin/papers/{}/archive endpoint hit", id);
    researchPaperService.archivePaper(id, principal);
    return ResponseEntity.ok().build();
  }

  @PutMapping("/{id}/unarchive")
  public ResponseEntity<Void> unarchivePaper(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("PUT /api/admin/papers/{}/unarchive endpoint hit", id);
    researchPaperService.unarchivePaper(id, principal);
    return ResponseEntity.ok().build();
  }
}
