package com.smartpark.domain.feedback.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.feedback.entity.Feedback;
import com.smartpark.domain.feedback.repository.FeedbackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceTest {

    @Mock private FeedbackRepository feedbackRepository;
    @InjectMocks private FeedbackService feedbackService;

    private Feedback feedback;

    @BeforeEach
    void setUp() {
        feedback = new Feedback();
        feedback.setId(1L);
        feedback.setCategory(Feedback.FeedbackCategory.RIDE);
        feedback.setContent("Loved it!");
        feedback.setRating(5);
        feedback.setStatus(Feedback.FeedbackStatus.OPEN);
    }

    @Test
    void findAll_ShouldReturnPage() {
        when(feedbackRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(feedback)));
        Page<Feedback> result = feedbackService.findAll(PageRequest.of(0, 10));
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void create_ShouldSaveFeedback() {
        when(feedbackRepository.save(any())).thenReturn(feedback);
        Feedback result = feedbackService.create(feedback);
        assertThat(result.getContent()).isEqualTo("Loved it!");
    }

    @Test
    void updateStatus_ShouldUpdate_WhenExists() {
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));
        when(feedbackRepository.save(any())).thenReturn(feedback);

        Feedback result = feedbackService.updateStatus(1L, Feedback.FeedbackStatus.RESOLVED);
        assertThat(result.getStatus()).isEqualTo(Feedback.FeedbackStatus.RESOLVED);
    }

    @Test
    void updateStatus_ShouldThrow_WhenNotFound() {
        when(feedbackRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> feedbackService.updateStatus(1L, Feedback.FeedbackStatus.RESOLVED))
                .isInstanceOf(BusinessException.class);
    }
}
