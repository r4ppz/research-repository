package com.acd.researchrepo.spec;

import com.acd.researchrepo.model.DocumentRequest;
import com.acd.researchrepo.model.RequestStatus;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/**
 * JPA {@link Specification} factory for dynamic querying of {@link DocumentRequest} entities.
 * Each method returns a spec that can be combined using {@code .and()}.
 */
public class DocumentRequestSpec {

  /**
   * Filters requests whose paper belongs to the given department. If {@code departmentId} is null,
   * returns a no-op specification (matches all).
   */
  public static Specification<DocumentRequest> hasDepartmentId(Integer departmentId) {
    if (departmentId == null) {
      return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction(); // Always true
    }
    return (root, query, criteriaBuilder) ->
        criteriaBuilder.equal(
            root.get("paper").get("department").get("departmentId"), departmentId);
  }

  /**
   * Filters requests whose status is in the given list. If the list is null or empty, returns a
   * no-op specification (matches all).
   */
  public static Specification<DocumentRequest> hasStatusIn(List<RequestStatus> statuses) {
    if (statuses == null || statuses.isEmpty()) {
      return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction(); // Always true
    }
    return (root, query, criteriaBuilder) -> root.get("status").in(statuses);
  }

  /**
   * Filters requests where the user's full name, email, or the paper's title contains the search
   * term (case-insensitive). Returns a no-op spec if the search term is blank.
   */
  public static Specification<DocumentRequest> hasSearchTerm(String searchTerm) {
    if (searchTerm == null || searchTerm.trim().isEmpty()) {
      return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction(); // Always true
    }

    String lowerCaseSearchTerm = "%" + searchTerm.toLowerCase().trim() + "%";
    return (root, query, criteriaBuilder) ->
        criteriaBuilder.or(
            criteriaBuilder.like(
                criteriaBuilder.lower(root.get("user").get("fullName")), lowerCaseSearchTerm),
            criteriaBuilder.like(
                criteriaBuilder.lower(root.get("user").get("email")), lowerCaseSearchTerm),
            criteriaBuilder.like(
                criteriaBuilder.lower(root.get("paper").get("title")), lowerCaseSearchTerm));
  }

  /**
   * Combines department, status, and search filters for admin request listing.
   */
  public static Specification<DocumentRequest> adminRequestFilter(
      Integer departmentId, List<RequestStatus> statuses, String searchTerm) {
    Specification<DocumentRequest> spec = (root, query, cb) -> cb.conjunction();
    spec =
        spec.and(hasDepartmentId(departmentId))
            .and(hasStatusIn(statuses))
            .and(hasSearchTerm(searchTerm));
    return spec;
  }

  public static Specification<DocumentRequest> adminRequestFilter(
      Integer departmentId, List<RequestStatus> statuses) {
    return adminRequestFilter(departmentId, statuses, null);
  }

  /** Filters requests created by the given user. */
  public static Specification<DocumentRequest> hasUserId(Integer userId) {
    return (root, query, cb) -> cb.equal(root.get("user").get("userId"), userId);
  }

  /** Filters out requests for archived papers. */
  public static Specification<DocumentRequest> paperNotArchived() {
    return (root, query, cb) -> cb.isFalse(root.get("paper").get("archived"));
  }

  /**
   * Combines user, status, search, and non-archived filters for student/faculty request listing.
   */
  public static Specification<DocumentRequest> userRequestFilter(
      Integer userId, List<RequestStatus> statuses, String search) {

    Specification<DocumentRequest> spec = (root, query, cb) -> cb.conjunction();
    spec =
        spec.and(hasUserId(userId))
            .and(hasStatusIn(statuses))
            .and(hasSearchTerm(search))
            .and(paperNotArchived());
    return spec;
  }
}
