package com.smartpark.domain.bi.projection;

import java.math.BigDecimal;

public interface ProductSalesReportProjection {
    Long getItemId();
    String getItemName();
    Long getTotalQuantitySold();
    BigDecimal getTotalRevenue();
}
