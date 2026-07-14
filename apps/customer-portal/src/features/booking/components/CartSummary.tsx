import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Stack, Alert, Box } from '@mui/material';

import { PriceBreakdown } from './PriceBreakdown';
import { PromotionSelector } from './PromotionSelector';
import { MembershipDiscountCard } from './MembershipDiscountCard';
import { formatCurrency } from '@shared/utils';
import { useNavigate } from 'react-router-dom';

interface CartSummaryProps {
  subtotal: number;
  isAuthenticated: boolean;
  customerId?: number;
  appliedCoupon: string | null;
  couponDiscount: number;
  onApplyCoupon: (code: string, discount: number) => void;
  onRemoveCoupon: () => void;
  onCheckout: (membershipDiscountVal: number) => void;
  isSubmitting?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  isAuthenticated,
  customerId,
  appliedCoupon,
  couponDiscount,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  isSubmitting = false,
}) => {
  const navigate = useNavigate();
  const [membershipDiscountPercent, setMembershipDiscountPercent] = useState(0);

  const membershipDiscountVal = (subtotal * membershipDiscountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - couponDiscount - membershipDiscountVal);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
    } else {
      onCheckout(membershipDiscountVal);
    }
  };

  return (
    <Stack spacing={3}>
      {isAuthenticated && customerId && (
        <>
          <MembershipDiscountCard
            customerId={customerId}
            orderTotal={subtotal}
            onApplyDiscount={setMembershipDiscountPercent}
          />
          <PromotionSelector
            customerId={customerId}
            orderTotal={subtotal}
            appliedCode={appliedCoupon}
            onApply={onApplyCoupon}
            onRemove={onRemoveCoupon}
          />
        </>
      )}

      {!isAuthenticated && (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          Vui lòng <strong>đăng nhập</strong> để áp dụng các chương trình khuyến mãi và ưu đãi thẻ thành viên VIP.
        </Alert>
      )}

      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} fontFamily="Outfit, sans-serif" sx={{ mb: 2 }}>
            Tóm tắt đơn hàng
          </Typography>

          <PriceBreakdown
            subtotal={subtotal}
            couponDiscount={couponDiscount}
            membershipDiscount={membershipDiscountVal}
            finalTotal={finalTotal}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleCheckoutClick}
            disabled={isSubmitting || subtotal === 0}
            sx={{ fontWeight: 700, borderRadius: 3, mt: 3 }}
          >
            {isAuthenticated ? 'Tiến hành đặt vé' : 'Đăng nhập để đặt vé'}
          </Button>
        </CardContent>
      </Card>
    </Stack>
  );
};
