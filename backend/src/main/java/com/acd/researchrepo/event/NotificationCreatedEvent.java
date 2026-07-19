package com.acd.researchrepo.event;

import com.acd.researchrepo.dto.external.notifications.NotificationDto;

/**
 * Event published after a notification is persisted, triggering SSE delivery after the transaction
 * commits. Listened to by {@link NotificationEventListener}.
 */
public record NotificationCreatedEvent(Integer userId, NotificationDto dto) {}
