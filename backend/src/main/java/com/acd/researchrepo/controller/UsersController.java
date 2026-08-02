package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.common.PaginatedResponse;
import com.acd.researchrepo.dto.external.requests.DocumentRequestSearchRequest;
import com.acd.researchrepo.dto.external.users.UserRequestSummary;
import com.acd.researchrepo.dto.external.users.UserResponse;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.DocumentRequestService;
import com.acd.researchrepo.service.UserService;
import com.acd.researchrepo.util.RoleBasedAccess;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints for the currently authenticated user to view their profile and document requests.
 * Restricted to students and faculty for request-related endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
public class UsersController {

  private final UserService userService;
  private final DocumentRequestService documentRequestService;

  public UsersController(UserService userService, DocumentRequestService documentRequestService) {
    this.userService = userService;
    this.documentRequestService = documentRequestService;
  }

  @GetMapping("/me")
  public ResponseEntity<UserResponse> getCurrentUser(
      @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("api/users/me endpoint hit");

    return ResponseEntity.ok(userService.getUserById(principal.getUserId()));
  }

  @GetMapping("/me/requests")
  public ResponseEntity<PaginatedResponse<UserRequestSummary>> getUserRequests(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @Valid DocumentRequestSearchRequest request) {
    log.debug("api/users/me/requests endpoint hit");

    if (!RoleBasedAccess.isUserStudentOrFaculty(principal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Access denied");
    }

    return ResponseEntity.ok(documentRequestService.getUserDocumentRequests(principal, request));
  }
}
