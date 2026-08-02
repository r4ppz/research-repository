package com.acd.researchrepo.dto.external.filters;

import com.acd.researchrepo.dto.external.departments.DepartmentResponse;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DepartmentListResponse {
  private List<DepartmentResponse> departments;
}
