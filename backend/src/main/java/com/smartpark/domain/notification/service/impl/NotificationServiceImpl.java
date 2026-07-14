package com.smartpark.domain.notification.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.employee.entity.Employee;
import com.smartpark.domain.employee.repository.EmployeeRepository;
import com.smartpark.domain.notification.dto.EmailDto;
import com.smartpark.domain.notification.dto.NotificationDto;
import com.smartpark.domain.notification.dto.PushDto;
import com.smartpark.domain.notification.dto.SmsDto;
import com.smartpark.domain.notification.entity.Notification;
import com.smartpark.domain.notification.entity.NotificationRecipient;
import com.smartpark.domain.notification.mapper.NotificationMapper;
import com.smartpark.domain.notification.repository.NotificationRecipientRepository;
import com.smartpark.domain.notification.repository.NotificationRepository;
import com.smartpark.domain.notification.service.EmailService;
import com.smartpark.domain.notification.service.NotificationService;
import com.smartpark.domain.notification.service.PushService;
import com.smartpark.domain.notification.service.SmsService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationRecipientRepository recipientRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;

    private final EmailService emailService;
    private final SmsService smsService;
    private final PushService pushService;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin tài khoản đăng nhập hiện tại: " + username));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto.Response> findAll(
            String search,
            String type,
            String priority,
            String status,
            Long userId,
            Long customerId,
            Long employeeId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    ) {
        Specification<Notification> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (search != null && !search.isBlank()) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("content")), "%" + search.toLowerCase() + "%")
                ));
            }
            if (type != null && !type.isBlank()) {
                try {
                    Notification.NotificationType t = Notification.NotificationType.valueOf(type.toUpperCase());
                    predicates.add(cb.equal(root.get("type"), t));
                } catch (IllegalArgumentException ignored) {}
            }
            if (priority != null && !priority.isBlank()) {
                try {
                    Notification.NotificationPriority p = Notification.NotificationPriority.valueOf(priority.toUpperCase());
                    predicates.add(cb.equal(root.get("priority"), p));
                } catch (IllegalArgumentException ignored) {}
            }
            if (status != null && !status.isBlank()) {
                try {
                    Notification.NotificationStatus s = Notification.NotificationStatus.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("status"), s));
                } catch (IllegalArgumentException ignored) {}
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            if (userId != null || customerId != null || employeeId != null) {
                Join<Notification, NotificationRecipient> recipientsJoin = root.join("recipients");
                if (userId != null) {
                    predicates.add(cb.equal(recipientsJoin.get("user").get("id"), userId));
                }
                if (customerId != null) {
                    predicates.add(cb.equal(recipientsJoin.get("customer").get("id"), customerId));
                }
                if (employeeId != null) {
                    predicates.add(cb.equal(recipientsJoin.get("employee").get("id"), employeeId));
                }
            }

            // Group by notification id to avoid duplicates if multiple recipients join
            query.distinct(true);

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return notificationRepository.findAll(spec, pageable)
                .map(n -> NotificationMapper.toResponse(n, n.getRecipients()));
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationDto.Response findById(Long id) {
        Notification notification = notificationRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        return NotificationMapper.toResponse(notification, notification.getRecipients());
    }

    @Override
    @Transactional
    public NotificationDto.Response create(NotificationDto.CreateRequest request) {
        Notification notification = Notification.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType())
                .priority(request.getPriority())
                .status(Notification.NotificationStatus.PENDING)
                .expirationTime(request.getExpirationTime())
                .recipients(new ArrayList<>())
                .build();

        Notification savedNotification = notificationRepository.save(notification);

        List<NotificationRecipient> recipients = new ArrayList<>();

        if (request.getUserIds() != null) {
            for (Long uid : request.getUserIds()) {
                userRepository.findById(uid).ifPresent(u -> {
                    recipients.add(NotificationRecipient.builder()
                            .notification(savedNotification)
                            .user(u)
                            .build());
                });
            }
        }

        if (request.getCustomerIds() != null) {
            for (Long cid : request.getCustomerIds()) {
                customerRepository.findById(cid).ifPresent(c -> {
                    NotificationRecipient.NotificationRecipientBuilder builder = NotificationRecipient.builder()
                            .notification(savedNotification)
                            .customer(c);
                    if (c.getUserId() != null) {
                        userRepository.findById(c.getUserId()).ifPresent(builder::user);
                    }
                    recipients.add(builder.build());
                });
            }
        }

        if (request.getEmployeeIds() != null) {
            for (Long eid : request.getEmployeeIds()) {
                employeeRepository.findById(eid).ifPresent(e -> {
                    NotificationRecipient.NotificationRecipientBuilder builder = NotificationRecipient.builder()
                            .notification(savedNotification)
                            .employee(e);
                    if (e.getUserId() != null) {
                        userRepository.findById(e.getUserId()).ifPresent(builder::user);
                    }
                    recipients.add(builder.build());
                });
            }
        }

        recipientRepository.saveAll(recipients);
        savedNotification.setRecipients(recipients);

        // Dispatch notifications via chosen channel
        boolean allSuccess = true;
        for (NotificationRecipient recipient : recipients) {
            try {
                if (savedNotification.getType() == Notification.NotificationType.EMAIL) {
                    String email = null;
                    if (recipient.getUser() != null) {
                        email = recipient.getUser().getEmail();
                    } else if (recipient.getCustomer() != null && recipient.getCustomer().getUserId() != null) {
                        email = userRepository.findById(recipient.getCustomer().getUserId())
                                .map(User::getEmail).orElse(null);
                    } else if (recipient.getEmployee() != null) {
                        email = recipient.getEmployee().getEmail();
                    }

                    if (email != null && !email.isBlank()) {
                        emailService.sendEmail(EmailDto.SendRequest.builder()
                                .recipient(email)
                                .subject(savedNotification.getTitle())
                                .htmlContent(savedNotification.getContent())
                                .build());
                        recipient.setDeliveryStatus(NotificationRecipient.DeliveryStatus.SENT);
                        recipient.setDeliveredAt(LocalDateTime.now());
                    } else {
                        throw new BusinessException("Không tìm thấy email người nhận");
                    }
                } else if (savedNotification.getType() == Notification.NotificationType.SMS) {
                    String phone = null;
                    if (recipient.getCustomer() != null) {
                        phone = recipient.getCustomer().getPhone();
                    } else if (recipient.getEmployee() != null) {
                        phone = recipient.getEmployee().getPhone();
                    }

                    if (phone != null && !phone.isBlank()) {
                        smsService.sendSms(SmsDto.SendRequest.builder()
                                .phoneNumber(phone)
                                .message(savedNotification.getContent())
                                .build());
                        recipient.setDeliveryStatus(NotificationRecipient.DeliveryStatus.SENT);
                        recipient.setDeliveredAt(LocalDateTime.now());
                    } else {
                        throw new BusinessException("Không tìm thấy số điện thoại người nhận");
                    }
                } else if (savedNotification.getType() == Notification.NotificationType.PUSH) {
                    // Mock push sending
                    pushService.sendPush(PushDto.SendRequest.builder()
                            .deviceToken("mock_device_token_for_user_" + (recipient.getUser() != null ? recipient.getUser().getId() : "recipient"))
                            .title(savedNotification.getTitle())
                            .message(savedNotification.getContent())
                            .build());
                    recipient.setDeliveryStatus(NotificationRecipient.DeliveryStatus.SENT);
                    recipient.setDeliveredAt(LocalDateTime.now());
                } else if (savedNotification.getType() == Notification.NotificationType.IN_APP) {
                    // In-app notifications are instantly available
                    recipient.setDeliveryStatus(NotificationRecipient.DeliveryStatus.SENT);
                    recipient.setDeliveredAt(LocalDateTime.now());
                }
            } catch (Exception e) {
                log.error("Failed to dispatch notification recipient {}", recipient.getId(), e);
                recipient.setDeliveryStatus(NotificationRecipient.DeliveryStatus.FAILED);
                recipient.setErrorMessage(e.getMessage());
                allSuccess = false;
            }
        }

        recipientRepository.saveAll(recipients);
        savedNotification.setStatus(allSuccess ? Notification.NotificationStatus.SENT : Notification.NotificationStatus.FAILED);
        Notification saved = notificationRepository.save(savedNotification);

        return NotificationMapper.toResponse(saved, saved.getRecipients());
    }

    @Override
    @Transactional
    public NotificationDto.Response update(Long id, NotificationDto.UpdateRequest request) {
        Notification notification = notificationRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));

        notification.setTitle(request.getTitle());
        notification.setContent(request.getContent());
        if (request.getPriority() != null) {
            notification.setPriority(request.getPriority());
        }
        notification.setExpirationTime(request.getExpirationTime());

        Notification saved = notificationRepository.save(notification);
        return NotificationMapper.toResponse(saved, saved.getRecipients());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Notification notification = notificationRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        notification.setDeletedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        User user = getCurrentUser();
        NotificationRecipient recipient = recipientRepository.findByNotificationIdAndUserId(id, user.getId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông báo hoặc bạn không phải người nhận thông báo này"));
        recipient.setReadStatus(NotificationRecipient.ReadStatus.READ);
        recipient.setReadAt(LocalDateTime.now());
        recipientRepository.save(recipient);
    }

    @Override
    @Transactional
    public void markAsUnread(Long id) {
        User user = getCurrentUser();
        NotificationRecipient recipient = recipientRepository.findByNotificationIdAndUserId(id, user.getId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông báo hoặc bạn không phải người nhận thông báo này"));
        recipient.setReadStatus(NotificationRecipient.ReadStatus.UNREAD);
        recipient.setReadAt(null);
        recipientRepository.save(recipient);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        recipientRepository.markAllAsReadForUser(user.getId(), LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User user = getCurrentUser();
        return recipientRepository.countUnreadByUserId(user.getId());
    }
}
