package com.acd.researchrepo.dto.external.papers;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Getter
@Builder
@Jacksonized
public class PaperCreateRequest {
  private String title;
  private String authorName;
  private String abstractText;
  private Integer departmentId;
  private String submissionDate;
}
