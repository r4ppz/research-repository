package com.acd.researchrepo.mapper;

import com.acd.researchrepo.dto.external.notifications.NotificationResponse;
import com.acd.researchrepo.model.Notification;
import java.time.ZoneOffset;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

  public NotificationResponse toDto(Notification notification) {
    if (notification == null) return null;

    return NotificationResponse.builder()
        .notificationId(notification.getNotificationId())
        .message(notification.getMessage())
        .type(notification.getType())
        .relatedEntityId(notification.getRelatedEntityId())
        .relatedEntityType(notification.getRelatedEntityType())
        .isRead(notification.getIsRead())
        .createdAt(notification.getCreatedAt().atZone(ZoneOffset.UTC).toInstant())
        .build();
  }
}
