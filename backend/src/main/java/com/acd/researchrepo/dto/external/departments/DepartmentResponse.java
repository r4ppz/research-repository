package com.acd.researchrepo.dto.external.departments;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Getter
@Builder
@Jacksonized
public class DepartmentResponse {
  private final Integer departmentId;
  private final String departmentName;
  private final String slug;
}
