package com.acd.researchrepo.repository;

import com.acd.researchrepo.model.User;
import com.acd.researchrepo.model.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Integer> {
  Optional<User> findByEmail(String email);

  Optional<User> findById(Integer userId);

  boolean existsByDepartmentDepartmentId(Integer departmentId);

  List<User> findByDepartmentDepartmentIdAndRole(Integer departmentId, UserRole role);

  long countByDepartmentDepartmentId(Integer departmentId);

  @Query(
      "SELECT u.department.departmentId, COUNT(u) FROM User u "
          + "WHERE u.department.departmentId IN :ids AND u.department IS NOT NULL "
          + "GROUP BY u.department.departmentId")
  List<Object[]> countByDepartmentIds(@Param("ids") List<Integer> ids);

  @Query(
      "SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) "
          + "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))")
  Page<User> searchByEmailOrFullName(@Param("search") String search, Pageable pageable);
}
