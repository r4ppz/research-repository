package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.external.common.PaginatedResponse;
import com.acd.researchrepo.dto.external.papers.PaperCreateRequest;
import com.acd.researchrepo.dto.external.papers.PaperRequestStatusResponse;
import com.acd.researchrepo.dto.external.papers.PaperResponse;
import com.acd.researchrepo.dto.external.papers.PaperSearchRequest;
import com.acd.researchrepo.dto.external.papers.PaperUpdateRequest;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.mapper.ResearchPaperMapper;
import com.acd.researchrepo.model.Department;
import com.acd.researchrepo.model.DocumentRequest;
import com.acd.researchrepo.model.RequestStatus;
import com.acd.researchrepo.model.ResearchPaper;
import com.acd.researchrepo.model.ResearchPaperStatus;
import com.acd.researchrepo.repository.DepartmentRepository;
import com.acd.researchrepo.repository.DocumentRequestRepository;
import com.acd.researchrepo.repository.ResearchPaperRepository;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.spec.ResearchPaperSpec;
import com.acd.researchrepo.util.RoleBasedAccess;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Core service for research paper operations — browsing, admin management, file download, and
 * archival. Role-based access is enforced throughout: students only see non-archived papers,
 * DEPARTMENT_ADMINs are scoped to their department, and SUPER_ADMINs have full visibility.
 */
@Slf4j
@Service
public class ResearchPaperService {
  private final ResearchPaperRepository researchPaperRepository;
  private final DocumentRequestRepository documentRequestRepository;
  private final ResearchPaperMapper researchPaperMapper;
  private final DocumentRequestService documentRequestService;
  private final FileStorageService fileStorageService;
  private final DepartmentRepository departmentRepository;

  public ResearchPaperService(
      ResearchPaperRepository researchPaperRepository,
      DocumentRequestRepository documentRequestRepository,
      ResearchPaperMapper researchPaperMapper,
      DocumentRequestService documentRequestService,
      FileStorageService fileStorageService,
      DepartmentRepository departmentRepository) {
    this.researchPaperRepository = researchPaperRepository;
    this.documentRequestRepository = documentRequestRepository;
    this.researchPaperMapper = researchPaperMapper;
    this.documentRequestService = documentRequestService;
    this.fileStorageService = fileStorageService;
    this.departmentRepository = departmentRepository;
  }

  public PaginatedResponse<PaperResponse> getPapers(
      PaperSearchRequest request, CustomUserPrincipal userPrincipal) {

    Boolean archived = request.getArchived();
    if (!RoleBasedAccess.isUserAdmin(userPrincipal)) {
      archived = false;
    }

    Specification<ResearchPaper> spec =
        ResearchPaperSpec.build(
            request.getSearch(), request.getDepartmentId(), request.getYear(), archived);

    Page<ResearchPaper> paperPage = researchPaperRepository.findAll(spec, request.toPageable());

    return PaginatedResponse.fromPage(paperPage, researchPaperMapper::toDto);
  }

