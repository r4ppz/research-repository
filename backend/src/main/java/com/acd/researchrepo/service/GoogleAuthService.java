package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.internal.GoogleUserInfo;
import com.acd.researchrepo.environment.AppProperties;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Handles Google OAuth2 authorization code exchange, ID token verification, and domain
 * restriction enforcement. In production, only {@code @acdeducation.com} emails are allowed.
 */
@Service
public class GoogleAuthService {

  private final String environment;
  private final String googleClientId;
  private final String googleClientSecret;
  private final String redirectUri;

  private final GoogleAuthorizationCodeFlow authorizationFlow;
  private final GoogleIdTokenVerifier idTokenVerifier;
  private final AppProperties appProperties;

  public GoogleAuthService(
      AppProperties appProperties, @Value("${spring.profiles.active}") String environment) {

    this.environment = environment;
    this.appProperties = appProperties;
    this.googleClientId = this.appProperties.getGoogle().getClientId();
    this.googleClientSecret = this.appProperties.getGoogle().getClientSecret();
    this.redirectUri = this.appProperties.getGoogle().getRedirectUri();

    NetHttpTransport transport = new NetHttpTransport();
    GsonFactory jsonFactory = new GsonFactory();

    this.authorizationFlow =
        new GoogleAuthorizationCodeFlow.Builder(
                transport,
                jsonFactory,
                googleClientId,
                googleClientSecret,
                Arrays.asList("openid", "email", "profile"))
            .setAccessType("offline")
            .build();

    this.idTokenVerifier =
        new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
            .setAudience(Collections.singletonList(googleClientId))
            .build();
  }

  /**
   * Exchanges a Google authorization code for a token, verifies the ID token, and extracts user
   * profile data. Enforces email domain restrictions based on the active environment profile.
   */
  public GoogleUserInfo validateCodeAndGetUserInfo(String authorizationCode) {
    GoogleTokenResponse tokenResponse = exchangeAuthorizationCode(authorizationCode);
    GoogleIdToken.Payload payload = verifyAndExtractPayload(tokenResponse.getIdToken());

    String email = getVerifiedEmail(payload);

    enforceDomainRestrictions(email);

    return GoogleUserInfo.builder()
        .email(email)
        .name((String) payload.get("name"))
        .googleId(payload.getSubject())
        .profilePictureUrl((String) payload.get("picture"))
        .build();
  }

  private GoogleTokenResponse exchangeAuthorizationCode(String code) {
    try {
      return authorizationFlow.newTokenRequest(code).setRedirectUri(redirectUri).execute();
    } catch (IOException e) {
      throw new ApiException(
          ErrorCode.INVALID_TOKEN, "Failed to exchange Google authorization code");
    }
  }

  private GoogleIdToken.Payload verifyAndExtractPayload(String idTokenString) {
    if (idTokenString == null) {
      throw new ApiException(ErrorCode.INVALID_TOKEN, "ID token missing from Google response");
    }

    GoogleIdToken idToken;
    try {
      idToken = idTokenVerifier.verify(idTokenString);
    } catch (GeneralSecurityException | IOException e) {
      throw new ApiException(ErrorCode.INVALID_TOKEN, "Failed to verify Google ID token");
    }

    if (idToken == null) {
      throw new ApiException(ErrorCode.INVALID_TOKEN, "Invalid Google ID token");
    }

    return idToken.getPayload();
  }

  /**
   * Restricts login to specific email domains: production requires {@code @acdeducation.com};
   * development requires any {@code .com} address.
   */
  private void enforceDomainRestrictions(String email) {
    if ("prod".equalsIgnoreCase(environment)) {
      if (!email.endsWith("acdeducation.com")) {
        throw new ApiException(
            ErrorCode.DOMAIN_NOT_ALLOWED, "Email domain must be @acdeducation.com");
      }
    } else {
      if (!email.endsWith(".com")) {
        throw new ApiException(
            ErrorCode.DOMAIN_NOT_ALLOWED, "Development mode only allows .com emails");
      }
    }
  }

  private String getVerifiedEmail(GoogleIdToken.Payload payload) {
    if (!payload.getEmailVerified()) {
      throw new ApiException(ErrorCode.INVALID_TOKEN, "Google email is not verified");
    }
    String email = payload.getEmail();
    if (email == null) {
      throw new ApiException(ErrorCode.INVALID_TOKEN, "Google email is null");
    }
    return email;
  }
}
