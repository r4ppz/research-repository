package com.acd.researchrepo.mapper;

import com.acd.researchrepo.dto.external.departments.DepartmentDetailResponse;
import com.acd.researchrepo.dto.external.departments.DepartmentResponse;
import com.acd.researchrepo.model.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {

  public DepartmentResponse toDto(Department department) {
    if (department == null) {
      return null;
    }

    return DepartmentResponse.builder()
        .departmentId(department.getDepartmentId())
        .departmentName(department.getDepartmentName())
        .build();
  }

  public DepartmentDetailResponse toAdminDto(
      Department department, long paperCount, long userCount) {
    return DepartmentDetailResponse.builder()
        .departmentId(department.getDepartmentId())
        .departmentName(department.getDepartmentName())
        .paperCount(paperCount)
        .userCount(userCount)
        .createdAt(department.getCreatedAt())
        .updatedAt(department.getUpdatedAt())
        .build();
  }
}
