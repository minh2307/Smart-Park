package com.smartpark.domain.notification.service;

import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.notification.dto.NotificationTemplateDto;
import com.smartpark.domain.notification.entity.Notification;
import com.smartpark.domain.notification.entity.NotificationTemplate;
import com.smartpark.domain.notification.repository.NotificationTemplateRepository;
import com.smartpark.domain.notification.service.impl.NotificationTemplateServiceImpl;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationTemplateServiceTest {

    @Mock
    private NotificationTemplateRepository templateRepository;

    @InjectMocks
    private NotificationTemplateServiceImpl templateService;

    private NotificationTemplate testTemplate;

    @BeforeEach
    void setUp() {
        testTemplate = NotificationTemplate.builder()
                .id(1L)
                .templateCode("WELCOME_TEMPLATE")
                .templateName("Welcome Email")
                .subject("Welcome to Smart Park, ${name}!")
                .body("Hi ${name}, thank you for registering.")
                .channel(Notification.NotificationType.EMAIL)
                .active(true)
                .build();
    }

    @Test
    void findAll_ShouldReturnPageOfTemplates() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<NotificationTemplate> page = new PageImpl<>(List.of(testTemplate), pageable, 1);

        when(templateRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<NotificationTemplateDto.Response> result = templateService.findAll(null, null, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("WELCOME_TEMPLATE", result.getContent().get(0).getTemplateCode());
    }

    @Test
    void findById_ShouldReturnTemplate_WhenExists() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));

        NotificationTemplateDto.Response result = templateService.findById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("WELCOME_TEMPLATE", result.getTemplateCode());
    }

    @Test
    void findById_ShouldThrowException_WhenNotFound() {
        when(templateRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> templateService.findById(999L));
    }

    @Test
    void create_ShouldSaveTemplate_WhenCodeIsUnique() {
        NotificationTemplateDto.CreateRequest request = NotificationTemplateDto.CreateRequest.builder()
                .templateCode("NEW_TEMPLATE")
                .templateName("New Template")
                .subject("Title")
                .body("Content")
                .channel(Notification.NotificationType.SMS)
                .build();

        when(templateRepository.existsByTemplateCode("NEW_TEMPLATE")).thenReturn(false);
        when(templateRepository.save(any(NotificationTemplate.class))).thenAnswer(i -> {
            NotificationTemplate saved = i.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        NotificationTemplateDto.Response result = templateService.create(request);

        assertNotNull(result);
        assertEquals(2L, result.getId());
        assertEquals("NEW_TEMPLATE", result.getTemplateCode());
        verify(templateRepository, times(1)).save(any(NotificationTemplate.class));
    }

    @Test
    void create_ShouldThrowConflictException_WhenCodeExists() {
        NotificationTemplateDto.CreateRequest request = NotificationTemplateDto.CreateRequest.builder()
                .templateCode("WELCOME_TEMPLATE")
                .templateName("Welcome Email")
                .subject("Welcome to Smart Park, ${name}!")
                .body("Hi ${name}, thank you for registering.")
                .channel(Notification.NotificationType.EMAIL)
                .build();

        when(templateRepository.existsByTemplateCode("WELCOME_TEMPLATE")).thenReturn(true);

        assertThrows(BusinessException.class, () -> templateService.create(request));
        verify(templateRepository, never()).save(any(NotificationTemplate.class));
    }

    @Test
    void update_ShouldModifyFields_WhenTemplateExists() {
        NotificationTemplateDto.UpdateRequest request = NotificationTemplateDto.UpdateRequest.builder()
                .templateName("Updated Name")
                .subject("Updated Title")
                .body("Updated Content")
                .channel(Notification.NotificationType.EMAIL)
                .build();

        when(templateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));
        when(templateRepository.save(any(NotificationTemplate.class))).thenAnswer(i -> i.getArgument(0));

        NotificationTemplateDto.Response result = templateService.update(1L, request);

        assertNotNull(result);
        assertEquals("Updated Name", result.getTemplateName());
        assertEquals("Updated Title", result.getSubject());
        assertEquals("Updated Content", result.getBody());
    }

    @Test
    void delete_ShouldCallRepositoryDelete() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));

        templateService.delete(1L);

        verify(templateRepository, times(1)).delete(testTemplate);
    }

    @Test
    void toggleActive_ShouldInvertActiveFlag() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));
        when(templateRepository.save(any(NotificationTemplate.class))).thenAnswer(i -> i.getArgument(0));

        assertTrue(testTemplate.isActive());

        NotificationTemplateDto.Response result = templateService.toggleActive(1L);

        assertFalse(result.isActive());
        verify(templateRepository, times(1)).save(testTemplate);
    }
}
