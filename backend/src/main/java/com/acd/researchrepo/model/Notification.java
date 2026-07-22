package com.acd.researchrepo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(
    name = "notifications",
    indexes = {
      @Index(name = "idx_notifications_user", columnList = "user_id"),
      @Index(name = "idx_notifications_unread", columnList = "user_id, is_read")
    })
@Data
@EntityListeners(AuditingEntityListener.class)
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer notificationId;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "user_id", nullable = false)
  @NotNull
  private User user;

  @Column(name = "message", nullable = false, columnDefinition = "TEXT")
  @NotNull
  private String message;

  @Column(name = "type", nullable = false, length = 50)
  @NotNull
  private String type;

  @Column(name = "related_entity_id")
  private Integer relatedEntityId;

  @Column(name = "related_entity_type", length = 50)
  private String relatedEntityType;

  @Column(name = "is_read", nullable = false)
  @NotNull
  private Boolean isRead = false;

  @CreatedDate
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;
}
