package com.smartpark.domain.notification.repository;

import com.smartpark.domain.notification.entity.NotificationRecipient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, Long>, JpaSpecificationExecutor<NotificationRecipient> {

    List<NotificationRecipient> findByNotificationId(Long notificationId);

    Optional<NotificationRecipient> findByNotificationIdAndUserId(Long notificationId, Long userId);

    @Query("SELECT r FROM NotificationRecipient r WHERE r.user.id = :userId AND r.notification.deletedAt IS NULL ORDER BY r.notification.createdAt DESC")
    Page<NotificationRecipient> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(r) FROM NotificationRecipient r WHERE r.user.id = :userId AND r.readStatus = 'UNREAD' AND r.notification.deletedAt IS NULL")
    long countUnreadByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE NotificationRecipient r SET r.readStatus = 'READ', r.readAt = :now WHERE r.user.id = :userId AND r.readStatus = 'UNREAD'")
    void markAllAsReadForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
