package com.acd.researchrepo.mapper;

import com.acd.researchrepo.dto.external.users.UserResponse;
import com.acd.researchrepo.model.User;
import com.acd.researchrepo.model.UserRole;
import org.springframework.stereotype.Component;

/** Maps {@link User} entities to their API representations. */
@Component
public class UserMapper {

  private final DepartmentMapper departmentMapper;

  public UserMapper(DepartmentMapper departmentMapper) {
    this.departmentMapper = departmentMapper;
  }

  /**
   * Maps a user entity to a {@link UserResponse}, including the department for DEPARTMENT_ADMINs.
   *
   * @param user the user entity, or null
   * @return the mapped response, or null if the input is null
   */
  public UserResponse toDto(User user) {
    if (user == null) {
      return null;
    }

    UserResponse.UserResponseBuilder builder =
        UserResponse.builder()
            .userId(user.getUserId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole())
            .profilePictureUrl(user.getProfilePictureUrl())
            .createdAt(user.getCreatedAt());

    // If its a DEPARTMENT_ADMIN include its department, if its not then dont
    if (UserRole.DEPARTMENT_ADMIN.equals(user.getRole()) && user.getDepartment() != null) {
      builder.department(departmentMapper.toDto(user.getDepartment()));
    }

    return builder.build();
  }
}
