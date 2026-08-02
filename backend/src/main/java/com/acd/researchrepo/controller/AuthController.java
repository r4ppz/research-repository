package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.auth.GoogleLoginRequest;
import com.acd.researchrepo.dto.external.auth.LoginResponse;
import com.acd.researchrepo.dto.external.auth.RefreshResponse;
import com.acd.researchrepo.dto.internal.AuthTokens;
import com.acd.researchrepo.dto.internal.TokenRefreshResult;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.security.AuthCookieHandler;
import com.acd.researchrepo.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Handles Google OAuth2 authentication, token refresh, and logout. All endpoints are public
 * (no JWT required) — authentication is performed via Google authorization code.
 */
@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

  private final AuthService authService;
  private final AuthCookieHandler authCookieHandler;

  public AuthController(AuthService authService, AuthCookieHandler authCookieHandler) {
    this.authService = authService;
    this.authCookieHandler = authCookieHandler;
  }

  @PostMapping("/google")
  public ResponseEntity<LoginResponse> loginWithGoogle(
      @Valid @RequestBody GoogleLoginRequest request, HttpServletResponse response) {
    log.debug("api/auth/google endpoint hit");

    AuthTokens tokens = authService.authenticateWithGoogle(request.getCode());
    LoginResponse authResponse =
        LoginResponse.builder().accessToken(tokens.getAccessToken()).user(tokens.getUser()).build();

    authCookieHandler.setRefreshTokenCookie(response, tokens.getRefreshToken());
    return ResponseEntity.ok(authResponse);
  }

  @PostMapping("/refresh")
  public ResponseEntity<RefreshResponse> refreshAccessToken(
      HttpServletRequest request, HttpServletResponse response) {
    log.debug("api/auth/refresh endpoint hit");

    String refreshToken = authCookieHandler.extractRefreshTokenFromCookie(request);
    if (refreshToken == null) {
      throw new ApiException(ErrorCode.REFRESH_TOKEN_REVOKED);
    }

    try {
      TokenRefreshResult result = authService.refreshAccessToken(refreshToken);
      authCookieHandler.setRefreshTokenCookie(response, result.getRefreshToken());

      RefreshResponse refreshResponse =
          RefreshResponse.builder().accessToken(result.getAccessToken()).build();

      return ResponseEntity.ok(refreshResponse);
    } catch (RuntimeException e) {
      authCookieHandler.clearRefreshTokenCookie(response);
      throw new ApiException(ErrorCode.REFRESH_TOKEN_REVOKED);
    }
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
    log.debug("api/auth/logout endpoint hit");

    String refreshToken = authCookieHandler.extractRefreshTokenFromCookie(request);
    if (refreshToken != null) {
      authService.revokeRefreshToken(refreshToken);
    }
    authCookieHandler.clearRefreshTokenCookie(response);
    return ResponseEntity.noContent().build();
  }
}
