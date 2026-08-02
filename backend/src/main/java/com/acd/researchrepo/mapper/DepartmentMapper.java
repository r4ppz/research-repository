package com.acd.researchrepo.mapper;

import com.acd.researchrepo.dto.external.departments.DepartmentDetailResponse;
import com.acd.researchrepo.dto.external.departments.DepartmentResponse;
import com.acd.researchrepo.model.Department;
import org.springframework.stereotype.Component;

/** Maps {@link Department} entities to their API representations. */
@Component
public class DepartmentMapper {

  /**
   * Maps a department entity to a {@link DepartmentResponse}.
   *
   * @param department the department entity, or null
   * @return the mapped response, or null if the input is null
   */
  public DepartmentResponse toDto(Department department) {
    if (department == null) {
      return null;
    }

    return DepartmentResponse.builder()
        .departmentId(department.getDepartmentId())
        .departmentName(department.getDepartmentName())
        .slug(department.getSlug())
        .build();
  }

  /**
   * Maps a department entity to a {@link DepartmentDetailResponse} with paper and user counts.
   *
   * @param department the department entity
   * @param paperCount the number of papers in the department
   * @param userCount the number of users in the department
   * @return the mapped admin response
   */
  public DepartmentDetailResponse toAdminDto(
      Department department, long paperCount, long userCount) {
    return DepartmentDetailResponse.builder()
        .departmentId(department.getDepartmentId())
        .departmentName(department.getDepartmentName())
        .slug(department.getSlug())
        .paperCount(paperCount)
        .userCount(userCount)
        .createdAt(department.getCreatedAt())
        .updatedAt(department.getUpdatedAt())
        .build();
  }
}
