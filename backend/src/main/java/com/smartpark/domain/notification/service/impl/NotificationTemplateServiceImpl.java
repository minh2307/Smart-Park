package com.smartpark.domain.notification.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.notification.dto.NotificationTemplateDto;
import com.smartpark.domain.notification.entity.NotificationTemplate;
import com.smartpark.domain.notification.mapper.NotificationTemplateMapper;
import com.smartpark.domain.notification.repository.NotificationTemplateRepository;
import com.smartpark.domain.notification.service.NotificationTemplateService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationTemplateServiceImpl implements NotificationTemplateService {

    private final NotificationTemplateRepository templateRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationTemplateDto.Response> findAll(String search, String channel, Boolean active, Pageable pageable) {
        Specification<NotificationTemplate> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("templateCode")), "%" + search.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("templateName")), "%" + search.toLowerCase() + "%")
                ));
            }
            if (channel != null && !channel.isBlank()) {
                predicates.add(cb.equal(root.get("channel").as(String.class), channel.toUpperCase()));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return templateRepository.findAll(spec, pageable).map(NotificationTemplateMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationTemplateDto.Response findById(Long id) {
        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate", id));
        return NotificationTemplateMapper.toResponse(template);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationTemplateDto.Response findByTemplateCode(String templateCode) {
        NotificationTemplate template = templateRepository.findByTemplateCode(templateCode)
                .orElseThrow(() -> new BusinessException("Không tìm thấy mẫu thông báo với mã: " + templateCode));
        return NotificationTemplateMapper.toResponse(template);
    }

    @Override
    @Transactional
    public NotificationTemplateDto.Response create(NotificationTemplateDto.CreateRequest request) {
        if (templateRepository.existsByTemplateCode(request.getTemplateCode())) {
            throw new BusinessException("Mã mẫu thông báo '" + request.getTemplateCode() + "' đã tồn tại");
        }
        NotificationTemplate template = NotificationTemplate.builder()
                .templateCode(request.getTemplateCode())
                .templateName(request.getTemplateName())
                .channel(request.getChannel())
                .subject(request.getSubject())
                .body(request.getBody())
                .variables(request.getVariables())
                .active(request.isActive())
                .build();
        NotificationTemplate saved = templateRepository.save(template);
        return NotificationTemplateMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public NotificationTemplateDto.Response update(Long id, NotificationTemplateDto.UpdateRequest request) {
        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate", id));

        template.setTemplateName(request.getTemplateName());
        template.setChannel(request.getChannel());
        template.setSubject(request.getSubject());
        template.setBody(request.getBody());
        template.setVariables(request.getVariables());
        template.setActive(request.isActive());

        NotificationTemplate saved = templateRepository.save(template);
        return NotificationTemplateMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate", id));
        templateRepository.delete(template);
    }

    @Override
    @Transactional
    public NotificationTemplateDto.Response toggleActive(Long id) {
        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate", id));
        template.setActive(!template.isActive());
        NotificationTemplate saved = templateRepository.save(template);
        return NotificationTemplateMapper.toResponse(saved);
    }
}
