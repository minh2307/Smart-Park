package com.smartpark.domain.notification.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.notification.dto.PushDto;
import com.smartpark.domain.notification.entity.PushHistory;
import com.smartpark.domain.notification.mapper.PushMapper;
import com.smartpark.domain.notification.repository.PushHistoryRepository;
import com.smartpark.domain.notification.service.PushService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PushServiceImpl implements PushService {

    private final PushHistoryRepository pushHistoryRepository;

    @Override
    @Transactional
    public PushDto.Response sendPush(PushDto.SendRequest request) {
        String token = request.getDeviceToken();
        boolean isValid = token != null && token.trim().length() >= 10;

        PushHistory history = PushHistory.builder()
                .deviceToken(token)
                .topic(request.getTopic())
                .title(request.getTitle())
                .message(request.getMessage())
                .imageUrl(request.getImageUrl())
                .sendStatus(PushHistory.SendStatus.PENDING)
                .build();
        pushHistoryRepository.save(history);

        if (!isValid) {
            history.setSendStatus(PushHistory.SendStatus.FAILED);
            history.setErrorMessage("Device token không hợp lệ");
            pushHistoryRepository.save(history);
            throw new BusinessException("Device token không hợp lệ (phải từ 10 ký tự trở lên)");
        }

        // Mock FCM sending simulation
        history.setSendStatus(PushHistory.SendStatus.SENT);
        history.setSentAt(LocalDateTime.now());
        pushHistoryRepository.save(history);

        return PushMapper.toResponse(history);
    }

    @Override
    @Transactional
    public void sendPushBulk(PushDto.BulkSendRequest request) {
        for (String token : request.getDeviceTokens()) {
            try {
                sendPush(PushDto.SendRequest.builder()
                        .deviceToken(token)
                        .topic(request.getTopic())
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .imageUrl(request.getImageUrl())
                        .build());
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PushDto.Response> findAllHistory(String deviceToken, String status, Pageable pageable) {
        Specification<PushHistory> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (deviceToken != null && !deviceToken.isBlank()) {
                predicates.add(cb.like(root.get("deviceToken"), "%" + deviceToken + "%"));
            }
            if (status != null && !status.isBlank()) {
                try {
                    PushHistory.SendStatus sendStatus = PushHistory.SendStatus.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("sendStatus"), sendStatus));
                } catch (IllegalArgumentException ignored) {}
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return pushHistoryRepository.findAll(spec, pageable).map(PushMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PushDto.Response findHistoryById(Long id) {
        PushHistory history = pushHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PushHistory", id));
        return PushMapper.toResponse(history);
    }
}
