package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.model.UserDocumentRequestDto;
import com.acd.researchrepo.dto.external.model.UserDto;
import com.acd.researchrepo.dto.external.papers.PaginatedResponse;
import com.acd.researchrepo.dto.external.requests.DocumentRequestSearchRequest;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.mapper.UserMapper;
import com.acd.researchrepo.repository.UserRepository;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.DocumentRequestService;
import com.acd.researchrepo.util.RoleBasedAccess;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/users")
public class UsersController {

  private final UserMapper userMapper;
  private final UserRepository userRepository;
  private final DocumentRequestService documentRequestService;

  public UsersController(
      UserMapper userMapper,
      UserRepository userRepository,
      DocumentRequestService documentRequestService) {
    this.userMapper = userMapper;
    this.userRepository = userRepository;
    this.documentRequestService = documentRequestService;
  }

  @GetMapping("/me")
  public ResponseEntity<UserDto> getCurrentUser(
      @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("api/users/me endpoint hit");

    UserDto userDto =
        userRepository
            .findById(principal.getUserId())
            .map(userMapper::toDto)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
    return ResponseEntity.ok(userDto);
  }

  @GetMapping("/me/requests")
  public ResponseEntity<PaginatedResponse<UserDocumentRequestDto>> getUserRequests(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @Valid DocumentRequestSearchRequest request) {
    log.debug("api/users/me/requests endpoint hit");

    if (!RoleBasedAccess.isUserStudentOrFaculty(principal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Access denied");
    }

    return ResponseEntity.ok(documentRequestService.getUserDocumentRequests(principal, request));
  }
}
