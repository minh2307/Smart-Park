package com.smartpark.domain.bi.projection;

public interface RideWaitingTimeProjection {
    Long getRideId();
    String getRideName();
    Double getAvgQueueLength();
    Integer getRideCapacity();
    Integer getCycleDuration();
    Double getEstimatedWaitMinutes();
}
