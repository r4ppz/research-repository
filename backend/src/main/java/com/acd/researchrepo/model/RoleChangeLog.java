package com.acd.researchrepo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "role_change_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleChangeLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "log_id")
  private Integer logId;

  @Column(name = "target_user_id", nullable = false)
  private Integer targetUserId;

  @Column(name = "changed_by_user_id", nullable = false)
  private Integer changedByUserId;

  @Column(name = "old_role", nullable = false, length = 50)
  private String oldRole;

  @Column(name = "new_role", nullable = false, length = 50)
  private String newRole;

  @Column(name = "changed_at", nullable = false)
  private LocalDateTime changedAt;

  @PrePersist
  public void prePersist() {
    if (changedAt == null) {
      changedAt = LocalDateTime.now();
    }
  }
}
