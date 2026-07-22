package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.external.model.ResearchPaperDto;
import com.acd.researchrepo.dto.external.papers.PaginatedResponse;
import com.acd.researchrepo.dto.external.papers.PaperCreateRequest;
import com.acd.researchrepo.dto.external.papers.PaperUpdateRequest;
import com.acd.researchrepo.dto.external.papers.PaperUserRequestResponse;
import com.acd.researchrepo.dto.external.papers.ResearchPaperSearchRequest;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.mapper.ResearchPaperMapper;
import com.acd.researchrepo.model.DocumentRequest;
import com.acd.researchrepo.model.Notification;
import com.acd.researchrepo.model.RequestStatus;
import com.acd.researchrepo.model.ResearchPaper;
import com.acd.researchrepo.model.ResearchPaperStatus;
import com.acd.researchrepo.model.UserRole;
import com.acd.researchrepo.repository.DepartmentRepository;
import com.acd.researchrepo.repository.DocumentRequestRepository;
import com.acd.researchrepo.repository.ResearchPaperRepository;
import com.acd.researchrepo.repository.UserRepository;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.spec.ResearchPaperSpec;
import com.acd.researchrepo.util.RoleBasedAccess;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
  private final NotificationService notificationService;
  private final UserRepository userRepository;

  public ResearchPaperService(
      ResearchPaperRepository researchPaperRepository,
      DocumentRequestRepository documentRequestRepository,
      ResearchPaperMapper researchPaperMapper,
      DocumentRequestService documentRequestService,
      FileStorageService fileStorageService,
      DepartmentRepository departmentRepository,
      NotificationService notificationService,
      UserRepository userRepository) {
    this.researchPaperRepository = researchPaperRepository;
    this.documentRequestRepository = documentRequestRepository;
    this.researchPaperMapper = researchPaperMapper;
    this.documentRequestService = documentRequestService;
    this.fileStorageService = fileStorageService;
    this.departmentRepository = departmentRepository;
    this.notificationService = notificationService;
    this.userRepository = userRepository;
  }

  public PaginatedResponse<ResearchPaperDto> getPapers(
      ResearchPaperSearchRequest request, CustomUserPrincipal userPrincipal) {

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
  public PaginatedResponse<ResearchPaperDto> getAdminPapers(
      ResearchPaperSearchRequest request, CustomUserPrincipal userPrincipal) {

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

  public ResearchPaperDto getPaperById(Integer id, CustomUserPrincipal userPrincipal) {
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

  /**
   * Allows a student with an @acdeducation.com email to submit a paper for review. Creates the
   * paper in PENDING_REVIEW status. Notifies department admins of the chosen department.
   */
  @Transactional
  public ResearchPaperDto createSubmission(
      PaperCreateRequest metadata, MultipartFile file, CustomUserPrincipal principal) {

    if (!RoleBasedAccess.isUserStudent(principal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Only students can submit papers");
    }

    if (!principal.getEmail().endsWith("@acdeducation.com")) {
      throw new ApiException(
          ErrorCode.ACCESS_DENIED, "Only @acdeducation.com emails can submit papers");
    }

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
    paper.setStatus(ResearchPaperStatus.PENDING_REVIEW);
    paper.setUploadedBy(principal.getUser());

    String year = String.valueOf(submissionDate.getYear());
    String deptSlug = department.getDepartmentName().toLowerCase().replaceAll("[^a-z0-9]", "_");
    String originalFilename = file.getOriginalFilename();
    String extension =
        originalFilename != null && originalFilename.contains(".")
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : ".pdf";
    String filename = "paper_" + System.currentTimeMillis() + extension;
    String relativePath = String.format("%s/%s/%s", year, deptSlug, filename);

    fileStorageService.saveFile(file, relativePath);
    paper.setFilePath(relativePath);
    ResearchPaper savedPaper = researchPaperRepository.save(paper);

    List<com.acd.researchrepo.model.User> admins =
        userRepository.findByDepartmentDepartmentIdAndRole(
            department.getDepartmentId(), UserRole.DEPARTMENT_ADMIN);
    for (com.acd.researchrepo.model.User admin : admins) {
      notificationService.createAndSend(
          admin.getUserId(),
          "New paper submission: \""
              + paper.getTitle()
              + "\" by "
              + principal.getFullName(),
          "NEW_SUBMISSION",
          savedPaper.getPaperId(),
          "RESEARCH_PAPER");
    }

    return researchPaperMapper.toDto(savedPaper);
  }

  /**
   * Returns papers submitted by the current user (PENDING_REVIEW or REJECTED). Only the uploader
   * can see their own submissions.
   */
  public PaginatedResponse<ResearchPaperDto> getMySubmissions(
      ResearchPaperSearchRequest request, CustomUserPrincipal principal) {

    Boolean archived = RoleBasedAccess.isUserAdmin(principal) ? request.getArchived() : false;

    Specification<ResearchPaper> spec =
        (root, query, cb) -> {
          Specification<ResearchPaper> base =
              ResearchPaperSpec.buildAdmin(
                  request.getSearch(),
                  request.getDepartmentId(),
                  request.getYear(),
                  archived,
                  null);
          return cb.and(
              base.toPredicate(root, query, cb),
              cb.equal(root.get("uploadedBy").get("userId"), principal.getUserId()));
        };

    Page<ResearchPaper> paperPage = researchPaperRepository.findAll(spec, request.toPageable());
    return PaginatedResponse.fromPage(paperPage, researchPaperMapper::toDto);
  }

  /**
   * Admin approves a PENDING_REVIEW paper submission. Sets status to ACTIVE and notifies the
   * uploader.
   */
  @Transactional
  public ResearchPaperDto approveSubmission(
      Integer paperId, CustomUserPrincipal principal) {

    ResearchPaper paper = getAndVerifyAdminAccess(paperId, principal);

    if (paper.getStatus() != ResearchPaperStatus.PENDING_REVIEW) {
      throw new ApiException(
          ErrorCode.INVALID_REQUEST, "Only PENDING_REVIEW submissions can be approved");
    }

    paper.setStatus(ResearchPaperStatus.ACTIVE);
    ResearchPaper savedPaper = researchPaperRepository.save(paper);

    if (paper.getUploadedBy() != null) {
      notificationService.createAndSend(
          paper.getUploadedBy().getUserId(),
          "Your submission \"" + paper.getTitle() + "\" has been approved and is now live.",
          "SUBMISSION_APPROVED",
          paper.getPaperId(),
          "RESEARCH_PAPER");
    }

    return researchPaperMapper.toDto(savedPaper);
  }

  /**
   * Admin rejects a PENDING_REVIEW paper submission. Deletes the paper + file and notifies the
   * uploader.
   */
  @Transactional
  public void rejectSubmission(Integer paperId, CustomUserPrincipal principal) {

    ResearchPaper paper = getAndVerifyAdminAccess(paperId, principal);

    if (paper.getStatus() != ResearchPaperStatus.PENDING_REVIEW) {
      throw new ApiException(
          ErrorCode.INVALID_REQUEST, "Only PENDING_REVIEW submissions can be rejected");
    }

    Integer uploaderId = paper.getUploadedBy() != null ? paper.getUploadedBy().getUserId() : null;
    String paperTitle = paper.getTitle();
    String relativePath = paper.getFilePath();

    researchPaperRepository.delete(paper);
    fileStorageService.deleteFile(relativePath);

    if (uploaderId != null) {
      notificationService.createAndSend(
          uploaderId,
          "Your submission \"" + paperTitle + "\" has been rejected.",
          "SUBMISSION_REJECTED",
          paperId,
          "RESEARCH_PAPER");
    }
  }

  public PaperUserRequestResponse getUserRequestForPaper(
      Integer paperId, CustomUserPrincipal userPrincipal) {
    return documentRequestService.getUserRequestForPaper(paperId, userPrincipal);
  }

  /**
   * Archives a research paper. As a side effect, all active (PENDING or ACCEPTED) document
   * requests for this paper are rejected with reason "Paper archived".
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
  public ResearchPaperDto updatePaper(
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
   */
  public String getPaperFileName(Integer paperId, CustomUserPrincipal principal) {
    ResearchPaper paper =
        researchPaperRepository
            .findById(paperId)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found"));

    validateDownloadAccess(paper, principal);

    String filePath = paper.getFilePath();
    return filePath.substring(filePath.lastIndexOf('/') + 1);
  }

  /**
   * Downloads the file for a research paper. Access is granted only if the caller has an accepted
   * document request (students/faculty), belongs to the paper's department (DEPARTMENT_ADMIN), or
   * is a SUPER_ADMIN.
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
   * {year}/{department_slug}/paper_{timestamp}.{ext}}. DEPARTMENT_ADMINs can only create papers for
   * their own department.
   */
  @Transactional
  public ResearchPaperDto createPaper(
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

    // Create Entity (temporary, need to save to get ID for file path if we want
    // paper_{id})
    // Alternatively, use a UUID or timestamp for uniqueness before DB save
    ResearchPaper paper = new ResearchPaper();
    paper.setTitle(metadata.getTitle());
    paper.setAuthorName(metadata.getAuthorName());
    paper.setAbstractText(metadata.getAbstractText());
    paper.setDepartment(department);
    LocalDate submissionDate = LocalDate.parse(metadata.getSubmissionDate());
    paper.setSubmissionDate(submissionDate);
    paper.setArchived(false);
    paper.setStatus(ResearchPaperStatus.ACTIVE);

    // We need a path. Pattern: {year}/{dept_slug}/filename
    String year = String.valueOf(submissionDate.getYear());
    String deptSlug = department.getDepartmentName().toLowerCase().replaceAll("[^a-z0-9]", "_");
    String originalFilename = file.getOriginalFilename();
    String extension =
        originalFilename != null && originalFilename.contains(".")
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : ".pdf";

    // To avoid collisions and because we don't have the ID yet, use timestamp +
    // random
    String filename = "paper_" + System.currentTimeMillis() + extension;
    String relativePath = String.format("%s/%s/%s", year, deptSlug, filename);

    // Save file
    fileStorageService.saveFile(file, relativePath);

    // Update entity with path and save
    paper.setFilePath(relativePath);
    ResearchPaper savedPaper = researchPaperRepository.save(paper);

    return researchPaperMapper.toDto(savedPaper);
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
   * Enforces download access rules based on role: SUPER_ADMIN has unrestricted access;
   * DEPARTMENT_ADMIN can download papers in their department; students and faculty must have an
   * accepted document request for the paper (archived papers are not available to non-admins).
   */
  private void validateDownloadAccess(ResearchPaper paper, CustomUserPrincipal principal) {
    if (RoleBasedAccess.isUserSuperAdmin(principal)) {
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
