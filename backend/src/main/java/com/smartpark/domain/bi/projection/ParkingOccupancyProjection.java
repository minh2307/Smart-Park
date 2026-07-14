package com.smartpark.domain.bi.projection;

import java.math.BigDecimal;

public interface ParkingOccupancyProjection {
    Long getLotId();
    String getLotName();
    BigDecimal getTotalParkingFee();
    Long getTotalSessions();
}
