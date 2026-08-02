package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.external.common.PaginatedResponse;
import com.acd.researchrepo.dto.external.papers.PaperCreateRequest;
import com.acd.researchrepo.dto.external.papers.PaperResponse;
import com.acd.researchrepo.dto.external.papers.PaperSearchRequest;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.mapper.ResearchPaperMapper;
import com.acd.researchrepo.model.ResearchPaper;
import com.acd.researchrepo.model.ResearchPaperStatus;
import com.acd.researchrepo.model.User;
import com.acd.researchrepo.model.UserRole;
import com.acd.researchrepo.repository.DepartmentRepository;
import com.acd.researchrepo.repository.ResearchPaperRepository;
import com.acd.researchrepo.repository.UserRepository;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.spec.ResearchPaperSpec;
import com.acd.researchrepo.util.RoleBasedAccess;
import java.time.LocalDate;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** Handles student paper submissions — create, update, delete, and admin approval/rejection. */
@Slf4j
@Service
public class SubmissionService {
  private final ResearchPaperRepository researchPaperRepository;
  private final ResearchPaperMapper researchPaperMapper;
  private final FileStorageService fileStorageService;
  private final DepartmentRepository departmentRepository;
  private final NotificationService notificationService;
  private final UserRepository userRepository;

  public SubmissionService(
      ResearchPaperRepository researchPaperRepository,
      ResearchPaperMapper researchPaperMapper,
      FileStorageService fileStorageService,
      DepartmentRepository departmentRepository,
      NotificationService notificationService,
      UserRepository userRepository) {
    this.researchPaperRepository = researchPaperRepository;
    this.researchPaperMapper = researchPaperMapper;
    this.fileStorageService = fileStorageService;
    this.departmentRepository = departmentRepository;
    this.notificationService = notificationService;
    this.userRepository = userRepository;
  }

  /**
   * Creates a PENDING_REVIEW submission from an uploaded file, notifying the department's admins.
   *
   * @param metadata the paper metadata
   * @param file the uploaded file
   * @param principal the submitting student
   * @return the created submission
   * @throws ApiException if the caller is not a student, the domain is not allowed, or the
   *     department/file is invalid
   */
  @Transactional
  public PaperResponse createSubmission(
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

    String relativePath = ResearchPaperService.buildFilePath();
    String originalFileName = safeOriginalFileName(file.getOriginalFilename());

    fileStorageService.saveFile(file, relativePath);
    paper.setFilePath(relativePath);
    paper.setOriginalFileName(originalFileName);
    ResearchPaper savedPaper = researchPaperRepository.save(paper);

    List<User> admins =
        userRepository.findByDepartmentDepartmentIdAndRole(
            department.getDepartmentId(), UserRole.DEPARTMENT_ADMIN);
    for (com.acd.researchrepo.model.User admin : admins) {
      notificationService.createAndSend(
          admin.getUserId(),
          "New paper submission: \"" + paper.getTitle() + "\" by " + principal.getFullName(),
          "NEW_SUBMISSION",
          savedPaper.getPaperId(),
          "RESEARCH_PAPER");
    }

    return researchPaperMapper.toDto(savedPaper);
  }

