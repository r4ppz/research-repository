package com.acd.researchrepo.dto.external.common;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * Reusable pagination request with validated page and size bounds. Page defaults to 0, size
 * defaults to 20 with a maximum of 100. Used by controllers that only need pagination without
 * domain-specific search filters.
 */
@Data
public class PaginationRequest {

  @Min(value = 0, message = "Page number cannot be negative")
  protected int page = 0;

  @Min(value = 1, message = "Page size must be at least 1")
  @Max(value = 100, message = "Page size cannot exceed 100")
  protected int size = 20;
}