  /**
   * Retrieves paginated papers for the admin panel with role-based department scoping. {@code
   * DEPARTMENT_ADMIN} is forced to their own department (ignoring any {@code departmentId} filter);
   * {@code SUPER_ADMIN} can filter by any department or see all.
   */
  public PaginatedResponse<PaperResponse> getAdminPapers(
      PaperSearchRequest request, CustomUserPrincipal userPrincipal) {

    // Authorization check: must be admin
    if (!RoleBasedAccess.isUserAdmin(userPrincipal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Admin privileges required");
    }

    if (RoleBasedAccess.isUserDepartmentAdmin(userPrincipal) && request.getDepartmentId() != null) {
      throw new ApiException(
          ErrorCode.INVALID_REQUEST, "departmentId filter not permitted for your role");
    }

    // Determine department filtering based on role
    List<Integer> effectiveDepartmentIds = null;
    if (RoleBasedAccess.isUserDepartmentAdmin(userPrincipal)) {
      // Ignore departmentIds param, always scope to their department
      Integer userDeptId = userPrincipal.getDepartmentId();
      if (userDeptId == null) {
        throw new ApiException(
            ErrorCode.ACCESS_DENIED, "Department admin not assigned to a department");
      }
      effectiveDepartmentIds = List.of(userDeptId);
    } else {
      // For SuperAdmin use provided departmentIds (can be null for all departments)
      effectiveDepartmentIds = request.getDepartmentId();
    }

    Specification<ResearchPaper> spec =
        ResearchPaperSpec.buildAdmin(
            request.getSearch(),
            effectiveDepartmentIds,
            request.getYear(),
            request.getArchived(),
            request.getStatus());

    Page<ResearchPaper> paperPage = researchPaperRepository.findAll(spec, request.toPageable());

    return PaginatedResponse.fromPage(paperPage, researchPaperMapper::toDto);
  }

  public PaperResponse getPaperById(Integer id, CustomUserPrincipal userPrincipal) {
    Optional<ResearchPaper> paperOpt = researchPaperRepository.findById(id);

    if (paperOpt.isEmpty()) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found");
    }

    ResearchPaper paper = paperOpt.get();

    if (paper.getStatus() == ResearchPaperStatus.PENDING_REVIEW
        && !RoleBasedAccess.isUserAdmin(userPrincipal)
        && (paper.getUploadedBy() == null
            || !paper.getUploadedBy().getUserId().equals(userPrincipal.getUserId()))) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found");
    }

