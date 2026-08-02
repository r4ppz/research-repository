package com.acd.researchrepo.mapper;

import com.acd.researchrepo.dto.external.papers.PaperRequestStatusResponse;
import com.acd.researchrepo.dto.external.papers.PaperResponse;
import com.acd.researchrepo.dto.external.requests.DocumentRequestResponse;
import com.acd.researchrepo.dto.external.users.UserRequestSummary;
import com.acd.researchrepo.model.DocumentRequest;
import org.springframework.stereotype.Component;

/** Maps {@link DocumentRequest} entities to their API representations. */
@Component
public class DocumentRequestMapper {
  private final ResearchPaperMapper researchPaperMapper;
  private final UserMapper userMapper;

  public DocumentRequestMapper(ResearchPaperMapper researchPaperMapper, UserMapper userMapper) {
    this.researchPaperMapper = researchPaperMapper;
    this.userMapper = userMapper;
  }

  /**
   * Maps a request entity to a {@link UserRequestSummary} for the requesting user.
   *
   * @param request the request entity, or null
   * @return the mapped summary, or null if the input is null
   */
  public UserRequestSummary toDto(DocumentRequest request) {
    if (request == null) {
      return null;
    }

    PaperResponse paperDto = researchPaperMapper.toDto(request.getPaper());

    return UserRequestSummary.builder()
        .requestId(request.getRequestId())
        .status(request.getStatus())
        .createdAt(
            request.getCreatedAt() != null ? request.getCreatedAt() : request.getRequestDate())
        .updatedAt(
            request.getUpdatedAt() != null ? request.getUpdatedAt() : request.getRequestDate())
        .paper(paperDto)
        .build();
  }

  /**
   * Maps a request entity to a {@link DocumentRequestResponse} including user and paper, for the
   * admin panel.
   *
   * @param request the request entity, or null
   * @return the mapped admin response, or null if the input is null
   */
  public DocumentRequestResponse toAdminDto(DocumentRequest request) {
    if (request == null) return null;

    return DocumentRequestResponse.builder()
        .requestId(request.getRequestId())
        .status(request.getStatus())
        .rejectionReason(request.getRejectionReason())
        .createdAt(
            request.getCreatedAt() != null ? request.getCreatedAt() : request.getRequestDate())
        .updatedAt(
            request.getUpdatedAt() != null ? request.getUpdatedAt() : request.getRequestDate())
        .user(userMapper.toDto(request.getUser()))
        .paper(researchPaperMapper.toDto(request.getPaper()))
        .build();
  }

  /**
   * Maps a request entity to a {@link PaperRequestStatusResponse} describing the caller's request
   * status for a specific paper.
   *
   * @param request the request entity, or null
   * @return the mapped status response, or null if the input is null
   */
  public PaperRequestStatusResponse toPaperUserRequestResponse(DocumentRequest request) {
    if (request == null) return null;
    return PaperRequestStatusResponse.builder()
        .requestId(request.getRequestId())
        .status(request.getStatus())
        .createdAt(request.getCreatedAt())
        .updatedAt(request.getUpdatedAt())
        .build();
  }
}
