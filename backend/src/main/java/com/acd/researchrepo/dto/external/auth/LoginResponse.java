package com.acd.researchrepo.dto.external.auth;

import com.acd.researchrepo.dto.external.users.UserResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
  private final String accessToken;
  private final UserResponse user;
}
