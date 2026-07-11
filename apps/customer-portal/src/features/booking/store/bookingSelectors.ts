import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';

export const selectCartItems = (state: RootState) => state.booking.cartItems;
export const selectVisitDate = (state: RootState) => state.booking.visitDate;
export const selectAppliedCoupon = (state: RootState) => state.booking.appliedCoupon;
export const selectCouponDiscount = (state: RootState) => state.booking.couponDiscount;
export const selectBookingStatus = (state: RootState) => state.booking.bookingStatus;
export const selectCreatedBooking = (state: RootState) => state.booking.createdBooking;
export const selectPaymentUrl = (state: RootState) => state.booking.paymentUrl;

export const selectCartTotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0)
);

export const selectCartCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + item.quantity, 0)
);
