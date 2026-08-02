package com.acd.researchrepo.dto.external.departments;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DepartmentDetailResponse {
  private Integer departmentId;
  private String departmentName;
  private String slug;
  private Long paperCount;
  private Long userCount;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
