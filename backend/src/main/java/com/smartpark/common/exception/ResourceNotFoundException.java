package com.smartpark.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Ném khi resource không tồn tại (404).
 */
public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(
            HttpStatus.NOT_FOUND,
            "ERR-404-" + resourceName.toUpperCase().replace(" ", "_"),
            String.format("'%s' không tồn tại: %s", resourceName, identifier)
        );
    }
}
