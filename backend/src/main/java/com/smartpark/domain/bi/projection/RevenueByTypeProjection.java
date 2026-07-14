package com.smartpark.domain.bi.projection;

import java.math.BigDecimal;

public interface RevenueByTypeProjection {
    String getTicketCategory();
    BigDecimal getRevenue();
}
