package com.smartpark.domain.bi.projection;

import java.math.BigDecimal;

public interface CouponPerformanceProjection {
    Long getCouponId();
    String getCouponCode();
    Long getTotalUses();
    BigDecimal getTotalDiscountAmount();
}
