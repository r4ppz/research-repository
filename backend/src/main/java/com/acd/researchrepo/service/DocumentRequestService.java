package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.external.common.PaginatedResponse;
import com.acd.researchrepo.dto.external.papers.PaperRequestStatusResponse;
import com.acd.researchrepo.dto.external.requests.CreateDocumentRequestRequest;
import com.acd.researchrepo.dto.external.requests.CreateDocumentRequestResponse;
import com.acd.researchrepo.dto.external.requests.DocumentRequestResponse;
import com.acd.researchrepo.dto.external.requests.DocumentRequestSearchRequest;
import com.acd.researchrepo.dto.external.users.UserRequestSummary;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.mapper.DocumentRequestMapper;
import com.acd.researchrepo.model.DocumentRequest;
import com.acd.researchrepo.model.RequestStatus;
import com.acd.researchrepo.model.ResearchPaper;
import com.acd.researchrepo.model.UserRole;
import com.acd.researchrepo.repository.DocumentRequestRepository;
import com.acd.researchrepo.repository.ResearchPaperRepository;
import com.acd.researchrepo.repository.UserRepository;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.spec.DocumentRequestSpec;
import com.acd.researchrepo.util.RoleBasedAccess;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages document access requests — creation by students/faculty, and acceptance/rejection by
 * admins. Notifications are sent to relevant users on state transitions.
 */
@Service
public class DocumentRequestService {
  private final DocumentRequestRepository documentRequestRepository;
  private final ResearchPaperRepository researchPaperRepository;
  private final DocumentRequestMapper documentRequestMapper;
  private final NotificationService notificationService;
  private final UserRepository userRepository;

  public DocumentRequestService(
      DocumentRequestRepository documentRequestRepository,
      ResearchPaperRepository researchPaperRepository,
      DocumentRequestMapper documentRequestMapper,
      NotificationService notificationService,
      UserRepository userRepository) {
    this.documentRequestRepository = documentRequestRepository;
    this.researchPaperRepository = researchPaperRepository;
    this.documentRequestMapper = documentRequestMapper;
    this.notificationService = notificationService;
    this.userRepository = userRepository;
  }

