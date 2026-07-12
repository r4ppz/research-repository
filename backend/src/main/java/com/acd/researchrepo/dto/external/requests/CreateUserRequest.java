package com.acd.researchrepo.dto.external.requests;

import com.acd.researchrepo.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateUserRequest {
  @NotBlank @Email private String email;
  @NotNull private UserRole role;
  private Integer departmentId;
}
