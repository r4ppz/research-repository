package com.acd.researchrepo.dto.external.departments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Getter
@Builder
@Jacksonized
public class DepartmentCreateRequest {
  @NotBlank(message = "Department name is required")
  @Size(max = 64, message = "Department name must be at most 64 characters")
  private String departmentName;
}
