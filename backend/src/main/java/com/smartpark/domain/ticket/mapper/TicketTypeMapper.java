package com.smartpark.domain.ticket.mapper;

import com.smartpark.domain.park.entity.Park;
import com.smartpark.domain.ticket.dto.TicketTypeRequestDto;
import com.smartpark.domain.ticket.dto.TicketTypeResponseDto;
import com.smartpark.domain.ticket.entity.TicketType;
import com.smartpark.domain.ticket.entity.TicketType.TicketCategory;
import com.smartpark.domain.ticket.entity.TicketType.TicketTypeStatus;

public class TicketTypeMapper {

    public static TicketType toEntity(TicketTypeRequestDto request, Park park) {
        if (request == null) {
            return null;
        }
        
        TicketCategory category;
        try {
            category = TicketCategory.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            category = TicketCategory.DAILY; // fallback
        }

        TicketTypeStatus typeStatus;
        try {
            typeStatus = TicketTypeStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            typeStatus = TicketTypeStatus.ACTIVE; // fallback
        }

        Integer availQty = request.getAvailableQuantity() != null ? 
                           request.getAvailableQuantity() : request.getTotalQuantity();

        return TicketType.builder()
                .park(park)
                .name(request.getName())
                .description(request.getDescription())
                .standardPrice(request.getPrice())
                .minPrice(request.getMinPrice())
                .maxPrice(request.getMaxPrice())
                .totalQuantity(request.getTotalQuantity())
                .availableQuantity(availQty)
                .type(category)
                .status(typeStatus)
                .build();
    }

    public static TicketTypeResponseDto toResponseDto(TicketType entity) {
        if (entity == null) {
            return null;
        }

        return TicketTypeResponseDto.builder()
                .id(entity.getId())
                .venueId(entity.getPark() != null ? entity.getPark().getId() : null)
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getStandardPrice())
                .minPrice(entity.getMinPrice())
                .maxPrice(entity.getMaxPrice())
                .totalQuantity(entity.getTotalQuantity())
                .availableQuantity(entity.getAvailableQuantity())
                .type(entity.getType() != null ? entity.getType().name() : null)
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static void updateEntity(TicketType entity, TicketTypeRequestDto request, Park park) {
        if (request == null || entity == null) {
            return;
        }

        if (park != null) {
            entity.setPark(park);
        }
        
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setStandardPrice(request.getPrice());
        entity.setMinPrice(request.getMinPrice());
        entity.setMaxPrice(request.getMaxPrice());
        
        int diff = request.getTotalQuantity() - entity.getTotalQuantity();
        entity.setTotalQuantity(request.getTotalQuantity());
        entity.setAvailableQuantity(Math.max(0, entity.getAvailableQuantity() + diff));

        if (request.getType() != null) {
            try {
                entity.setType(TicketCategory.valueOf(request.getType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }

        if (request.getStatus() != null) {
            try {
                entity.setStatus(TicketTypeStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }
    }
}
