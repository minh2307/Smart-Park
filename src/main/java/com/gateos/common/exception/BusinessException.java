package com.gateos.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus httpStatus;

    public BusinessException(String message, String errorCode, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    // ---- Factory methods ----
    public static BusinessException notFound(String message, String errorCode) {
        return new BusinessException(message, errorCode, HttpStatus.NOT_FOUND);
    }

    public static BusinessException badRequest(String message, String errorCode) {
        return new BusinessException(message, errorCode, HttpStatus.BAD_REQUEST);
    }

    public static BusinessException conflict(String message, String errorCode) {
        return new BusinessException(message, errorCode, HttpStatus.CONFLICT);
    }

    public static BusinessException unauthorized(String message, String errorCode) {
        return new BusinessException(message, errorCode, HttpStatus.UNAUTHORIZED);
    }

    public static BusinessException forbidden(String message, String errorCode) {
        return new BusinessException(message, errorCode, HttpStatus.FORBIDDEN);
    }
}
