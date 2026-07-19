package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.common.PaginationRequest;
import com.acd.researchrepo.dto.external.departments.AdminDepartmentDto;
import com.acd.researchrepo.dto.external.departments.DepartmentCreateRequest;
import com.acd.researchrepo.dto.external.departments.DepartmentUpdateRequest;
import com.acd.researchrepo.dto.external.papers.PaginatedResponse;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * SuperAdmin CRUD for departments. Prevents deletion of departments that still have linked
 * users or research papers.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/departments")
public class AdminDepartmentController {

  private final DepartmentService departmentService;

  public AdminDepartmentController(DepartmentService departmentService) {
    this.departmentService = departmentService;
  }

  @GetMapping
  public ResponseEntity<PaginatedResponse<AdminDepartmentDto>> getDepartments(
      @Valid PaginationRequest pagination, @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("GET /api/admin/departments endpoint hit");
    return ResponseEntity.ok(
        departmentService.getAdminDepartments(
            pagination.getPage(), pagination.getSize(), principal));
  }

  @PostMapping
  public ResponseEntity<AdminDepartmentDto> createDepartment(
      @Valid @RequestBody DepartmentCreateRequest request,
      @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("POST /api/admin/departments endpoint hit");
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(departmentService.createDepartment(request, principal));
  }

  @PutMapping("/{id}")
  public ResponseEntity<AdminDepartmentDto> updateDepartment(
      @PathVariable Integer id,
      @Valid @RequestBody DepartmentUpdateRequest request,
      @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("PUT /api/admin/departments/{} endpoint hit", id);
    return ResponseEntity.ok(departmentService.updateDepartment(id, request, principal));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteDepartment(
      @PathVariable Integer id, @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("DELETE /api/admin/departments/{} endpoint hit", id);
    departmentService.deleteDepartment(id, principal);
    return ResponseEntity.noContent().build();
  }
}
