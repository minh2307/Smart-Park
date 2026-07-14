package com.smartpark.domain.feedback.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.feedback.dto.FeedbackDto;
import com.smartpark.domain.feedback.entity.Feedback;
import com.smartpark.domain.feedback.entity.Feedback.FeedbackCategory;
import com.smartpark.domain.feedback.entity.Feedback.FeedbackStatus;
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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceTest {

    @Mock private FeedbackRepository feedbackRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private UserRepository userRepository;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks private FeedbackService feedbackService;

    private User user;
    private Customer customer;
    private Feedback feedback;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(10L);
        user.setUsername("testuser");

        customer = new Customer();
        customer.setId(20L);
        customer.setFullName("Test Customer");
        customer.setUserId(user.getId());

        feedback = new Feedback();
        feedback.setId(1L);
        feedback.setCustomer(customer);
        feedback.setCategory(FeedbackCategory.RIDE);
        feedback.setContent("Loved it!");
        feedback.setRating(5);
        feedback.setStatus(FeedbackStatus.OPEN);
    }

    private void mockSecurityContext() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAllFeedbacksWithFilters_ShouldReturnPage() {
        Page<Feedback> page = new PageImpl<>(List.of(feedback));
        when(feedbackRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);

        Page<FeedbackDto.Response> result = feedbackService.findAllFeedbacksWithFilters(
                5, FeedbackCategory.RIDE, "Loved", FeedbackStatus.OPEN, PageRequest.of(0, 10)
        );

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getContent()).isEqualTo("Loved it!");
    }

    @Test
    void findFeedbackById_ShouldReturnDto_WhenFound() {
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));
        FeedbackDto.Response result = feedbackService.findFeedbackById(1L);
        assertThat(result.getContent()).isEqualTo("Loved it!");
    }

    @Test
    void findFeedbackById_ShouldThrow_WhenNotFound() {
        when(feedbackRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> feedbackService.findFeedbackById(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createFeedback_ShouldSave_WhenValid() {
        mockSecurityContext();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(customerRepository.findByUserId(10L)).thenReturn(Optional.of(customer));
        when(feedbackRepository.save(any(Feedback.class))).thenReturn(feedback);

        FeedbackDto.CreateRequest request = FeedbackDto.CreateRequest.builder()
                .category(FeedbackCategory.RIDE)
                .content("Loved it!")
                .rating(5)
                .build();

        FeedbackDto.Response result = feedbackService.createFeedback(request);
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("Loved it!");
    }

    @Test
    void updateFeedback_ShouldUpdateFields() {
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));
        when(feedbackRepository.save(any(Feedback.class))).thenReturn(feedback);

        FeedbackDto.UpdateRequest request = FeedbackDto.UpdateRequest.builder()
                .content("New content")
                .rating(4)
                .status(FeedbackStatus.RESOLVED)
                .build();

        FeedbackDto.Response result = feedbackService.updateFeedback(1L, request);
        assertThat(result.getContent()).isEqualTo("New content");
        assertThat(result.getRating()).isEqualTo(4);
        assertThat(result.getStatus()).isEqualTo(FeedbackStatus.RESOLVED);
    }

    @Test
    void deleteFeedback_ShouldDelete_WhenFound() {
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));
        doNothing().when(feedbackRepository).delete(feedback);

        feedbackService.deleteFeedback(1L);
        verify(feedbackRepository, times(1)).delete(feedback);
    }
}
