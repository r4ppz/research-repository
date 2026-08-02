package com.acd.researchrepo.dto.internal;

import com.acd.researchrepo.dto.external.users.UserResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthTokens {
  private final String accessToken;
  private final String refreshToken;
  private final UserResponse user;
}
