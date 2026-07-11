package com.smartpark.domain.bi.repository;

import com.smartpark.domain.bi.entity.AnalyticsDeadLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnalyticsDeadLetterRepository extends JpaRepository<AnalyticsDeadLetter, Long> {
}
