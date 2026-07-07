package com.gateos.common.exception;

import com.gateos.common.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @Mock
    private BindingResult bindingResult;

    @Mock
    private MethodParameter methodParameter;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void shouldHandleBusinessException() {
        // Arrange
        BusinessException ex = new BusinessException("Venue not found", "ERR-VEN-003", HttpStatus.NOT_FOUND);

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleBusinessException(ex);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Venue not found", response.getBody().getMessage());
        assertEquals("ERR-VEN-003", response.getBody().getErrorCode());
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldHandleMethodArgumentNotValidException() {
        // Arrange
        FieldError fieldError = new FieldError("objectName", "name", "Name is required");
        when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

        // Act
        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleValidationException(ex);

        // Assert
        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals("Dữ liệu không hợp lệ", response.getBody().get("message"));
        assertEquals("ERR-VALIDATION-001", response.getBody().get("errorCode"));
        
        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertNotNull(errors);
        assertEquals("Name is required", errors.get("name"));
    }

    @Test
    void shouldHandleConstraintViolationException() {
        // Arrange
        ConstraintViolationException ex = new ConstraintViolationException("Invalid constraint", Collections.emptySet());

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleConstraintViolation(ex);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Invalid constraint", response.getBody().getMessage());
        assertEquals("ERR-VALIDATION-002", response.getBody().getErrorCode());
    }

    @Test
    void shouldHandleBadCredentialsException() {
        // Arrange
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleBadCredentials(ex);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Email hoặc mật khẩu không chính xác", response.getBody().getMessage());
        assertEquals("ERR-AUTH-001", response.getBody().getErrorCode());
    }

    @Test
    void shouldHandleLockedException() {
        // Arrange
        LockedException ex = new LockedException("Account locked");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleLocked(ex);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Tài khoản đã bị khóa tạm thời", response.getBody().getMessage());
        assertEquals("ERR-AUTH-002", response.getBody().getErrorCode());
    }

    @Test
    void shouldHandleDisabledException() {
        // Arrange
        DisabledException ex = new DisabledException("Account disabled");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleDisabled(ex);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Tài khoản đã bị vô hiệu hóa", response.getBody().getMessage());
        assertEquals("ERR-AUTH-002", response.getBody().getErrorCode());
    }

    @Test
    void shouldHandleJwtException() {
        // Arrange
        Exception ex = new Exception("JWT expired");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleJwtException(ex);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Token không hợp lệ hoặc đã hết hạn", response.getBody().getMessage());
        assertEquals("ERR-AUTH-003", response.getBody().getErrorCode());
    }

    @Test
    void shouldHandleAccessDeniedException() {
        // Arrange
        AccessDeniedException ex = new AccessDeniedException("Access denied");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleAccessDenied(ex);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Bạn không có quyền truy cập tài nguyên này", response.getBody().getMessage());
        assertEquals("ERR-AUTH-004", response.getBody().getErrorCode());
    }

    @Test
    void shouldHandleGenericException() {
        // Arrange
        Exception ex = new RuntimeException("Something went wrong");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleGenericException(ex);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Lỗi hệ thống. Vui lòng thử lại sau", response.getBody().getMessage());
        assertEquals("ERR-SYS-001", response.getBody().getErrorCode());
    }
}
