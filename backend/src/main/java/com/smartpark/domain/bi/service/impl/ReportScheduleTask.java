package com.smartpark.domain.bi.service.impl;

import com.smartpark.domain.bi.entity.ReportSchedule;
import com.smartpark.domain.bi.repository.ReportScheduleRepository;
import com.smartpark.domain.bi.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReportScheduleTask {

    private final ReportScheduleRepository reportScheduleRepository;
    private final ReportService reportService;

    // Run every 5 minutes
    @Scheduled(fixedDelay = 300_000)
    public void executeScheduledReports() {
        log.info("[SCHEDULED REPORTS] Checking scheduled reports...");
        List<ReportSchedule> enabledSchedules = reportScheduleRepository.findByEnabledTrue();
        LocalDateTime now = LocalDateTime.now();

        for (ReportSchedule schedule : enabledSchedules) {
            try {
                if (isTimeMatchesCron(schedule.getCronExpression(), now)) {
                    log.info("[SCHEDULED REPORTS] Triggering scheduled report: {}", schedule.getReportType());
                    reportService.runScheduleImmediately(schedule.getId());
                }
            } catch (Exception e) {
                log.error("[SCHEDULED REPORTS] Failed to execute scheduled report {}: {}", schedule.getReportType(), e.getMessage());
            }
        }
    }

    private boolean isTimeMatchesCron(String cronExpression, LocalDateTime time) {
        try {
            CronExpression cron = CronExpression.parse(cronExpression);
            LocalDateTime nextOccurrence = cron.next(time.minusSeconds(1));
            // If next occurrence is within 5 minutes, we execute it
            return nextOccurrence != null && nextOccurrence.isBefore(time.plusMinutes(5)) && nextOccurrence.isAfter(time.minusSeconds(1));
        } catch (Exception e) {
            return false;
        }
    }
}
