package com.acd.researchrepo.controller;

import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.ResearchPaperService;
import io.swagger.v3.oas.annotations.Operation;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves research paper file downloads. Supports both download (attachment) and in-browser
 * preview (inline). Access is guarded by download permission checks in {@link
 * com.acd.researchrepo.service.ResearchPaperService}.
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

  private final ResearchPaperService researchPaperService;

  public FileController(ResearchPaperService researchPaperService) {
    this.researchPaperService = researchPaperService;
  }

  /**
   * Streams a research paper file as an attachment (download) or inline (browser preview), after
   * verifying download access.
   *
   * @param paperId the ID of the paper
   * @param view if true, serve inline; otherwise force download
   * @param userPrincipal the requesting user
   * @return the file resource with content disposition
   */
  @GetMapping("/{paperId}")
  @Operation(summary = "Download or view a research paper file")
  public ResponseEntity<Resource> downloadFile(
      @PathVariable Integer paperId,
      @RequestParam(defaultValue = "false") boolean view,
      @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {

    String filename = researchPaperService.getPaperFileName(paperId, userPrincipal);
    Resource resource = researchPaperService.downloadPaper(paperId, userPrincipal);

    String contentType = determineContentType(filename);
    ContentDisposition disposition =
        ContentDisposition.builder(view ? "inline" : "attachment")
            .filename(filename, StandardCharsets.UTF_8)
            .build();

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
        .body(resource);
  }

  private String determineContentType(String filename) {
    String lower = filename.toLowerCase();
    if (lower.endsWith(".pdf")) {
      return "application/pdf";
    } else if (lower.endsWith(".docx")) {
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    return "application/octet-stream";
  }
}
