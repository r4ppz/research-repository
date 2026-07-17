package com.acd.researchrepo.service;

import com.acd.researchrepo.dto.external.notifications.NotificationDto;
import com.acd.researchrepo.mapper.NotificationMapper;
import com.acd.researchrepo.model.Notification;
import com.acd.researchrepo.repository.NotificationRepository;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class SseEmitterService {

  // one emitter per user — second tab replaces first, use per-connection list if needed
  private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();

  public SseEmitter addEmitter(Integer userId) {
    SseEmitter emitter = new SseEmitter(0L);
    emitters.put(userId, emitter);
    emitter.onCompletion(() -> emitters.remove(userId));
    emitter.onTimeout(() -> emitters.remove(userId));
    emitter.onError(e -> emitters.remove(userId));
    return emitter;
  }

  public void removeEmitter(Integer userId) {
    emitters.remove(userId);
  }

  public void sendToUser(Integer userId, NotificationDto dto) {
    SseEmitter emitter = emitters.get(userId);
    if (emitter != null) {
      try {
        emitter.send(SseEmitter.event().name("notification").data(dto));
      } catch (IOException e) {
        emitters.remove(userId);
      }
    }
  }
}
