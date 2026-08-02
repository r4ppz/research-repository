package com.acd.researchrepo.dto.external.users;

import com.acd.researchrepo.dto.external.departments.DepartmentResponse;
import com.acd.researchrepo.model.UserRole;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Getter
@Builder
@Jacksonized
public class UserResponse {
  private final Integer userId;
  private final String email;
  private final String fullName;
  private final UserRole role;
  private final DepartmentResponse department;
  private final String profilePictureUrl;
  private final LocalDateTime createdAt;
}
