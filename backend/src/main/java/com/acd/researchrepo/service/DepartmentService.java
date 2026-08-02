package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.external.common.PaginatedResponse;
import com.acd.researchrepo.dto.external.departments.DepartmentCreateRequest;
import com.acd.researchrepo.dto.external.departments.DepartmentDetailResponse;
import com.acd.researchrepo.dto.external.departments.DepartmentResponse;
import com.acd.researchrepo.dto.external.departments.DepartmentUpdateRequest;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.mapper.DepartmentMapper;
import com.acd.researchrepo.model.Department;
import com.acd.researchrepo.repository.DepartmentRepository;
import com.acd.researchrepo.repository.ResearchPaperRepository;
import com.acd.researchrepo.repository.UserRepository;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.util.RoleBasedAccess;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

/**
 * Manages departments — available (filter) listing for all users, and full CRUD for SUPER_ADMINs.
 */
@Service
public class DepartmentService {

  private final DepartmentRepository departmentRepository;
  private final DepartmentMapper departmentMapper;
  private final ResearchPaperRepository researchPaperRepository;
  private final UserRepository userRepository;

  public DepartmentService(
      DepartmentRepository departmentRepository,
      ResearchPaperRepository researchPaperRepository,
      DepartmentMapper departmentMapper,
      UserRepository userRepository) {
    this.departmentRepository = departmentRepository;
    this.researchPaperRepository = researchPaperRepository;
    this.departmentMapper = departmentMapper;
    this.userRepository = userRepository;
  }

  /**
   * Retrieves a list of departments that have at least one associated research paper.
   *
   * @param user the authenticated user requesting the departments
   * @return a list of DepartmentResponse objects
   */
  public List<DepartmentResponse> getAvailableDepartments(CustomUserPrincipal user) {
    List<Department> departments;

    departments = departmentRepository.findAll();

    // Only include departments that have at least one paper in scope
    Set<Integer> deptHasPaper = new HashSet<>(researchPaperRepository.findDistinctDepartmentIds());

    List<DepartmentResponse> departmentDto =
        departments.stream()
            .filter(deps -> deptHasPaper.contains(deps.getDepartmentId()))
            .sorted(Comparator.comparing(Department::getDepartmentName))
            .map(department -> departmentMapper.toDto(department))
            .collect(Collectors.toList());

    return departmentDto;
  }

  public PaginatedResponse<DepartmentDetailResponse> getAdminDepartments(
      int page, int size, CustomUserPrincipal principal) {
    requireSuperAdmin(principal);

    Page<Department> departments =
        departmentRepository.findAll(
            PageRequest.of(page, size, Sort.by("departmentName").ascending()));

    List<Integer> ids = departments.getContent().stream().map(Department::getDepartmentId).toList();

    Map<Integer, Long> paperCounts =
        toDepartmentCountMap(researchPaperRepository.countByDepartmentIds(ids));
    Map<Integer, Long> userCounts = toDepartmentCountMap(userRepository.countByDepartmentIds(ids));

    return PaginatedResponse.fromPage(
        departments,
        dept ->
            departmentMapper.toAdminDto(
                dept,
                paperCounts.getOrDefault(dept.getDepartmentId(), 0L),
                userCounts.getOrDefault(dept.getDepartmentId(), 0L)));
  }

  public DepartmentDetailResponse createDepartment(
      DepartmentCreateRequest request, CustomUserPrincipal principal) {
    requireSuperAdmin(principal);
    if (departmentRepository.existsByDepartmentName(request.getDepartmentName().trim())) {
      throw new ApiException(ErrorCode.DUPLICATE_REQUEST, "Department name already exists");
    }
    Department department = new Department();
    department.setDepartmentName(request.getDepartmentName().trim());
    Department saved = departmentRepository.save(department);
    return departmentMapper.toAdminDto(
        saved,
        researchPaperRepository.countByDepartmentDepartmentId(saved.getDepartmentId()),
        userRepository.countByDepartmentDepartmentId(saved.getDepartmentId()));
  }

  public DepartmentDetailResponse updateDepartment(
      Integer id, DepartmentUpdateRequest request, CustomUserPrincipal principal) {
    requireSuperAdmin(principal);
    Department department =
        departmentRepository
            .findById(id)
            .orElseThrow(
                () -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Department not found"));
    if (!department.getDepartmentName().equals(request.getDepartmentName().trim())
        && departmentRepository.existsByDepartmentName(request.getDepartmentName().trim())) {
      throw new ApiException(ErrorCode.DUPLICATE_REQUEST, "Department name already exists");
    }
    department.setDepartmentName(request.getDepartmentName().trim());
    Department saved = departmentRepository.save(department);
    return departmentMapper.toAdminDto(
        saved,
        researchPaperRepository.countByDepartmentDepartmentId(saved.getDepartmentId()),
        userRepository.countByDepartmentDepartmentId(saved.getDepartmentId()));
  }

  /**
   * Deletes a department. Fails if any research papers or users are still linked to it.
   */
  public void deleteDepartment(Integer id, CustomUserPrincipal principal) {
    requireSuperAdmin(principal);
    Department department =
        departmentRepository
            .findById(id)
            .orElseThrow(
                () -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Department not found"));
    boolean hasPapers = researchPaperRepository.existsByDepartmentDepartmentId(id);
    boolean hasUsers = userRepository.existsByDepartmentDepartmentId(id);
    if (hasPapers || hasUsers) {
      throw new ApiException(
          ErrorCode.INVALID_REQUEST,
          "Cannot delete department with linked papers or users. Remove all linked papers and users"
              + " first.");
    }
    departmentRepository.delete(department);
  }

  private static Map<Integer, Long> toDepartmentCountMap(List<Object[]> rows) {
    Map<Integer, Long> map = new HashMap<>();
    for (Object[] row : rows) {
      map.put((Integer) row[0], (Long) row[1]);
    }
    return map;
  }

  private void requireSuperAdmin(CustomUserPrincipal principal) {
    if (!RoleBasedAccess.isUserSuperAdmin(principal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Access denied");
    }
  }
}