  public PaginatedResponse<UserRequestSummary> getUserDocumentRequests(
      CustomUserPrincipal userPrincipal, DocumentRequestSearchRequest request) {

    if (!RoleBasedAccess.isUserStudentOrFaculty(userPrincipal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Access denied");
    }

    Specification<DocumentRequest> spec =
        DocumentRequestSpec.userRequestFilter(
            userPrincipal.getUserId(), request.getStatus(), request.getSearch());

    Page<DocumentRequest> requestPage =
        documentRequestRepository.findAll(spec, request.toPageable());

    return PaginatedResponse.fromPage(requestPage, documentRequestMapper::toDto);
  }

  /**
   * Creates a new document access request. Prevents duplicate active requests for the same paper
   * and sends notifications to all DEPARTMENT_ADMINs in the paper's department.
   */
  @Transactional
  public CreateDocumentRequestResponse createRequest(
      CreateDocumentRequestRequest requestDto, CustomUserPrincipal userPrincipal) {
    if (!RoleBasedAccess.isUserStudentOrFaculty(userPrincipal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Access denied");
    }

    if (requestDto.getPaperId() == null || requestDto.getPaperId() <= 0) {
      throw new ApiException(ErrorCode.INVALID_REQUEST, "Invalid paper ID");
    }

    ResearchPaper paper =
        researchPaperRepository
            .findById(requestDto.getPaperId())
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found"));

    if (paper.getArchived()) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found");
    }

    List<DocumentRequest> existingActiveRequests =
        documentRequestRepository.findByUserIdAndPaperIdAndActiveStatus(
            userPrincipal.getUserId(), requestDto.getPaperId());
    if (!existingActiveRequests.isEmpty()) {
      throw new ApiException(ErrorCode.DUPLICATE_REQUEST, "Duplicate active request exists");
    }

    DocumentRequest newRequest = new DocumentRequest();
    newRequest.setUser(userPrincipal.getUser());
    newRequest.setPaper(paper);
    newRequest.setStatus(RequestStatus.PENDING);

    DocumentRequest savedRequest = documentRequestRepository.save(newRequest);

    List<com.acd.researchrepo.model.User> admins =
        userRepository.findByDepartmentDepartmentIdAndRole(
            paper.getDepartment().getDepartmentId(), UserRole.DEPARTMENT_ADMIN);
    for (com.acd.researchrepo.model.User admin : admins) {
      notificationService.createAndSend(
          admin.getUserId(),
          "New request for \"" + paper.getTitle() + "\" from " + userPrincipal.getFullName(),
          "NEW_REQUEST",
          savedRequest.getRequestId(),
          "DOCUMENT_REQUEST");
    }

    return CreateDocumentRequestResponse.builder().requestId(savedRequest.getRequestId()).build();
  }

  /**
   * Deletes a document request. Only allowed if the request belongs to the caller and is in
   * PENDING or REJECTED status.
   */
  @Transactional
  public void deleteRequest(Integer requestId, CustomUserPrincipal userPrincipal) {
    if (!RoleBasedAccess.isUserStudentOrFaculty(userPrincipal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Access denied");
    }

    if (requestId == null || requestId <= 0) {
      throw new ApiException(ErrorCode.INVALID_REQUEST, "Invalid request ID");
    }

    Optional<DocumentRequest> requestOpt =
        documentRequestRepository.findByIdAndUserId(requestId, userPrincipal.getUserId());
    if (requestOpt.isEmpty()) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Request not found");
    }

    DocumentRequest request = requestOpt.get();

    if (request.getStatus() == RequestStatus.REJECTED
        || request.getStatus() == RequestStatus.PENDING) {
      documentRequestRepository.delete(request);
    } else {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Not allowed to delete this request");
    }
  }

  public PaperRequestStatusResponse getUserRequestForPaper(
      Integer paperId, CustomUserPrincipal userPrincipal) {
    if (!RoleBasedAccess.isUserStudentOrFaculty(userPrincipal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Access denied");
    }

    if (paperId == null || paperId <= 0) {
      throw new ApiException(ErrorCode.INVALID_REQUEST, "Invalid paper ID");
    }

    Optional<ResearchPaper> paperOpt = researchPaperRepository.findById(paperId);
    if (paperOpt.isEmpty() || paperOpt.get().getArchived()) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found");
    }

    // Find the user's request for this paper
    Optional<DocumentRequest> requestOpt =
        documentRequestRepository.findByUserIdAndPaperId(userPrincipal.getUserId(), paperId);

    if (requestOpt.isEmpty()) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "No request found for this paper/user");
    }

