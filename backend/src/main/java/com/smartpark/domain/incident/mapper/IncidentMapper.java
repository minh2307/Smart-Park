package com.smartpark.domain.incident.mapper;

import com.smartpark.domain.incident.dto.IncidentDto;
import com.smartpark.domain.incident.entity.Incident;
import com.smartpark.domain.incident.entity.IncidentHistory;

import java.util.List;
import java.util.stream.Collectors;

public class IncidentMapper {

    public static IncidentDto.Response toResponseDto(Incident incident, List<IncidentHistory> historyList) {
        if (incident == null) return null;
        return IncidentDto.Response.builder()
                .id(incident.getId())
                .incidentNumber(incident.getIncidentNumber())
                .zoneId(incident.getZone() != null ? incident.getZone().getId() : null)
                .zoneName(incident.getZone() != null ? incident.getZone().getName() : null)
                .reporterId(incident.getReporterId())
                .description(incident.getDescription())
                .severity(incident.getSeverity())
                .status(incident.getStatus())
                .resolutionDetails(incident.getResolutionDetails())
                .createdAt(incident.getCreatedAt())
                .history(historyList != null ? historyList.stream()
                        .map(IncidentMapper::toHistoryResponseDto)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    public static IncidentDto.HistoryResponse toHistoryResponseDto(IncidentHistory history) {
        if (history == null) return null;
        return IncidentDto.HistoryResponse.builder()
                .id(history.getId())
                .statusFrom(history.getStatusFrom())
                .statusTo(history.getStatusTo())
                .actionDetails(history.getActionDetails())
                .performedById(history.getPerformedBy() != null ? history.getPerformedBy().getId() : null)
                .performedByUsername(history.getPerformedBy() != null ? history.getPerformedBy().getUsername() : null)
                .createdAt(history.getCreatedAt())
                .build();
    }
}
