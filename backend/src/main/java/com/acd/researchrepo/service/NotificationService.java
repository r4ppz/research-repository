package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.external.notifications.NotificationDto;
import com.acd.researchrepo.dto.external.papers.PaginatedResponse;
import com.acd.researchrepo.mapper.NotificationMapper;
import com.acd.researchrepo.model.Notification;
import com.acd.researchrepo.repository.NotificationRepository;
import com.acd.researchrepo.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final NotificationMapper notificationMapper;
  private final SseEmitterService sseEmitterService;
  private final UserRepository userRepository;

  public NotificationService(
      NotificationRepository notificationRepository,
      NotificationMapper notificationMapper,
      SseEmitterService sseEmitterService,
      UserRepository userRepository) {
    this.notificationRepository = notificationRepository;
    this.notificationMapper = notificationMapper;
    this.sseEmitterService = sseEmitterService;
    this.userRepository = userRepository;
  }

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

    sseEmitterService.sendToUser(userId, dto);

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
    Notification notification = notificationRepository
        .findById(notificationId)
        .orElseThrow(() -> new RuntimeException("Notification not found"));

    // ownership check inline, no custom repo method needed
    if (!notification.getUser().getUserId().equals(userId)) {
      throw new RuntimeException("Unauthorized");
    }

    notification.setIsRead(true);
    notificationRepository.save(notification);
  }
}
