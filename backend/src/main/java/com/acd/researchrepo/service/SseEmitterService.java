package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.external.notifications.NotificationResponse;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Manages Server-Sent Event connections for real-time notification delivery. Maintains a set of
 * emitters per user to support multiple simultaneous connections (e.g., multiple browser tabs).
 * Failed emitters (timeout, completion, error) are removed individually without affecting other
 * connections for the same user.
 */
@Slf4j
@Service
public class SseEmitterService {

  private final Map<Integer, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

  public SseEmitter addEmitter(Integer userId) {
    SseEmitter emitter = new SseEmitter(0L);
    Set<SseEmitter> userEmitters =
        emitters.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet());
    userEmitters.add(emitter);
    log.debug("Added emitter for user {} ({} active)", userId, userEmitters.size());

    Runnable cleanup =
        () -> {
          emitters.computeIfPresent(
              userId,
              (key, set) -> {
                set.remove(emitter);
                log.debug("Removed emitter for user {} ({} remaining)", userId, set.size());
                return set.isEmpty() ? null : set;
              });
        };

    emitter.onCompletion(cleanup);
    emitter.onTimeout(cleanup);
    emitter.onError(e -> cleanup.run());
    return emitter;
  }

  /**
   * Explicitly removes all emitters for a user. Each emitter is completed before removal.
   *
   * <p>Currently unused. Intended to disconnect a user's SSE streams when they log out.
   */
  public void removeEmitter(Integer userId) {
    Set<SseEmitter> userEmitters = emitters.remove(userId);
    if (userEmitters != null) {
      userEmitters.forEach(SseEmitter::complete);
      log.debug("Removed all emitters for user {}", userId);
    }
  }

  /**
   * Sends a notification event to all active SSE connections for a user. If an emitter fails, it is
   * removed individually without affecting other connections for the same user.
   */
  public void sendToUser(Integer userId, NotificationResponse dto) {
    Set<SseEmitter> userEmitters = emitters.get(userId);
    if (userEmitters == null || userEmitters.isEmpty()) {
      return;
    }

    log.debug("Sending notification to user {} ({} emitters)", userId, userEmitters.size());

    for (SseEmitter emitter : userEmitters) {
      try {
        emitter.send(SseEmitter.event().name("notification").data(dto));
      } catch (Exception e) {
        log.warn("Removing defunct emitter for user {}: {}", userId, e.getMessage());
        emitters.computeIfPresent(
            userId,
            (key, set) -> {
              set.remove(emitter);
              return set.isEmpty() ? null : set;
            });
      }
    }
  }
}
