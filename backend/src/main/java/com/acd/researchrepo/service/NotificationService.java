package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.external.notifications.NotificationDto;
import com.acd.researchrepo.dto.external.papers.PaginatedResponse;
import com.acd.researchrepo.event.NotificationCreatedEvent;
import com.acd.researchrepo.exception.ApiException;
import com.acd.researchrepo.exception.ErrorCode;
import com.acd.researchrepo.mapper.NotificationMapper;
import com.acd.researchrepo.model.Notification;
import com.acd.researchrepo.repository.NotificationRepository;
import com.acd.researchrepo.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Persists notifications and pushes them in real-time via SSE. Supports listing, unread count,
 * marking individual or all notifications as read.
 */
@Service
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final NotificationMapper notificationMapper;
  private final ApplicationEventPublisher eventPublisher;
  private final UserRepository userRepository;

  public NotificationService(
      NotificationRepository notificationRepository,
      NotificationMapper notificationMapper,
      ApplicationEventPublisher eventPublisher,
      UserRepository userRepository) {
    this.notificationRepository = notificationRepository;
    this.notificationMapper = notificationMapper;
    this.eventPublisher = eventPublisher;
    this.userRepository = userRepository;
  }

  /**
   * Creates a notification record and publishes a {@link NotificationCreatedEvent}. The event
   * listener dispatches the SSE after the enclosing transaction commits, preventing phantom
   * notifications on rollback.
   */
  @Transactional
  public NotificationDto createAndSend(
      Integer userId, String message, String type, Integer relatedRequestId) {

    Notification notification = new Notification();
    notification.setUser(userRepository.getReferenceById(userId));
    notification.setMessage(message);
    notification.setType(type);
    notification.setRelatedRequestId(relatedRequestId);
    notification.setIsRead(false);

    notification = notificationRepository.save(notification);
    NotificationDto dto = notificationMapper.toDto(notification);

    eventPublisher.publishEvent(new NotificationCreatedEvent(userId, dto));

    return dto;
  }

  public PaginatedResponse<NotificationDto> getNotifications(Integer userId, Pageable pageable) {
    return PaginatedResponse.fromPage(
        notificationRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable),
        notificationMapper::toDto);
  }

  public long getUnreadCount(Integer userId) {
    return notificationRepository.countByUserUserIdAndIsReadFalse(userId);
  }

  @Transactional
  public void markAllRead(Integer userId) {
    notificationRepository.markAllReadByUserId(userId);
  }

  @Transactional
  public void markAsRead(Integer notificationId, Integer userId) {
    Notification notification =
        notificationRepository
            .findById(notificationId)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Notification not found"));

    if (!notification.getUser().getUserId().equals(userId)) {
      throw new ApiException(ErrorCode.ACCESS_DENIED, "Access denied");
    }

    notification.setIsRead(true);
    notificationRepository.save(notification);
  }
}