    DocumentRequest request = requestOpt.get();
    return documentRequestMapper.toPaperUserRequestResponse(request);
  }

  public PaginatedResponse<DocumentRequestResponse> getAdminRequests(
      DocumentRequestSearchRequest request, CustomUserPrincipal userPrincipal) {

    if (!RoleBasedAccess.isUserAdmin(userPrincipal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Access denied");
    }

    // Validation: DEPARTMENT_ADMIN cannot provide departmentId filter
    if (RoleBasedAccess.isUserDepartmentAdmin(userPrincipal) && request.getDepartmentId() != null) {
      throw new ApiException(
          ErrorCode.INVALID_REQUEST, "departmentId filter not permitted for your role");
    }

    // Determine target department
    Integer filterDepartmentId =
        RoleBasedAccess.isUserSuperAdmin(userPrincipal)
            ? request.getDepartmentId()
            : getUserDepartmentIdIfDepartmentAdmin(userPrincipal);

    Specification<DocumentRequest> spec =
        DocumentRequestSpec.adminRequestFilter(
            filterDepartmentId, request.getStatus(), request.getSearch());

    Page<DocumentRequest> requestPage =
        documentRequestRepository.findAll(spec, request.toPageable());

    return PaginatedResponse.fromPage(requestPage, documentRequestMapper::toAdminDto);
  }

  private Integer getUserDepartmentIdIfDepartmentAdmin(CustomUserPrincipal principal) {
    if (RoleBasedAccess.isUserDepartmentAdmin(principal)) {
      Integer userDepartmentId = principal.getDepartmentId();
      if (userDepartmentId == null) {
        throw new ApiException(
            ErrorCode.ACCESS_DENIED, "Department admin not assigned to a department");
      }
      return userDepartmentId;
    }
    return null;
  }

  /**
   * Accepts a PENDING document request. DEPARTMENT_ADMINs can only accept requests for papers in
   * their own department. Sends a notification to the requesting user.
   */
  @Transactional
  public DocumentRequestResponse acceptRequest(
      Integer requestId, CustomUserPrincipal userPrincipal) {
    // Authorization: must be admin
    if (!RoleBasedAccess.isUserAdmin(userPrincipal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Admin privileges required");
    }

    // Find the request
    DocumentRequest request =
        documentRequestRepository
            .findById(requestId)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Request not found"));

    // Check if request is in PENDING status
    if (request.getStatus() != RequestStatus.PENDING) {
      throw new ApiException(
          ErrorCode.REQUEST_ALREADY_FINAL, "Request is already in a terminal state");
    }

    // Check if paper is archived
    if (request.getPaper().getArchived()) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found");
    }

    // For DEPARTMENT_ADMIN, verify department access
    if (RoleBasedAccess.isUserDepartmentAdmin(userPrincipal)) {
      Integer adminDepartmentId = userPrincipal.getDepartmentId();
      Integer paperDepartmentId = request.getPaper().getDepartment().getDepartmentId();
      if (!adminDepartmentId.equals(paperDepartmentId)) {
        throw new ApiException(
            ErrorCode.ACCESS_DENIED,
            "You do not have permission to approve requests for this department");
      }
    }

    // Update request status
    request.setStatus(RequestStatus.ACCEPTED);
    DocumentRequest savedRequest = documentRequestRepository.save(request);

    notificationService.createAndSend(
        request.getUser().getUserId(),
        "Your request for \"" + request.getPaper().getTitle() + "\" has been accepted.",
        "REQUEST_ACCEPTED",
        request.getRequestId(),
        "DOCUMENT_REQUEST");

    return documentRequestMapper.toAdminDto(savedRequest);
  }

  /**
   * Rejects a document request (any non-terminal status). DEPARTMENT_ADMINs can only reject
   * requests for papers in their own department. Sends a notification to the requesting user.
   */
  @Transactional
  public DocumentRequestResponse rejectRequest(
      Integer requestId, String reason, CustomUserPrincipal userPrincipal) {
    // Authorization: must be admin
    if (!RoleBasedAccess.isUserAdmin(userPrincipal)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Admin privileges required");
    }

    // Find the request
    DocumentRequest request =
        documentRequestRepository
            .findById(requestId)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Request not found"));

    // Check if request is already REJECTED (terminal state)
    if (request.getStatus() == RequestStatus.REJECTED) {
      throw new ApiException(
          ErrorCode.REQUEST_ALREADY_FINAL, "Request is already in a terminal state");
    }

    // Check if paper is archived
    if (request.getPaper().getArchived()) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Paper not found");
    }

    // For DEPARTMENT_ADMIN, verify department access
    if (RoleBasedAccess.isUserDepartmentAdmin(userPrincipal)) {
      Integer adminDepartmentId = userPrincipal.getDepartmentId();
      Integer paperDepartmentId = request.getPaper().getDepartment().getDepartmentId();
      if (!adminDepartmentId.equals(paperDepartmentId)) {
        throw new ApiException(
            ErrorCode.ACCESS_DENIED,
            "You do not have permission to reject requests for this department");
      }
    }

    // Update request status and reason
    request.setStatus(RequestStatus.REJECTED);
    request.setRejectionReason(reason);
    DocumentRequest savedRequest = documentRequestRepository.save(request);

    notificationService.createAndSend(
        request.getUser().getUserId(),
        "Your request for \"" + request.getPaper().getTitle() + "\" has been rejected.",
        "REQUEST_REJECTED",
        request.getRequestId(),
        "DOCUMENT_REQUEST");

    return documentRequestMapper.toAdminDto(savedRequest);
  }
}
