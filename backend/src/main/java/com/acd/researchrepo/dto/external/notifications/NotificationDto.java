package com.acd.researchrepo.dto.external.notifications;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationDto {
  private Integer notificationId;
  private String message;
  private String type;
  private Integer relatedRequestId;
  private Boolean isRead;
  private Instant createdAt;
}
