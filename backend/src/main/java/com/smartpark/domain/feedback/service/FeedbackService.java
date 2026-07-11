package com.smartpark.domain.feedback.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.feedback.entity.Feedback;
import com.smartpark.domain.feedback.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Transactional(readOnly = true)
    public Page<Feedback> findAll(Pageable pageable) {
        return feedbackRepository.findAll(pageable);
    }

    @Transactional
    public Feedback create(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

    @Transactional
    public Feedback updateStatus(Long id, Feedback.FeedbackStatus status) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Phản hồi không tồn tại: " + id));
        feedback.setStatus(status);
        return feedbackRepository.save(feedback);
    }
}
