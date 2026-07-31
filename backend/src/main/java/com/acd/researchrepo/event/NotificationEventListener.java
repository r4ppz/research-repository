package com.acd.researchrepo.event;

import com.acd.researchrepo.service.SseEmitterService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listens for {@link NotificationCreatedEvent} and dispatches the notification via SSE after the
 * originating transaction commits. Prevents phantom notifications when a transaction rolls back.
 */
@Component
public class NotificationEventListener {

  private final SseEmitterService sseEmitterService;

  public NotificationEventListener(SseEmitterService sseEmitterService) {
    this.sseEmitterService = sseEmitterService;
  }

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
  public void handleNotificationCreated(NotificationCreatedEvent event) {
    sseEmitterService.sendToUser(event.userId(), event.dto());
  }
}
