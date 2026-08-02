package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.departments.DepartmentResponse;
import com.acd.researchrepo.dto.external.filters.DepartmentListResponse;
import com.acd.researchrepo.dto.external.filters.YearListResponse;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.DepartmentService;
import com.acd.researchrepo.service.ResearchPaperService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Provides filter options (years and departments) for the paper browsing UI. Only departments
 * with at least one research paper are returned.
 */
@Slf4j
@RestController
@RequestMapping("/api/filters")
public class FilterController {

  private final DepartmentService departmentService;
  private final ResearchPaperService researchPaperService;

  public FilterController(
      DepartmentService departmentService, ResearchPaperService researchPaperService) {
    this.departmentService = departmentService;
    this.researchPaperService = researchPaperService;
  }

  @GetMapping("/years")
  public ResponseEntity<YearListResponse> getAvailableYears(
      @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {
    log.debug("api/filters/years endpoint hit");

    List<Integer> years = researchPaperService.getAvailableYears(userPrincipal);

    return years.isEmpty()
        ? ResponseEntity.noContent().build()
        : ResponseEntity.ok(YearListResponse.builder().years(years).build());
  }

  @GetMapping("/departments")
  public ResponseEntity<DepartmentListResponse> getDepartments(
      @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {
    log.debug("api/filters/departments endpoint hit");

    List<DepartmentResponse> departments = departmentService.getAvailableDepartments(userPrincipal);

    return departments.isEmpty()
        ? ResponseEntity.noContent().build()
        : ResponseEntity.ok(DepartmentListResponse.builder().departments(departments).build());
  }
}
