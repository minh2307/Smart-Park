package com.smartpark.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Ném khi có xung đột dữ liệu (409) - ví dụ: duplicate booking, double payment.
 */
public class ConflictException extends BusinessException {

    public ConflictException(String message) {
        super(HttpStatus.CONFLICT, "ERR-CONFLICT-409", message);
    }

    public ConflictException(String errorCode, String message) {
        super(HttpStatus.CONFLICT, errorCode, message);
    }
}
