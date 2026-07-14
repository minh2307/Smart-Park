package com.smartpark.domain.notification.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.notification.dto.SmsDto;
import com.smartpark.domain.notification.entity.SmsHistory;
import com.smartpark.domain.notification.mapper.SmsMapper;
import com.smartpark.domain.notification.repository.SmsHistoryRepository;
import com.smartpark.domain.notification.service.SmsService;
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
public class SmsServiceImpl implements SmsService {

    private final SmsHistoryRepository smsHistoryRepository;

    @Override
    @Transactional
    public SmsDto.Response sendSms(SmsDto.SendRequest request) {
        String phone = request.getPhoneNumber();
        boolean isValid = phone.matches("^(0|\\+84)[3|5|7|8|9][0-9]{8}$");

        SmsHistory history = SmsHistory.builder()
                .phoneNumber(phone)
                .message(request.getMessage())
                .deliveryStatus(SmsHistory.DeliveryStatus.PENDING)
                .build();
        smsHistoryRepository.save(history);

        if (!isValid) {
            history.setDeliveryStatus(SmsHistory.DeliveryStatus.FAILED);
            history.setErrorMessage("Số điện thoại không hợp lệ");
            smsHistoryRepository.save(history);
            throw new BusinessException("Số điện thoại không đúng định dạng Việt Nam");
        }

        // Mock SMS Send simulation
        history.setDeliveryStatus(SmsHistory.DeliveryStatus.SENT);
        history.setSentAt(LocalDateTime.now());
        smsHistoryRepository.save(history);

        return SmsMapper.toResponse(history);
    }

    @Override
    @Transactional
    public void sendSmsBulk(SmsDto.BulkSendRequest request) {
        for (String phone : request.getPhoneNumbers()) {
            try {
                sendSms(SmsDto.SendRequest.builder()
                        .phoneNumber(phone)
                        .message(request.getMessage())
                        .build());
            } catch (Exception ignored) {
                // Bulk sending shouldn't stop because of one bad phone number
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SmsDto.Response> findAllHistory(String phoneNumber, String status, Pageable pageable) {
        Specification<SmsHistory> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (phoneNumber != null && !phoneNumber.isBlank()) {
                predicates.add(cb.like(root.get("phoneNumber"), "%" + phoneNumber + "%"));
            }
            if (status != null && !status.isBlank()) {
                try {
                    SmsHistory.DeliveryStatus deliveryStatus = SmsHistory.DeliveryStatus.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("deliveryStatus"), deliveryStatus));
                } catch (IllegalArgumentException ignored) {}
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return smsHistoryRepository.findAll(spec, pageable).map(SmsMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SmsDto.Response findHistoryById(Long id) {
        SmsHistory history = smsHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SmsHistory", id));
        return SmsMapper.toResponse(history);
    }
}
