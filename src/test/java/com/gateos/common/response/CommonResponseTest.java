package com.gateos.common.response;

import com.gateos.common.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CommonResponseTest {

    @Test
    @SuppressWarnings("unchecked")
    void testPageResponse_Of() {
        Page<List<String>> page = new PageImpl<>((List) List.of("item1", "item2"), PageRequest.of(0, 10), 2);
        PageResponse<List<String>> response = PageResponse.of(page);

        assertNotNull(response);
        assertEquals(2, response.getContent().size());
        assertEquals(0, response.getPageNumber());
        assertEquals(10, response.getPageSize());
        assertEquals(2L, response.getTotalElements());
        assertEquals(1, response.getTotalPages());
        assertTrue(response.isLast());
        assertNotNull(response.getTimestamp());
    }

    @Test
    void testApiResponse_BuilderAndGetters() {
        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .success(true)
                .message("Success Msg")
                .data("Data Payload")
                .errorCode("ERR-0")
                .build();

        assertTrue(apiResponse.isSuccess());
        assertEquals("Success Msg", apiResponse.getMessage());
        assertEquals("Data Payload", apiResponse.getData());
        assertEquals("ERR-0", apiResponse.getErrorCode());
        assertNotNull(apiResponse.getTimestamp());
    }

    @Test
    void testBusinessException_Constructors() {
        BusinessException ex1 = new BusinessException("Bad Request Msg", "ERR-CODE", HttpStatus.BAD_REQUEST);
        assertEquals(HttpStatus.BAD_REQUEST, ex1.getHttpStatus());
        assertEquals("Bad Request Msg", ex1.getMessage());
        assertEquals("ERR-CODE", ex1.getErrorCode());

        BusinessException ex2 = BusinessException.conflict("Conflict Msg", "ERR-1");
        assertEquals(HttpStatus.CONFLICT, ex2.getHttpStatus());
        assertEquals("Conflict Msg", ex2.getMessage());
        assertEquals("ERR-1", ex2.getErrorCode());

        BusinessException ex3 = BusinessException.unauthorized("Unauthorized Msg", "ERR-UNAUTHORIZED");
        assertEquals(HttpStatus.UNAUTHORIZED, ex3.getHttpStatus());
        assertEquals("Unauthorized Msg", ex3.getMessage());
        assertEquals("ERR-UNAUTHORIZED", ex3.getErrorCode());
    }
}
