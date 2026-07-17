package com.acd.researchrepo.repository;

import com.acd.researchrepo.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

  Page<Notification> findByUserUserIdOrderByCreatedAtDesc(Integer userId, Pageable pageable);

  long countByUserUserIdAndIsReadFalse(Integer userId);

  @Modifying
  @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.userId = :userId")
  void markAllReadByUserId(@Param("userId") Integer userId);
}
