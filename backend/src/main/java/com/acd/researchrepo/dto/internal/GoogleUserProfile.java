package com.acd.researchrepo.dto.internal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GoogleUserProfile {
  private String email;
  private String name;
  private String googleId;
  private String profilePictureUrl;
}
