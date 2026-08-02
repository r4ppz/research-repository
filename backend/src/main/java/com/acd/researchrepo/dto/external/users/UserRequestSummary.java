package com.acd.researchrepo.dto.external.users;

import com.acd.researchrepo.dto.external.papers.PaperResponse;
import com.acd.researchrepo.model.RequestStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserRequestSummary {
  private Integer requestId;
  private RequestStatus status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private PaperResponse paper;
}
