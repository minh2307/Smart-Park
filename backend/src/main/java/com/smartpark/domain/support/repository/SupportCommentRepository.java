package com.smartpark.domain.support.repository;

import com.smartpark.domain.support.entity.SupportComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportCommentRepository extends JpaRepository<SupportComment, Long> {
    List<SupportComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
