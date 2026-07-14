package com.smartpark.domain.notification.service;

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
import com.smartpark.domain.notification.repository.NotificationRecipientRepository;
import com.smartpark.domain.notification.repository.NotificationRepository;
import com.smartpark.domain.notification.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationRecipientRepository recipientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private SmsService smsService;

    @Mock
    private PushService pushService;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User testUser;
    private Customer testCustomer;
    private Employee testEmployee;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("test_user")
                .email("test@smartpark.com")
                .build();

        testCustomer = Customer.builder()
                .id(10L)
                .fullName("Customer Name")
                .phone("0912345678")
                .userId(1L)
                .build();

        testEmployee = Employee.builder()
                .id(20L)
                .fullName("Employee Name")
                .phone("0987654321")
                .email("emp@smartpark.com")
                .userId(2L)
                .build();

        testNotification = Notification.builder()
                .id(100L)
                .title("Welcome to Smart Park")
                .content("We hope you enjoy your visit!")
                .type(Notification.NotificationType.IN_APP)
                .priority(Notification.NotificationPriority.MEDIUM)
                .status(Notification.NotificationStatus.SENT)
                .build();
    }

    private void mockSecurityContext(String username) {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(username);
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(context);
    }

    @Test
    void findAll_ShouldReturnPageOfNotifications() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Notification> list = List.of(testNotification);
        Page<Notification> page = new PageImpl<>(list, pageable, 1);

        when(notificationRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<NotificationDto.Response> result = notificationService.findAll(
                null, null, null, null, null, null, null, null, null, pageable
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Welcome to Smart Park", result.getContent().get(0).getTitle());
    }

    @Test
    void findById_ShouldReturnNotification_WhenExists() {
        when(notificationRepository.findByIdAndDeletedAtIsNull(100L)).thenReturn(Optional.of(testNotification));

        NotificationDto.Response result = notificationService.findById(100L);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("Welcome to Smart Park", result.getTitle());
    }

    @Test
    void findById_ShouldThrowException_WhenNotFound() {
        when(notificationRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> notificationService.findById(999L));
    }

    @Test
    void create_InAppNotification_ShouldSucceed() {
        NotificationDto.CreateRequest request = NotificationDto.CreateRequest.builder()
                .title("In-app title")
                .content("In-app body")
                .type(Notification.NotificationType.IN_APP)
                .userIds(List.of(1L))
                .build();

        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        NotificationDto.Response response = notificationService.create(request);

        assertNotNull(response);
        assertEquals("In-app title", response.getTitle());
        assertEquals(Notification.NotificationStatus.SENT, response.getStatus());
        verify(recipientRepository, times(2)).saveAll(anyList()); // saves recipients before and after dispatch
    }

    @Test
    void create_EmailNotification_ShouldCallEmailService() {
        NotificationDto.CreateRequest request = NotificationDto.CreateRequest.builder()
                .title("Email Title")
                .content("Email Body")
                .type(Notification.NotificationType.EMAIL)
                .userIds(List.of(1L))
                .build();

        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(emailService.sendEmail(any(EmailDto.SendRequest.class))).thenReturn(mock(EmailDto.Response.class));

        NotificationDto.Response response = notificationService.create(request);

        assertNotNull(response);
        verify(emailService, times(1)).sendEmail(any(EmailDto.SendRequest.class));
    }

    @Test
    void create_SmsNotification_ShouldCallSmsService() {
        NotificationDto.CreateRequest request = NotificationDto.CreateRequest.builder()
                .title("SMS Title")
                .content("SMS Body")
                .type(Notification.NotificationType.SMS)
                .customerIds(List.of(10L))
                .build();

        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));
        when(customerRepository.findById(10L)).thenReturn(Optional.of(testCustomer));
        when(smsService.sendSms(any(SmsDto.SendRequest.class))).thenReturn(mock(SmsDto.Response.class));

        NotificationDto.Response response = notificationService.create(request);

        assertNotNull(response);
        verify(smsService, times(1)).sendSms(any(SmsDto.SendRequest.class));
    }

    @Test
    void create_PushNotification_ShouldCallPushService() {
        NotificationDto.CreateRequest request = NotificationDto.CreateRequest.builder()
                .title("Push Title")
                .content("Push Body")
                .type(Notification.NotificationType.PUSH)
                .userIds(List.of(1L))
                .build();

        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(pushService.sendPush(any(PushDto.SendRequest.class))).thenReturn(mock(PushDto.Response.class));

        NotificationDto.Response response = notificationService.create(request);

        assertNotNull(response);
        verify(pushService, times(1)).sendPush(any(PushDto.SendRequest.class));
    }

    @Test
    void update_ShouldModifyFields() {
        NotificationDto.UpdateRequest request = NotificationDto.UpdateRequest.builder()
                .title("Updated Title")
                .content("Updated Body")
                .priority(Notification.NotificationPriority.HIGH)
                .build();

        when(notificationRepository.findByIdAndDeletedAtIsNull(100L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        NotificationDto.Response response = notificationService.update(100L, request);

        assertNotNull(response);
        assertEquals("Updated Title", response.getTitle());
        assertEquals("Updated Body", response.getContent());
        assertEquals(Notification.NotificationPriority.HIGH, response.getPriority());
    }

    @Test
    void delete_ShouldSetDeletedAt() {
        when(notificationRepository.findByIdAndDeletedAtIsNull(100L)).thenReturn(Optional.of(testNotification));

        notificationService.delete(100L);

        assertNotNull(testNotification.getDeletedAt());
        verify(notificationRepository, times(1)).save(testNotification);
    }

    @Test
    void markAsRead_ShouldUpdateReadStatus() {
        mockSecurityContext("test_user");
        when(userRepository.findByUsername("test_user")).thenReturn(Optional.of(testUser));

        NotificationRecipient recipient = NotificationRecipient.builder()
                .id(1L)
                .readStatus(NotificationRecipient.ReadStatus.UNREAD)
                .build();

        when(recipientRepository.findByNotificationIdAndUserId(100L, 1L)).thenReturn(Optional.of(recipient));

        notificationService.markAsRead(100L);

        assertEquals(NotificationRecipient.ReadStatus.READ, recipient.getReadStatus());
        assertNotNull(recipient.getReadAt());
        verify(recipientRepository, times(1)).save(recipient);
    }

    @Test
    void markAsUnread_ShouldUpdateReadStatus() {
        mockSecurityContext("test_user");
        when(userRepository.findByUsername("test_user")).thenReturn(Optional.of(testUser));

        NotificationRecipient recipient = NotificationRecipient.builder()
                .id(1L)
                .readStatus(NotificationRecipient.ReadStatus.READ)
                .readAt(LocalDateTime.now())
                .build();

        when(recipientRepository.findByNotificationIdAndUserId(100L, 1L)).thenReturn(Optional.of(recipient));

        notificationService.markAsUnread(100L);

        assertEquals(NotificationRecipient.ReadStatus.UNREAD, recipient.getReadStatus());
        assertNull(recipient.getReadAt());
        verify(recipientRepository, times(1)).save(recipient);
    }

    @Test
    void markAllAsRead_ShouldCallRepository() {
        mockSecurityContext("test_user");
        when(userRepository.findByUsername("test_user")).thenReturn(Optional.of(testUser));

        notificationService.markAllAsRead();

        verify(recipientRepository, times(1)).markAllAsReadForUser(eq(1L), any(LocalDateTime.class));
    }

    @Test
    void getUnreadCount_ShouldReturnCount() {
        mockSecurityContext("test_user");
        when(userRepository.findByUsername("test_user")).thenReturn(Optional.of(testUser));
        when(recipientRepository.countUnreadByUserId(1L)).thenReturn(5L);

        long count = notificationService.getUnreadCount();

        assertEquals(5L, count);
    }
}
