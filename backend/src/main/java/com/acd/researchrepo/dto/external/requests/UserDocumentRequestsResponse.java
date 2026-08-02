package com.acd.researchrepo.dto.external.requests;

import com.acd.researchrepo.dto.external.users.UserRequestSummary;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserDocumentRequestsResponse {
  private List<UserRequestSummary> requests;
}
