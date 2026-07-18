package com.acd.researchrepo.controller;

import com.acd.researchrepo.dto.external.notifications.NotificationDto;
import com.acd.researchrepo.dto.external.papers.PaginatedResponse;
import com.acd.researchrepo.security.CustomUserPrincipal;
import com.acd.researchrepo.service.NotificationService;
import com.acd.researchrepo.service.SseEmitterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

  private final NotificationService notificationService;
  private final SseEmitterService sseEmitterService;

  public NotificationController(
      NotificationService notificationService, SseEmitterService sseEmitterService) {
    this.notificationService = notificationService;
    this.sseEmitterService = sseEmitterService;
  }

  @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter streamNotifications(
      @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("GET /api/notifications/stream endpoint hit for user {}", principal.getUserId());
    return sseEmitterService.addEmitter(principal.getUserId());
  }

  @GetMapping
  public ResponseEntity<PaginatedResponse<NotificationDto>> getNotifications(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("GET /api/notifications endpoint hit");
    Pageable pageable = PageRequest.of(page, size);
    return ResponseEntity.ok(notificationService.getNotifications(principal.getUserId(), pageable));
  }

  @GetMapping("/unread-count")
  public ResponseEntity<Long> getUnreadCount(
      @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("GET /api/notifications/unread-count endpoint hit");
    long count = notificationService.getUnreadCount(principal.getUserId());
    return ResponseEntity.ok(count);
  }

  @PutMapping("/mark-all-read")
  public ResponseEntity<Void> markAllRead(
      @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("PUT /api/notifications/mark-all-read endpoint hit");
    notificationService.markAllRead(principal.getUserId());
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/{id}/read")
  public ResponseEntity<Void> markAsRead(
      @PathVariable Integer id,
      @AuthenticationPrincipal CustomUserPrincipal principal) {
    log.debug("PUT /api/notifications/{}/read endpoint hit", id);
    notificationService.markAsRead(id, principal.getUserId());
    return ResponseEntity.noContent().build();
  }
}
