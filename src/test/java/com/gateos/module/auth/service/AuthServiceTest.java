package com.gateos.module.auth.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.auth.dto.LoginRequest;
import com.gateos.module.auth.dto.RegisterRequest;
import com.gateos.module.auth.dto.TokenResponse;
import com.gateos.module.auth.entity.Customer;
import com.gateos.module.auth.entity.Staff;
import com.gateos.module.auth.repository.CustomerRepository;
import com.gateos.module.auth.repository.StaffRepository;
import com.gateos.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "accessTokenExpiration", 3600000L);
    }

    // =================== loginCustomer tests ===================

    @Test
    void shouldLoginCustomer_WhenCredentialsValid() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("customer1");
        request.setPassword("password");

        Customer customer = Customer.builder()
                .id(1L)
                .username("customer1")
                .password("encoded-password")
                .fullName("John Doe")
                .email("john@example.com")
                .status(Customer.CustomerStatus.ACTIVE)
                .failedLoginAttempts(0)
                .build();

        when(customerRepository.findByUsername("customer1")).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches("password", "encoded-password")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any(UserDetails.class))).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any(UserDetails.class))).thenReturn("refresh-token");

        // Act
        TokenResponse response = authService.loginCustomer(request);

        // Assert
        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals(0, customer.getFailedLoginAttempts());
        assertNull(customer.getLockedUntil());
        verify(customerRepository).save(customer);
    }

    @Test
    void shouldThrowUnauthorized_WhenCustomerNotFound() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("password");

        when(customerRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.loginCustomer(request));
        assertEquals("ERR-AUTH-001", ex.getErrorCode());
        assertEquals("Email hoặc mật khẩu không chính xác", ex.getMessage());
    }

    @Test
    void shouldThrowUnauthorized_WhenCustomerLocked() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("lockeduser");
        request.setPassword("password");

        Customer customer = Customer.builder()
                .username("lockeduser")
                .lockedUntil(LocalDateTime.now().plusMinutes(10))
                .build();
        when(customerRepository.findByUsername("lockeduser")).thenReturn(Optional.of(customer));

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.loginCustomer(request));
        assertEquals("ERR-AUTH-002", ex.getErrorCode());
        assertTrue(ex.getMessage().contains("khóa tạm thời"));
    }

    @Test
    void shouldThrowUnauthorized_WhenCustomerInactive() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("inactiveuser");
        request.setPassword("password");

        Customer customer = Customer.builder()
                .username("inactiveuser")
                .status(Customer.CustomerStatus.INACTIVE)
                .build();
        when(customerRepository.findByUsername("inactiveuser")).thenReturn(Optional.of(customer));

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.loginCustomer(request));
        assertEquals("ERR-AUTH-002", ex.getErrorCode());
        assertEquals("Tài khoản đã bị vô hiệu hóa", ex.getMessage());
    }

    @Test
    void shouldThrowUnauthorizedAndIncrementAttempts_WhenCustomerPasswordWrong() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("customer1");
        request.setPassword("wrong-password");

        Customer customer = Customer.builder()
                .username("customer1")
                .password("encoded-password")
                .failedLoginAttempts(2)
                .status(Customer.CustomerStatus.ACTIVE)
                .build();

        when(customerRepository.findByUsername("customer1")).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.loginCustomer(request));
        assertEquals("ERR-AUTH-001", ex.getErrorCode());
        assertTrue(ex.getMessage().contains("Bạn còn 2 lần thử"));
        assertEquals(3, customer.getFailedLoginAttempts());
        verify(customerRepository).save(customer);
    }

    @Test
    void shouldLockCustomer_WhenAttemptsReachLimit() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("customer1");
        request.setPassword("wrong-password");

        Customer customer = Customer.builder()
                .username("customer1")
                .password("encoded-password")
                .failedLoginAttempts(4)
                .status(Customer.CustomerStatus.ACTIVE)
                .build();

        when(customerRepository.findByUsername("customer1")).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.loginCustomer(request));
        assertEquals("ERR-AUTH-001", ex.getErrorCode());
        assertEquals(5, customer.getFailedLoginAttempts());
        assertEquals(Customer.CustomerStatus.LOCKED, customer.getStatus());
        assertNotNull(customer.getLockedUntil());
        verify(customerRepository).save(customer);
    }

    // =================== loginStaff tests ===================

    @Test
    void shouldLoginStaff_WhenCredentialsValid() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("staff1");
        request.setPassword("password");

        Staff staff = Staff.builder()
                .id(1L)
                .username("staff1")
                .password("encoded-password")
                .fullName("Staff One")
                .email("staff@example.com")
                .role(Staff.StaffRole.MANAGER)
                .status(Staff.StaffStatus.ACTIVE)
                .failedLoginAttempts(0)
                .build();

        when(staffRepository.findByUsername("staff1")).thenReturn(Optional.of(staff));
        when(passwordEncoder.matches("password", "encoded-password")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any(UserDetails.class))).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any(UserDetails.class))).thenReturn("refresh-token");

        // Act
        TokenResponse response = authService.loginStaff(request);

        // Assert
        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals(0, staff.getFailedLoginAttempts());
        assertNull(staff.getLockedUntil());
        verify(staffRepository).save(staff);
    }

    @Test
    void shouldThrowUnauthorized_WhenStaffNotFound() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("password");

        when(staffRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.loginStaff(request));
        assertEquals("ERR-AUTH-001", ex.getErrorCode());
    }

    @Test
    void shouldThrowUnauthorized_WhenStaffLocked() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("lockedstaff");
        request.setPassword("password");

        Staff staff = Staff.builder()
                .username("lockedstaff")
                .lockedUntil(LocalDateTime.now().plusMinutes(10))
                .build();
        when(staffRepository.findByUsername("lockedstaff")).thenReturn(Optional.of(staff));

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.loginStaff(request));
        assertEquals("ERR-AUTH-002", ex.getErrorCode());
        assertTrue(ex.getMessage().contains("khóa tạm thời"));
    }

    @Test
    void shouldThrowUnauthorized_WhenStaffInactive() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("inactivestaff");
        request.setPassword("password");

        Staff staff = Staff.builder()
                .username("inactivestaff")
                .status(Staff.StaffStatus.INACTIVE)
                .build();
        when(staffRepository.findByUsername("inactivestaff")).thenReturn(Optional.of(staff));

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.loginStaff(request));
        assertEquals("ERR-AUTH-002", ex.getErrorCode());
        assertEquals("Tài khoản đã bị vô hiệu hóa", ex.getMessage());
    }

    @Test
    void shouldThrowUnauthorizedAndIncrementAttempts_WhenStaffPasswordWrong() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("staff1");
        request.setPassword("wrong-password");

        Staff staff = Staff.builder()
                .username("staff1")
                .password("encoded-password")
                .failedLoginAttempts(2)
                .status(Staff.StaffStatus.ACTIVE)
                .build();

        when(staffRepository.findByUsername("staff1")).thenReturn(Optional.of(staff));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.loginStaff(request));
        assertEquals("ERR-AUTH-001", ex.getErrorCode());
        assertEquals(3, staff.getFailedLoginAttempts());
        verify(staffRepository).save(staff);
    }

    @Test
    void shouldLockStaff_WhenAttemptsReachLimit() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("staff1");
        request.setPassword("wrong-password");

        Staff staff = Staff.builder()
                .username("staff1")
                .password("encoded-password")
                .failedLoginAttempts(4)
                .status(Staff.StaffStatus.ACTIVE)
                .build();

        when(staffRepository.findByUsername("staff1")).thenReturn(Optional.of(staff));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.loginStaff(request));
        assertEquals("ERR-AUTH-001", ex.getErrorCode());
        assertEquals(5, staff.getFailedLoginAttempts());
        assertEquals(Staff.StaffStatus.LOCKED, staff.getStatus());
        assertNotNull(staff.getLockedUntil());
        verify(staffRepository).save(staff);
    }

    // =================== register tests ===================

    @Test
    void shouldRegisterCustomer_WhenRequestIsValid() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("pass");
        request.setFullName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setPhone("0987654321");

        when(customerRepository.existsByUsername("newuser")).thenReturn(false);
        when(customerRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("encoded-pass");

        Customer saved = Customer.builder()
                .id(100L)
                .username("newuser")
                .password("encoded-pass")
                .fullName("Jane Doe")
                .email("jane@example.com")
                .phone("0987654321")
                .status(Customer.CustomerStatus.ACTIVE)
                .build();
        when(customerRepository.save(any(Customer.class))).thenReturn(saved);

        // Act
        Customer result = authService.register(request);

        // Assert
        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("newuser", result.getUsername());
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void shouldThrowConflict_WhenRegisteringDuplicateUsername() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("existinguser");
        request.setPassword("pass");
        request.setFullName("Name");
        request.setEmail("email@test.com");
        request.setPhone("123");

        when(customerRepository.existsByUsername("existinguser")).thenReturn(true);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.register(request));
        assertEquals("ERR-AUTH-005", ex.getErrorCode());
        assertEquals("Username đã được sử dụng", ex.getMessage());
    }

    @Test
    void shouldThrowConflict_WhenRegisteringDuplicateEmail() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("pass");
        request.setFullName("Name");
        request.setEmail("existing@test.com");
        request.setPhone("123");

        when(customerRepository.existsByUsername("newuser")).thenReturn(false);
        when(customerRepository.existsByEmail("existing@test.com")).thenReturn(true);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.register(request));
        assertEquals("ERR-AUTH-006", ex.getErrorCode());
        assertEquals("Email đã được đăng ký", ex.getMessage());
    }

    // =================== refreshToken tests ===================

    @Test
    void shouldRefreshToken_WhenTokenIsValid() {
        // Arrange
        String token = "valid-refresh-token";
        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.isRefreshToken(token)).thenReturn(true);
        when(jwtTokenProvider.extractUsername(token)).thenReturn("user1");
        when(jwtTokenProvider.extractRoles(token)).thenReturn(List.of("ROLE_CUSTOMER"));
        when(jwtTokenProvider.generateAccessToken(any(UserDetails.class))).thenReturn("new-access");
        when(jwtTokenProvider.generateRefreshToken(any(UserDetails.class))).thenReturn("new-refresh");

        // Act
        TokenResponse response = authService.refreshToken(token);

        // Assert
        assertNotNull(response);
        assertEquals("new-access", response.getAccessToken());
        assertEquals("new-refresh", response.getRefreshToken());
    }

    @Test
    void shouldThrowUnauthorized_WhenRefreshTokenInvalid() {
        // Arrange
        String token = "invalid-token";
        when(jwtTokenProvider.validateToken(token)).thenReturn(false);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.refreshToken(token));
        assertEquals("ERR-AUTH-003", ex.getErrorCode());
    }

    @Test
    void shouldThrowUnauthorized_WhenTokenIsNotRefreshToken() {
        // Arrange
        String token = "access-token-used-as-refresh";
        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.isRefreshToken(token)).thenReturn(false);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.refreshToken(token));
        assertEquals("ERR-AUTH-003", ex.getErrorCode());
    }
}
