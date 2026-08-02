package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.common.PaginatedResponse;
import com.acd.researchrepo.dto.external.papers.PaperCreateRequest;
import com.acd.researchrepo.dto.external.papers.PaperResponse;
import com.acd.researchrepo.dto.external.papers.PaperSearchRequest;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.SubmissionService;
import com.acd.researchrepo.util.MultipartParser;
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

/** REST endpoints for students to submit, list, update, and delete their paper submissions. */
@Slf4j
@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

  private final SubmissionService submissionService;
  private final ObjectMapper objectMapper;

  public SubmissionController(SubmissionService submissionService, ObjectMapper objectMapper) {
    this.submissionService = submissionService;
    this.objectMapper = objectMapper;
  }

  /**
   * Submits a new paper (multipart: metadata JSON + file). Creates a PENDING_REVIEW submission.
   *
   * @param metadataJson the paper metadata as JSON
   * @param file the uploaded file
   * @param principal the submitting student
   * @return the created submission with 201
   */
  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<PaperResponse> submitPaper(
      @RequestPart("metadata") String metadataJson,
      @RequestPart("file") MultipartFile file,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("POST /api/submissions endpoint hit");

    PaperCreateRequest metadata = MultipartParser.parseMetadata(metadataJson, objectMapper);

    PaperResponse response = submissionService.createSubmission(metadata, file, principal);

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  /**
   * Lists the caller's own submissions.
   *
   * @param request the search/pagination parameters
   * @param principal the requesting user
   * @return a paginated list of the caller's submissions
   */
  @GetMapping
  public ResponseEntity<PaginatedResponse<PaperResponse>> getMySubmissions(
      @Valid PaperSearchRequest request, @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("GET /api/submissions endpoint hit");

    return ResponseEntity.ok(submissionService.getMySubmissions(request, principal));
  }

  /**
   * Updates a PENDING_REVIEW submission. The file is optional; omit it to keep the current file.
   *
   * @param id the submission ID
   * @param metadataJson the updated metadata as JSON
   * @param file the replacement file, or null
   * @param principal the submitting student
   * @return the updated submission
   */
  @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<PaperResponse> updateSubmission(
      @PathVariable Integer id,
      @RequestPart("metadata") String metadataJson,
      @RequestPart(value = "file", required = false) MultipartFile file,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("PUT /api/submissions/{} endpoint hit", id);

    PaperCreateRequest metadata = MultipartParser.parseMetadata(metadataJson, objectMapper);

    PaperResponse response = submissionService.updateSubmission(id, metadata, file, principal);

    return ResponseEntity.ok(response);
  }

  /**
   * Deletes a PENDING_REVIEW submission and its stored file.
   *
   * @param id the submission ID
   * @param principal the submitting student
   * @return 204 No Content
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteSubmission(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("DELETE /api/submissions/{} endpoint hit", id);
    submissionService.deleteSubmission(id, principal);
    return ResponseEntity.noContent().build();
  }
}