  /**
   * Returns the caller's own submissions, paginated.
   *
   * @param request the search/pagination request
   * @param principal the requesting user
   * @return a paginated list of the caller's submissions
   */
  public PaginatedResponse<PaperResponse> getMySubmissions(
      PaperSearchRequest request, CustomUserPrincipal principal) {

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
   * Updates a PENDING_REVIEW submission, optionally replacing the uploaded file.
   *
   * @param paperId the ID of the submission
   * @param metadata the updated metadata
   * @param file the replacement file, or null to keep the existing one
   * @param principal the submitting student
   * @return the updated submission
   * @throws ApiException if the caller is not the owner, the status is not PENDING_REVIEW, or the
   *     department is invalid
   */
  @Transactional
  public PaperResponse updateSubmission(
      Integer paperId,
      PaperCreateRequest metadata,
      MultipartFile file,
      CustomUserPrincipal principal) {

    ResearchPaper paper = getAndVerifySubmissionOwnership(paperId, principal);

    if (paper.getStatus() != ResearchPaperStatus.PENDING_REVIEW) {
      throw new ApiException(
          ErrorCode.INVALID_REQUEST, "Only PENDING_REVIEW submissions can be edited");
    }

    paper.setTitle(metadata.getTitle());
    paper.setAuthorName(metadata.getAuthorName());
    paper.setAbstractText(metadata.getAbstractText());
    paper.setSubmissionDate(LocalDate.parse(metadata.getSubmissionDate()));

    if (!paper.getDepartment().getDepartmentId().equals(metadata.getDepartmentId())) {
      var department =
          departmentRepository
              .findById(metadata.getDepartmentId())
              .orElseThrow(
                  () -> new ApiException(ErrorCode.VALIDATION_ERROR, "Department not found"));
      paper.setDepartment(department);
    }

    if (file != null && !file.isEmpty()) {
      String relativePath = ResearchPaperService.buildFilePath();

      String oldPath = paper.getFilePath();
      fileStorageService.saveFile(file, relativePath);
      paper.setFilePath(relativePath);
      paper.setOriginalFileName(safeOriginalFileName(file.getOriginalFilename()));
      try {
        fileStorageService.deleteFile(oldPath);
      } catch (Exception e) {
        log.warn("Failed to delete old file after replacement: {}", oldPath, e);
      }
    }

    ResearchPaper savedPaper = researchPaperRepository.save(paper);
    return researchPaperMapper.toDto(savedPaper);
  }

  /**
   * Deletes a PENDING_REVIEW submission and its stored file.
   *
   * @param paperId the ID of the submission
   * @param principal the submitting student
   * @throws ApiException if the caller is not the owner or the status is not PENDING_REVIEW
   */
  @Transactional
  public void deleteSubmission(Integer paperId, CustomUserPrincipal principal) {
    ResearchPaper paper = getAndVerifySubmissionOwnership(paperId, principal);

    if (paper.getStatus() != ResearchPaperStatus.PENDING_REVIEW) {
      throw new ApiException(
          ErrorCode.INVALID_REQUEST, "Only PENDING_REVIEW submissions can be deleted");
    }

    String relativePath = paper.getFilePath();
    researchPaperRepository.delete(paper);
    fileStorageService.deleteFile(relativePath);
  }

  /**
   * Approves a PENDING_REVIEW submission, making it live, and notifies the uploader.
   *
   * @param paperId the ID of the submission
   * @param principal the acting admin
   * @return the approved submission
   * @throws ApiException if unauthorized or the status is not PENDING_REVIEW
   */
  @Transactional
  public PaperResponse approveSubmission(Integer paperId, CustomUserPrincipal principal) {
    ResearchPaper paper = verifyAdminAccess(paperId, principal);

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
   * Rejects a PENDING_REVIEW submission: deletes the paper and its file, and notifies the uploader.
   *
   * @param paperId the ID of the submission
   * @param principal the acting admin
   * @throws ApiException if unauthorized or the status is not PENDING_REVIEW
   */
  @Transactional
  public void rejectSubmission(Integer paperId, CustomUserPrincipal principal) {
    ResearchPaper paper = verifyAdminAccess(paperId, principal);

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

  private static String safeOriginalFileName(String originalFilename) {
    return originalFilename != null && !originalFilename.isBlank()
        ? originalFilename
        : "untitled.pdf";
  }

  private ResearchPaper getAndVerifySubmissionOwnership(
      Integer paperId, CustomUserPrincipal principal) {
    ResearchPaper paper =
        researchPaperRepository
            .findById(paperId)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found"));

    if (paper.getUploadedBy() == null
        || !principal.getUserId().equals(paper.getUploadedBy().getUserId())) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "You do not have access to this paper");
    }

    return paper;
  }

  private ResearchPaper verifyAdminAccess(Integer id, CustomUserPrincipal principal) {
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
}
