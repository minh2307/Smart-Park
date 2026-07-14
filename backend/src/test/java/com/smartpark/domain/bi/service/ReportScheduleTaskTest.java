package com.smartpark.domain.bi.service;

import com.smartpark.domain.bi.entity.ReportSchedule;
import com.smartpark.domain.bi.repository.ReportScheduleRepository;
import com.smartpark.domain.bi.service.impl.ReportScheduleTask;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportScheduleTaskTest {

    @Mock
    private ReportScheduleRepository reportScheduleRepository;

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportScheduleTask reportScheduleTask;

    @Test
    void testExecuteScheduledReports() {
        ReportSchedule schedule = ReportSchedule.builder()
                .id(1L)
                .reportType("REVENUE")
                .cronExpression("* * * * * ?") // matches every second
                .enabled(true)
                .build();

        when(reportScheduleRepository.findByEnabledTrue()).thenReturn(Collections.singletonList(schedule));

        reportScheduleTask.executeScheduledReports();

        verify(reportService).runScheduleImmediately(1L);
    }

    @Test
    void testExecuteScheduledReportsNoMatch() {
        ReportSchedule schedule = ReportSchedule.builder()
                .id(1L)
                .reportType("REVENUE")
                .cronExpression("0 0 0 1 1 ? 2099") // future year
                .enabled(true)
                .build();

        when(reportScheduleRepository.findByEnabledTrue()).thenReturn(Collections.singletonList(schedule));

        reportScheduleTask.executeScheduledReports();

        verify(reportService, never()).runScheduleImmediately(anyLong());
    }
}
