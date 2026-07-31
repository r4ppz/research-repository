package com.acd.researchrepo.dto.external.requests;

import com.acd.researchrepo.dto.external.common.PaginationRequest;
import com.acd.researchrepo.model.RequestStatus;
import com.acd.researchrepo.util.enums.DocumentRequestSortField;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Search and pagination request for document requests. Supports full-text search, filtering by
 * status and department, and sorting by createdAt, status, paper.title, or user.fullName.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DocumentRequestSearchRequest extends PaginationRequest {

  private String search;
  private List<RequestStatus> status;
  private Integer departmentId;

  @Pattern(
      regexp = "createdAt|status|paper.title|user.fullName",
      message = "Invalid sort field. Must be: createdAt, status, paper.title, user.fullName")
  private String sortBy = "createdAt";

  @Pattern(regexp = "(?i)asc|desc", message = "Invalid sort order. Must be: asc, desc")
  private String sortOrder = "desc";

  public Pageable toPageable() {
    Sort.Direction direction =
        "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
    String mappedField = DocumentRequestSortField.fromApiField(sortBy, "createdAt");
    return PageRequest.of(page, size, Sort.by(direction, mappedField));
  }
}
