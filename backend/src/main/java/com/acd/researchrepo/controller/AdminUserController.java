package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.common.PaginatedResponse;
import com.acd.researchrepo.dto.external.common.PaginationRequest;
import com.acd.researchrepo.dto.external.users.ChangeRoleRequest;
import com.acd.researchrepo.dto.external.users.CreateUserRequest;
import com.acd.researchrepo.dto.external.users.UserResponse;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * SuperAdmin user management — list, create users, and change roles. Role changes are logged
 * in {@link com.acd.researchrepo.model.RoleChangeLog} and revoke the target user's refresh
 * tokens.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

  private final AdminUserService adminUserService;

  public AdminUserController(AdminUserService adminUserService) {
    this.adminUserService = adminUserService;
  }

  @GetMapping
  public ResponseEntity<PaginatedResponse<UserResponse>> getUsers(
      @Valid PaginationRequest pagination,
      @RequestParam(required = false) String search,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("GET /api/admin/users endpoint hit");

    return ResponseEntity.ok(
        adminUserService.listUsers(pagination.getPage(), pagination.getSize(), search, principal));
  }

  @PostMapping
  public ResponseEntity<UserResponse> createUser(
      @Valid @RequestBody CreateUserRequest request,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("POST /api/admin/users endpoint hit");

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(adminUserService.createUser(request, principal));
  }

  @PutMapping("/{id}/role")
  public ResponseEntity<UserResponse> changeUserRole(
      @PathVariable("id") Integer targetUserId,
      @Valid @RequestBody ChangeRoleRequest request,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("PUT /api/admin/users/{}/role endpoint hit", targetUserId);

    return ResponseEntity.ok(adminUserService.changeRole(targetUserId, request, principal));
  }
}
