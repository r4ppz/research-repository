package com.acd.researchrepo.dto.external.papers;

import com.acd.researchrepo.dto.external.departments.DepartmentResponse;
import com.acd.researchrepo.dto.external.users.UserResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaperResponse {
  private Integer paperId;
  private String title;
  private String authorName;
  private String abstractText;
  private DepartmentResponse department;
  private LocalDate submissionDate;
  private String filePath;
  private String status;
  private UserResponse uploadedBy;
  private Boolean archived;
  private LocalDateTime archivedAt;
}
