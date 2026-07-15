package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.external.model.UserDto;
import com.acd.researchrepo.dto.external.papers.PaginatedResponse;
import com.acd.researchrepo.dto.external.requests.ChangeRoleRequest;
import com.acd.researchrepo.dto.external.requests.CreateUserRequest;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.mapper.UserMapper;
import com.acd.researchrepo.model.Department;
import com.acd.researchrepo.model.RoleChangeLog;
import com.acd.researchrepo.model.User;
import com.acd.researchrepo.model.UserRole;
import com.acd.researchrepo.repository.DepartmentRepository;
import com.acd.researchrepo.repository.RefreshTokenRepository;
import com.acd.researchrepo.repository.RoleChangeLogRepository;
import com.acd.researchrepo.repository.UserRepository;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.util.RoleBasedAccess;
import jakarta.transaction.Transactional;
import java.util.Arrays;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class AdminUserService {

  private final UserRepository userRepository;
  private final DepartmentRepository departmentRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final RoleChangeLogRepository roleChangeLogRepository;
  private final UserMapper userMapper;

  public AdminUserService(
      UserRepository userRepository,
      DepartmentRepository departmentRepository,
      RefreshTokenRepository refreshTokenRepository,
      RoleChangeLogRepository roleChangeLogRepository,
      UserMapper userMapper) {
    this.userRepository = userRepository;
    this.departmentRepository = departmentRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.roleChangeLogRepository = roleChangeLogRepository;
    this.userMapper = userMapper;
  }

  public PaginatedResponse<UserDto> listUsers(
      int page, int size, String search, CustomUserPrincipal principal) {
    requireSuperAdmin(principal);

    var pageable = PageRequest.of(page, size, Sort.by("userId").ascending());

    if (search != null && !search.trim().isEmpty()) {
      return PaginatedResponse.fromPage(
          userRepository.searchByEmailOrFullName(search, pageable), userMapper::toDto);
    }

    return PaginatedResponse.fromPage(userRepository.findAll(pageable), userMapper::toDto);
  }

  @Transactional
  public UserDto changeRole(
      Integer targetUserId, ChangeRoleRequest request, CustomUserPrincipal principal) {
    requireSuperAdmin(principal);

    if (Objects.equals(targetUserId, principal.getUserId())) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Cannot change your own role");
    }

    User targetUser =
        userRepository
            .findById(targetUserId)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

    UserRole oldRole = targetUser.getRole();
    UserRole newRole = request.getRole();
    Department newDepartment = null;

    if (UserRole.DEPARTMENT_ADMIN.equals(newRole)) {
      if (request.getDepartmentId() == null) {
        throw new ApiException(
            ErrorCode.VALIDATION_ERROR, "departmentId is required for DEPARTMENT_ADMIN role");
      }

      newDepartment =
          departmentRepository
              .findById(request.getDepartmentId())
              .orElseThrow(
                  () -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Department not found"));
    }

    boolean roleChanged = !oldRole.equals(newRole);
    boolean departmentChanged = !Objects.equals(targetUser.getDepartment(), newDepartment);
    if (!roleChanged && !departmentChanged) {
      return userMapper.toDto(targetUser);
    }

    targetUser.setRole(newRole);
    targetUser.setDepartment(newRole == UserRole.DEPARTMENT_ADMIN ? newDepartment : null);
    User savedUser = userRepository.save(targetUser);

    roleChangeLogRepository.save(
        RoleChangeLog.builder()
            .targetUserId(targetUserId)
            .changedByUserId(principal.getUserId())
            .oldRole(oldRole.name())
            .newRole(newRole.name())
            .build());

    refreshTokenRepository.deleteByUserId(targetUserId);

    return userMapper.toDto(savedUser);
  }

  @Transactional
  public UserDto createUser(CreateUserRequest request, CustomUserPrincipal principal) {
    requireSuperAdmin(principal);

    String email = request.getEmail().toLowerCase().trim();
    if (userRepository.findByEmail(email).isPresent()) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, "A user with this email already exists");
    }

    Department department = null;
    if (UserRole.DEPARTMENT_ADMIN.equals(request.getRole())) {
      if (request.getDepartmentId() == null) {
        throw new ApiException(
            ErrorCode.VALIDATION_ERROR, "departmentId is required for DEPARTMENT_ADMIN role");
      }
      department =
          departmentRepository
              .findById(request.getDepartmentId())
              .orElseThrow(
                  () -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Department not found"));
    }

    User user =
        User.builder()
            .email(email)
            .fullName(deriveNameFromEmail(email))
            .role(request.getRole())
            .department(department)
            .build();

    return userMapper.toDto(userRepository.save(user));
  }

  private static String deriveNameFromEmail(String email) {
    String localPart = email.substring(0, email.indexOf('@'));
    String name = localPart.replaceAll("[._-]", " ");
    return Arrays.stream(name.split(" "))
        .map(
            word -> word.isEmpty() ? "" : Character.toUpperCase(word.charAt(0)) + word.substring(1))
        .collect(Collectors.joining(" "));
  }

  private void requireSuperAdmin(CustomUserPrincipal principal) {
    if (!RoleBasedAccess.isUserSuperAdmin(principal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Access denied");
    }
  }
}
