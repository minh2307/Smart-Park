import React from 'react';
import { Container, Grid, Typography, Box, Button, Divider, Alert, Stack, CircularProgress } from '@mui/material';
import { DeleteSweep, KeyboardArrowLeft } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectCartItems,
  selectCartTotal,
  selectAppliedCoupon,
  selectCouponDiscount,
} from '../store/bookingSelectors';
import {
  updateQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../store/bookingSlice';
import { CartList } from '../components/CartList';
import { CartSummary } from '../components/CartSummary';
import { EmptyCart } from '../components/EmptyCart';
import { useCreateBookingMutation, useCreatePaymentMutation } from '../api/bookingApi';
import { useNavigate } from 'react-router-dom';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux Selectors
  const cartItems = useAppSelector(selectCartItems);
  const cartSubtotal = useAppSelector(selectCartTotal);
  const appliedCoupon = useAppSelector(selectAppliedCoupon);
  const couponDiscount = useAppSelector(selectCouponDiscount);
  
  // Auth details
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // API mutations
  const [createBooking, { isLoading: isBookingLoading }] = useCreateBookingMutation();
  const [createPayment, { isLoading: isPaymentLoading }] = useCreatePaymentMutation();

  const handleQuantityChange = (id: number, visitDate: string, qty: number) => {
    dispatch(updateQuantity({ id, visitDate, quantity: qty }));
  };

  const handleRemove = (id: number, visitDate: string) => {
    dispatch(removeFromCart({ id, visitDate }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleApplyCoupon = (code: string, discount: number) => {
    dispatch(applyCoupon({ code, discount }));
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
  };

  // Group items by visitDate and checkout
  const handleCheckout = async (membershipDiscountVal: number) => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    // Group items by visitDate
    const dateGroups: Record<string, typeof cartItems> = {};
    cartItems.forEach((item) => {
      if (!dateGroups[item.visitDate]) {
        dateGroups[item.visitDate] = [];
      }
      dateGroups[item.visitDate].push(item);
    });

    try {
      let firstBookingCode = '';
      
      // Submit booking sequentially per visit date
      for (const [date, items] of Object.entries(dateGroups)) {
        const ticketsReq = items.map((item) => ({
          ticketTypeId: item.ticketType.id,
          quantity: item.quantity,
        }));

        const response = await createBooking({
          customerId: user.id,
          tickets: ticketsReq,
          validDate: date,
          couponCode: appliedCoupon,
        }).unwrap();

        if (!firstBookingCode) {
          firstBookingCode = response.code;
        }
      }

      // Redirect to Checkout Page with the booking code
      if (firstBookingCode) {
        dispatch(clearCart());
        navigate(`/checkout?code=${firstBookingCode}`);
      }
    } catch (err) {
      console.error('Checkout failed', err);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <EmptyCart />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back button */}
      <Button
        startIcon={<KeyboardArrowLeft />}
        onClick={() => navigate('/tickets')}
        sx={{ mb: 4, fontWeight: 700 }}
      >
        Tiếp tục xem vé
      </Button>

      {/* Cart Title & Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0f172a 30%, #0d9488 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Giỏ hàng của bạn
        </Typography>

        <Button
          variant="text"
          color="error"
          onClick={handleClearCart}
          startIcon={<DeleteSweep />}
          sx={{ fontWeight: 700 }}
        >
          Xóa giỏ hàng
        </Button>
      </Box>

      {/* Cart Contents Layout */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <CartList
            items={cartItems}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <CartSummary
            subtotal={cartSubtotal}
            isAuthenticated={isAuthenticated}
            customerId={user?.id}
            appliedCoupon={appliedCoupon}
            couponDiscount={couponDiscount}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onCheckout={handleCheckout}
            isSubmitting={isBookingLoading || isPaymentLoading}
          />
        </Grid>
      </Grid>
    </Container>
  );
};
