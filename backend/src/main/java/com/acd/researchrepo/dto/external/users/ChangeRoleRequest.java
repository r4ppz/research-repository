package com.acd.researchrepo.dto.external.users;

import com.acd.researchrepo.model.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeRoleRequest {
  @NotNull private UserRole role;
  private Integer departmentId;
}
