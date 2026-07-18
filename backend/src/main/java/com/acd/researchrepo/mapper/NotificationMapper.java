package com.acd.researchrepo.mapper;

import com.acd.researchrepo.dto.external.notifications.NotificationDto;
import com.acd.researchrepo.model.Notification;
import java.time.ZoneOffset;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

  public NotificationDto toDto(Notification notification) {
    if (notification == null) return null;

    return NotificationDto.builder()
        .notificationId(notification.getNotificationId())
        .message(notification.getMessage())
        .type(notification.getType())
        .relatedRequestId(notification.getRelatedRequestId())
        .isRead(notification.getIsRead())
        .createdAt(notification.getCreatedAt().atZone(ZoneOffset.UTC).toInstant())
        .build();
  }
}
