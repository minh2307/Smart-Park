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
import com.smartpark.domain.feedback.mapper.FeedbackMapper;
import com.smartpark.domain.feedback.repository.FeedbackRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin tài khoản đăng nhập hiện tại: " + username));
    }

    private Customer getCurrentCustomer(User user) {
        return customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Tài khoản của bạn chưa liên kết với thông tin Khách hàng"));
    }

    @Transactional(readOnly = true)
    public Page<FeedbackDto.Response> findAllFeedbacksWithFilters(
            Integer rating,
            FeedbackCategory category,
            String search,
            FeedbackStatus status,
            Pageable pageable
    ) {
        Specification<Feedback> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (rating != null) {
                predicates.add(cb.equal(root.get("rating"), rating));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("content")), pattern));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return feedbackRepository.findAll(spec, pageable).map(FeedbackMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public FeedbackDto.Response findFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback", id));
        return FeedbackMapper.toResponseDto(feedback);
    }

    @Transactional
    public FeedbackDto.Response createFeedback(FeedbackDto.CreateRequest request) {
        User user = getCurrentUser();
        Customer customer = getCurrentCustomer(user);

        Feedback feedback = Feedback.builder()
                .customer(customer)
                .category(request.getCategory())
                .content(request.getContent())
                .rating(request.getRating())
                .status(FeedbackStatus.OPEN)
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        return FeedbackMapper.toResponseDto(saved);
    }

    @Transactional
    public FeedbackDto.Response updateFeedback(Long id, FeedbackDto.UpdateRequest request) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback", id));

        if (request.getCategory() != null) {
            feedback.setCategory(request.getCategory());
        }
        if (request.getContent() != null) {
            feedback.setContent(request.getContent());
        }
        if (request.getRating() != null) {
            feedback.setRating(request.getRating());
        }
        if (request.getStatus() != null) {
            feedback.setStatus(request.getStatus());
        }
        if (request.getAssignedEmployeeId() != null) {
            feedback.setAssignedEmployeeId(request.getAssignedEmployeeId());
        }

        Feedback saved = feedbackRepository.save(feedback);
        return FeedbackMapper.toResponseDto(saved);
    }

    @Transactional
    public void deleteFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback", id));
        feedbackRepository.delete(feedback);
    }
}
