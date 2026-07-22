package com.acd.researchrepo.dto.external.papers;

import com.acd.researchrepo.dto.external.common.PaginationRequest;
import com.acd.researchrepo.util.enums.ResearchPaperSortField;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Search and pagination request for research papers. Supports full-text search, filtering by
 * department and year, and sorting by submissionDate, title, or authorName.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ResearchPaperSearchRequest extends PaginationRequest {

  private String search;
  private List<Integer> departmentId;
  private List<
          @Min(value = 1900, message = "Year must be at least 1900")
          @Max(value = 2100, message = "Year cannot exceed 2100") Integer>
      year;
  private Boolean archived;
  private String status;

  @Pattern(
      regexp = "submissionDate|title|authorName",
      message = "Invalid sort field. Must be: submissionDate, title, authorName")
  private String sortBy = "submissionDate";

  @Pattern(regexp = "(?i)asc|desc", message = "Invalid sort order. Must be: asc, desc")
  private String sortOrder = "desc";

  public Pageable toPageable() {
    Sort.Direction direction =
        "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
    String mappedField = ResearchPaperSortField.fromApiField(sortBy, "submissionDate");
    return PageRequest.of(page, size, Sort.by(direction, mappedField));
  }
}
