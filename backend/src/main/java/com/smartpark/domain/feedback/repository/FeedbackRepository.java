package com.smartpark.domain.feedback.repository;

import com.smartpark.domain.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long>, JpaSpecificationExecutor<Feedback> {
    List<Feedback> findByCustomerId(Long customerId);
    List<Feedback> findByStatus(Feedback.FeedbackStatus status);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer"})
    org.springframework.data.domain.Page<Feedback> findAll(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.createdAt BETWEEN :from AND :to")
    Double getAverageRatingBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}
