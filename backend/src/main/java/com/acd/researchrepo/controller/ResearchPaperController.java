package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.common.PaginatedResponse;
import com.acd.researchrepo.dto.external.papers.PaperRequestStatusResponse;
import com.acd.researchrepo.dto.external.papers.PaperResponse;
import com.acd.researchrepo.dto.external.papers.PaperSearchRequest;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.ResearchPaperService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

  public ResearchPaperController(ResearchPaperService service) {
    this.researchPaperService = service;
  }

  @GetMapping
  public ResponseEntity<PaginatedResponse<PaperResponse>> listPapers(
      @Valid PaperSearchRequest request,
      @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {
    log.debug("api/papers endpoint hit");

    return ResponseEntity.ok(researchPaperService.getPapers(request, userPrincipal));
  }

  @GetMapping("/{id}")
  public ResponseEntity<PaperResponse> getPaperById(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {
    log.debug("api/papers/{} endpoint hit", id);

    return ResponseEntity.ok(researchPaperService.getPaperById(id, userPrincipal));
  }

  @GetMapping("/{id}/my-request")
  public ResponseEntity<PaperRequestStatusResponse> getUserRequestForPaper(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {
    log.debug("api/papers/{}/my-request endpoint hit", id);

    PaperRequestStatusResponse response =
        researchPaperService.getUserRequestForPaper(id, userPrincipal);
    return ResponseEntity.ok(response);
  }
}
