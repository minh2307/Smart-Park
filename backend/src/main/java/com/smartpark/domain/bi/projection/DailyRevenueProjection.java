package com.smartpark.domain.bi.projection;

import java.math.BigDecimal;

public interface DailyRevenueProjection {
    String getPeriod();
    BigDecimal getTotalRevenue();
    Long getTxCount();
}
