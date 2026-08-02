package com.acd.researchrepo.dto.external.requests;

import com.acd.researchrepo.dto.external.papers.PaperResponse;
import com.acd.researchrepo.dto.external.users.UserResponse;
import com.acd.researchrepo.model.RequestStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DocumentRequestResponse {
  private Integer requestId;
  private RequestStatus status;
  private String rejectionReason;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private UserResponse user;
  private PaperResponse paper;
}
