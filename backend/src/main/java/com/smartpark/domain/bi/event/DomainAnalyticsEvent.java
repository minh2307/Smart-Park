package com.smartpark.domain.bi.event;

import com.smartpark.domain.bi.entity.AnalyticsEvent;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Spring ApplicationEvent wrapping an AnalyticsEvent.
 * Published by domain services, consumed by AnalyticsEventListener.
 */
@Getter
public class DomainAnalyticsEvent extends ApplicationEvent {

    private final AnalyticsEvent analyticsEvent;

    public DomainAnalyticsEvent(Object source, AnalyticsEvent analyticsEvent) {
        super(source);
        this.analyticsEvent = analyticsEvent;
    }
}
