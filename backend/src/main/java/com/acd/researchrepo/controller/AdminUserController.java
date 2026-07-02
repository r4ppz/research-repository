package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.model.UserDto;
import com.acd.researchrepo.dto.external.papers.PaginatedResponse;
import com.acd.researchrepo.dto.external.requests.ChangeRoleRequest;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

  private final AdminUserService adminUserService;

  public AdminUserController(AdminUserService adminUserService) {
    this.adminUserService = adminUserService;
  }

  @GetMapping
  public ResponseEntity<PaginatedResponse<UserDto>> getUsers(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("GET /api/admin/users endpoint hit");

    return ResponseEntity.ok(adminUserService.listUsers(page, size, principal));
  }

  @PutMapping("/{id}/role")
  public ResponseEntity<UserDto> changeUserRole(
      @PathVariable("id") Integer targetUserId,
      @Valid @RequestBody ChangeRoleRequest request,
      @AuthenticationPrincipal CustomUserPrincipal principal) {

    log.debug("PUT /api/admin/users/{}/role endpoint hit", targetUserId);

    return ResponseEntity.ok(adminUserService.changeRole(targetUserId, request, principal));
  }
}