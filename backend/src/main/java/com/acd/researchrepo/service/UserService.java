package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.internal.GoogleUserInfo;
import com.acd.researchrepo.environment.AppProperties;
import com.acd.researchrepo.model.User;
import com.acd.researchrepo.model.UserRole;
import com.acd.researchrepo.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;

/**
 * Handles user lookup and auto-provisioning via Google OAuth. The first user whose email matches
 * {@code app.initial-super-admin-email} is granted SUPER_ADMIN role on first login.
 */
@Service
public class UserService {

  private final AppProperties appProperties;
  private final UserRepository userRepository;

  public UserService(AppProperties appProperties, UserRepository userRepository) {
    this.appProperties = appProperties;
    this.userRepository = userRepository;
  }

  /**
   * Finds an existing user by email or creates a new one from Google profile data. Existing users
   * have their name and profile picture updated if changed. New users are assigned a role based on
   * the initial SUPER_ADMIN bootstrap email configuration.
   */
  @Transactional
  public User findOrCreateUser(GoogleUserInfo googleInfo) {
    String email = normalizeEmail(googleInfo.getEmail());

    Optional<User> existingUser = userRepository.findByEmail(email);

    if (existingUser.isPresent()) {
      User user = existingUser.get();
      boolean updated = updateUserIfChanged(user, googleInfo);
      if (updated) {
        userRepository.save(user);
      }
      return user;
    } else {
      UserRole assignedRole = determineInitialRole(email);
      User newUser =
          User.builder()
              .email(email)
              .fullName(googleInfo.getName())
              .profilePictureUrl(googleInfo.getProfilePictureUrl())
              .role(assignedRole)
              .build();
      return userRepository.save(newUser);
    }
  }

  private String normalizeEmail(String email) {
    return email.toLowerCase().trim();
  }

  private UserRole determineInitialRole(String email) {
    String bootstrapEmail = appProperties.getInitialSuperAdminEmail();
    if (bootstrapEmail != null
        && !bootstrapEmail.isBlank()
        && email.equals(bootstrapEmail.toLowerCase().trim())) {
      return UserRole.SUPER_ADMIN;
    }
    return UserRole.STUDENT;
  }

  private boolean updateUserIfChanged(User user, GoogleUserInfo googleInfo) {

    boolean changed = false;

    if (!user.getFullName().equals(googleInfo.getName())) {
      user.setFullName(googleInfo.getName());
      changed = true;
    }

    if (!Objects.equals(user.getProfilePictureUrl(), googleInfo.getProfilePictureUrl())) {
      user.setProfilePictureUrl(googleInfo.getProfilePictureUrl());
      changed = true;
    }

    return changed;
  }
}