    if (paper.getStatus() == ResearchPaperStatus.REJECTED
        && !RoleBasedAccess.isUserAdmin(userPrincipal)) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found");
    }

    if (RoleBasedAccess.isUserStudent(userPrincipal) && paper.getArchived()) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found");
    }

    return researchPaperMapper.toDto(paper);
  }

  public List<Integer> getAvailableYears(CustomUserPrincipal user) {
    Integer deptId = RoleBasedAccess.isUserDepartmentAdmin(user) ? user.getDepartmentId() : null;
    boolean onlyActive = !RoleBasedAccess.isUserAdmin(user);
    return researchPaperRepository.findDistinctYears(deptId, onlyActive);
  }

  public PaperRequestStatusResponse getUserRequestForPaper(
      Integer paperId, CustomUserPrincipal userPrincipal) {
    return documentRequestService.getUserRequestForPaper(paperId, userPrincipal);
  }

  /**
   * Archives a research paper. As a side effect, all active (PENDING or ACCEPTED) document
   * requests for this paper are rejected with reason "Paper archived".
   *
   * @param id the ID of the paper to archive
   * @param principal the acting admin
   * @throws ApiException if unauthorized or the paper is not found
   */
  @Transactional
  public void archivePaper(Integer id, CustomUserPrincipal principal) {
    ResearchPaper paper = getAndVerifyAdminAccess(id, principal);

    paper.setArchived(true);
    paper.setArchivedAt(LocalDateTime.now());
    researchPaperRepository.save(paper);

    // side-effects: Reject all active requests
    List<DocumentRequest> activeRequests =
        documentRequestRepository.findByPaperPaperIdAndStatusIn(
            id, List.of(RequestStatus.PENDING, RequestStatus.ACCEPTED));

    for (DocumentRequest request : activeRequests) {
      request.setStatus(RequestStatus.REJECTED);
      request.setRejectionReason("Paper archived");
      documentRequestRepository.save(request);
    }
  }

  @Transactional
  public PaperResponse updatePaper(
      Integer id, PaperUpdateRequest metadata, CustomUserPrincipal principal) {

    ResearchPaper paper = getAndVerifyAdminAccess(id, principal);

    // Update basic fields
    paper.setTitle(metadata.getTitle());
    paper.setAuthorName(metadata.getAuthorName());
    paper.setAbstractText(metadata.getAbstractText());
    paper.setSubmissionDate(LocalDate.parse(metadata.getSubmissionDate()));

    // Update department if changed
    if (!paper.getDepartment().getDepartmentId().equals(metadata.getDepartmentId())) {
      // If DEPARTMENT_ADMIN, they can't change it to another department
      if (RoleBasedAccess.isUserDepartmentAdmin(principal)) {
        throw new ApiException(
            ErrorCode.ACCESS_DENIED, "You can only manage papers within your department");
      }

      var department =
          departmentRepository
              .findById(metadata.getDepartmentId())
              .orElseThrow(
                  () -> new ApiException(ErrorCode.VALIDATION_ERROR, "Department not found"));

      // Copy the physical file into the new department's folder so the storage path stays in
      // sync with the department. The old file is deleted only after the transaction commits, so
      // a rollback never leaves the database referencing a deleted file.
      String oldPath = paper.getFilePath();
      String newPath = relocateFilePath(oldPath, department);
      fileStorageService.moveFileAfterCommit(oldPath, newPath);
      paper.setFilePath(newPath);
      paper.setDepartment(department);
    }

    ResearchPaper savedPaper = researchPaperRepository.save(paper);
    return researchPaperMapper.toDto(savedPaper);
  }

  @Transactional
  public void deletePaper(Integer id, CustomUserPrincipal principal) {
    ResearchPaper paper = getAndVerifyAdminAccess(id, principal);
    String relativePath = paper.getFilePath();

    // Delete from database
    researchPaperRepository.delete(paper);

    // Delete physical file
    fileStorageService.deleteFile(relativePath);
  }

  @Transactional
  public void unarchivePaper(Integer id, CustomUserPrincipal principal) {
    ResearchPaper paper = getAndVerifyAdminAccess(id, principal);

    paper.setArchived(false);
    paper.setArchivedAt(null);
    researchPaperRepository.save(paper);
  }

  /**
   * Returns the filename (without path) of a research paper file, after verifying the caller has
   * download access.
   *
   * @param paperId the ID of the paper
   * @param principal the requesting user
   * @return the bare filename of the paper's stored file
   * @throws ApiException if unauthorized or the paper is not found
   */
  public String getPaperFileName(Integer paperId, CustomUserPrincipal principal) {
    ResearchPaper paper =
        researchPaperRepository
            .findById(paperId)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found"));

    validateDownloadAccess(paper, principal);

    if (paper.getOriginalFileName() != null) {
      return paper.getOriginalFileName();
    }

    String filePath = paper.getFilePath();
    return filePath.substring(filePath.lastIndexOf('/') + 1);
  }

  /**
   * Downloads the file for a research paper. Access is granted only if the caller has an accepted
   * document request (students/faculty), belongs to the paper's department (DEPARTMENT_ADMIN), or
   * is a SUPER_ADMIN.
   *
   * @param paperId the ID of the paper
   * @param principal the requesting user
   * @return the paper's file as a loadable {@link Resource}
   * @throws ApiException if unauthorized or the paper/file is not found
   */
  public Resource downloadPaper(Integer paperId, CustomUserPrincipal principal) {
    ResearchPaper paper =
        researchPaperRepository
            .findById(paperId)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found"));

    validateDownloadAccess(paper, principal);

    return fileStorageService.loadFile(paper.getFilePath());
  }

  /**
   * Creates a new research paper with an uploaded file. Files are stored under {@code
   * files/{department_slug}/{random_id}.{ext}}. DEPARTMENT_ADMINs can only create papers for
   * their own department.
   *
   * @param metadata the paper metadata
   * @param file the uploaded file
   * @param principal the acting admin
   * @return the created paper
   * @throws ApiException if unauthorized, the department is missing, or the file cannot be saved
   */
  @Transactional
  public PaperResponse createPaper(
      PaperCreateRequest metadata, MultipartFile file, CustomUserPrincipal principal) {

    // Authorization & Role-based validation
    if (!RoleBasedAccess.isUserAdmin(principal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Admin privileges required");
    }

    if (RoleBasedAccess.isUserDepartmentAdmin(principal)) {
      if (!principal.getDepartmentId().equals(metadata.getDepartmentId())) {
        throw new ApiException(
            ErrorCode.ACCESS_DENIED, "You can only manage papers within your department");
      }
    }

    // Validate department exists
    var department =
        departmentRepository
            .findById(metadata.getDepartmentId())
            .orElseThrow(
                () -> new ApiException(ErrorCode.VALIDATION_ERROR, "Department not found"));

    ResearchPaper paper = new ResearchPaper();
    paper.setTitle(metadata.getTitle());
    paper.setAuthorName(metadata.getAuthorName());
    paper.setAbstractText(metadata.getAbstractText());
    paper.setDepartment(department);
    LocalDate submissionDate = LocalDate.parse(metadata.getSubmissionDate());
    paper.setSubmissionDate(submissionDate);
    paper.setArchived(false);
    paper.setStatus(ResearchPaperStatus.ACTIVE);
    paper.setUploadedBy(principal.getUser());

    // We need a path. Pattern: files/{department_slug}/{random_id}.{ext}
    String relativePath = buildFilePath(department, file.getOriginalFilename());

    // Save file
    fileStorageService.saveFile(file, relativePath);

    // Update entity with path and save
    paper.setFilePath(relativePath);
    paper.setOriginalFileName(safeOriginalFileName(file.getOriginalFilename()));
    ResearchPaper savedPaper = researchPaperRepository.save(paper);

    return researchPaperMapper.toDto(savedPaper);
  }

  static String buildFilePath(Department department, String originalFilename) {
    byte[] bytes = new byte[8];
    new SecureRandom().nextBytes(bytes);
    return "files/"
        + department.getSlug()
        + "/"
        + HexFormat.of().formatHex(bytes)
        + safeExtension(originalFilename);
  }

  /**
   * Returns the storage path the given {@code oldPath} would have after the paper is moved to
   * {@code newDepartment}. The basename is preserved so only the department segment changes.
   */
  static String relocateFilePath(String oldPath, Department newDepartment) {
    String basename = oldPath.substring(oldPath.lastIndexOf('/') + 1);
    return "files/" + newDepartment.getSlug() + "/" + basename;
  }

  /** Returns a safe, allowlisted extension for the storage path — never derived from user input. */
  private static String safeExtension(String originalFilename) {
    String lower = originalFilename == null ? "" : originalFilename.toLowerCase();
    if (lower.endsWith(".doc")) {
      return ".doc";
    }
    if (lower.endsWith(".docx")) {
      return ".docx";
    }
    return ".pdf";
  }

  private static String safeOriginalFileName(String originalFilename) {
    return originalFilename != null && !originalFilename.isBlank()
        ? originalFilename
        : "untitled.pdf";
  }

  /**
   * Fetches a paper and verifies the caller has admin access to it. DEPARTMENT_ADMINs can only
   * access papers in their own department.
   */
  private ResearchPaper getAndVerifyAdminAccess(Integer id, CustomUserPrincipal principal) {
    if (!RoleBasedAccess.isUserAdmin(principal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Admin privileges required");
    }

    ResearchPaper paper =
        researchPaperRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found"));

    if (RoleBasedAccess.isUserDepartmentAdmin(principal)) {
      Integer userDeptId = principal.getDepartmentId();
      if (userDeptId == null || !userDeptId.equals(paper.getDepartment().getDepartmentId())) {
        throw new ApiException(
            ErrorCode.ACCESS_DENIED, "You do not have permission to manage this paper");
      }
    }

    return paper;
  }

  /**
   * Enforces download access rules based on role: SUPER_ADMIN has unrestricted access; the paper's
   * uploader can always access their own file; DEPARTMENT_ADMIN can download papers in their
   * department; students and faculty must have an accepted document request for the paper (archived
   * papers are not available to non-admins).
   */
  private void validateDownloadAccess(ResearchPaper paper, CustomUserPrincipal principal) {
    if (RoleBasedAccess.isUserSuperAdmin(principal)) {
      return;
    }

    if (paper.getUploadedBy() != null
        && principal.getUserId().equals(paper.getUploadedBy().getUserId())) {
      return;
    }

    if (RoleBasedAccess.isUserDepartmentAdmin(principal)) {
      if (principal.getDepartmentId() == null
          || !principal.getDepartmentId().equals(paper.getDepartment().getDepartmentId())) {
        throw new ApiException(
            ErrorCode.ACCESS_DENIED, "You do not have access to files in this department");
      }
      return;
    }

    // Student/Faculty
    if (paper.getArchived()) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_AVAILABLE, "Paper not available");
    }

    boolean hasAcceptedRequest =
        documentRequestRepository.existsByPaperPaperIdAndUserUserIdAndStatus(
            paper.getPaperId(), principal.getUserId(), RequestStatus.ACCEPTED);

    if (!hasAcceptedRequest) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "You do not have access to this file");
    }
  }
}
