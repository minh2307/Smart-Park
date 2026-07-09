package com.smartpark.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {

    private final HttpStatus httpStatus;
    private final String errorCode;

    public BusinessException(String message) {
        super(message);
        this.httpStatus = HttpStatus.BAD_REQUEST;
        this.errorCode = "ERR-BUSINESS-001";
    }

    public BusinessException(String errorCode, String message) {
        super(message);
        this.httpStatus = HttpStatus.BAD_REQUEST;
        this.errorCode = errorCode;
    }

    public BusinessException(HttpStatus httpStatus, String errorCode, String message) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
    }
}
