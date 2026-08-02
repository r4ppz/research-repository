package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.internal.AuthTokens;
import com.acd.researchrepo.dto.internal.GoogleUserProfile;
import com.acd.researchrepo.dto.internal.TokenRefreshResult;
import com.acd.researchrepo.environment.AppProperties;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.mapper.UserMapper;
import com.acd.researchrepo.model.RefreshToken;
import com.acd.researchrepo.model.User;
import com.acd.researchrepo.repository.RefreshTokenRepository;
import com.acd.researchrepo.security.JwtTokenProvider;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class AuthService {

  private final int refreshTokenMaxAge;

  private final RefreshTokenRepository refreshTokenRepository;
  private final JwtTokenProvider jwtTokenProvider;
  private final GoogleOAuthService googleAuthService;
  private final UserMapper userMapper;
  private final UserService userService;
  private final AppProperties appProperties;

  public AuthService(
      RefreshTokenRepository refreshTokenRepository,
      JwtTokenProvider jwtTokenProvider,
      GoogleOAuthService googleAuthService,
      UserMapper userMapper,
      UserService userService,
      AppProperties appProperties) {
    this.refreshTokenRepository = refreshTokenRepository;
    this.jwtTokenProvider = jwtTokenProvider;
    this.googleAuthService = googleAuthService;
    this.userMapper = userMapper;
    this.userService = userService;
    this.appProperties = appProperties;

    this.refreshTokenMaxAge = this.appProperties.getToken().getRefreshTokenMaxAge();
  }

  /**
   * Authenticates a user using a Google authorization code. Validates the code, retrieves or
   * creates the user, generates new tokens, and returns authentication data.
   *
   * @param googleAuthCode the Google authorization code to validate
   * @return a {@link AuthTokens} containing access token, refresh token, and user info
   */
  @Transactional
  public AuthTokens authenticateWithGoogle(String googleAuthCode) {
    GoogleUserProfile googleUserInfo = googleAuthService.validateCodeAndGetUserInfo(googleAuthCode);

    User user = userService.findOrCreateUser(googleUserInfo);
    RefreshToken newRefresh = createRefreshToken(user);
    String accessToken = jwtTokenProvider.generateAccessToken(user);

    return AuthTokens.builder()
        .accessToken(accessToken)
        .refreshToken(newRefresh.getToken())
        .user(userMapper.toDto(user))
        .build();
  }

  /**
   * Refreshes the access token using the provided refresh token value.
   *
   * <p>Validates the refresh token, deletes the old token, issues a new refresh token, and
   * generates a new access token for the associated user.
   *
   * @param refreshTokenValue the value of the refresh token to use for refreshing
   * @return a {@link TokenRefreshResult} containing the new access and refresh tokens
   * @throws ApiException if the refresh token is revoked or expired
   */
  @Transactional
  public TokenRefreshResult refreshAccessToken(String refreshTokenValue) {
    LocalDateTime now = LocalDateTime.now();

    RefreshToken oldToken =
        refreshTokenRepository
            .findByToken(refreshTokenValue)
            .orElseThrow(() -> new ApiException(ErrorCode.REFRESH_TOKEN_REVOKED));

    if (oldToken.getExpiresAt().isBefore(now)) {
      refreshTokenRepository.delete(oldToken);
      throw new ApiException(ErrorCode.REFRESH_TOKEN_REVOKED);
    }

    User user = oldToken.getUser();
    refreshTokenRepository.delete(oldToken);

    RefreshToken newToken = createRefreshToken(user);
    String newAccessToken = jwtTokenProvider.generateAccessToken(user);

    return TokenRefreshResult.builder()
        .accessToken(newAccessToken)
        .refreshToken(newToken.getToken())
        .build();
  }

  /**
   * Revokes (deletes) the refresh token if it exists in the repository.
   *
   * @param refreshTokenValue the value of the refresh token to revoke
   */
  @Transactional
  public void revokeRefreshToken(String refreshTokenValue) {
    refreshTokenRepository.findByToken(refreshTokenValue).ifPresent(refreshTokenRepository::delete);
  }

  /**
   * Creates and saves a new refresh token for the specified user. Deletes any existing refresh
   * tokens for the user before creating a new one.
   *
   * @param user the user for whom the refresh token is created
   * @return the newly created and saved {@link RefreshToken}
   */
  @Transactional
  private RefreshToken createRefreshToken(User user) {
    LocalDateTime now = LocalDateTime.now();

    refreshTokenRepository.deleteByUserId(user.getUserId());

    RefreshToken token = new RefreshToken();
    token.setUser(user);
    token.setToken(UUID.randomUUID().toString());
    token.setCreatedAt(now);
    token.setExpiresAt(now.plusSeconds(refreshTokenMaxAge));

    return refreshTokenRepository.save(token);
  }
}
