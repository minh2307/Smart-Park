import { logger } from '../../../services/logger';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Booking } from '../types/booking.types';

interface BookingState {
  cartItems: CartItem[];
  visitDate: string; // YYYY-MM-DD
  appliedCoupon: string | null;
  couponDiscount: number;
  bookingStatus: 'idle' | 'loading' | 'success' | 'failed';
  createdBooking: Booking | null;
  paymentUrl: string | null;
}

const getSavedCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('sp_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  try {
    localStorage.setItem('sp_cart', JSON.stringify(items));
  } catch (e) {
    logger.error('Failed to save cart to localStorage', e);
  }
};

const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const initialState: BookingState = {
  cartItems: getSavedCart(),
  visitDate: getTomorrowDate(),
  appliedCoupon: null,
  couponDiscount: 0,
  bookingStatus: 'idle',
  createdBooking: null,
  paymentUrl: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const { ticketType, quantity, visitDate } = action.payload;
      const existing = state.cartItems.find(
        (item) => item.ticketType.id === ticketType.id && item.visitDate === visitDate
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.cartItems.push(action.payload);
      }
      saveCart(state.cartItems);
    },
    removeFromCart(state, action: PayloadAction<{ id: number; visitDate: string }>) {
      const { id, visitDate } = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => !(item.ticketType.id === id && item.visitDate === visitDate)
      );
      saveCart(state.cartItems);
    },
    updateQuantity(state, action: PayloadAction<{ id: number; visitDate: string; quantity: number }>) {
      const { id, visitDate, quantity } = action.payload;
      const existing = state.cartItems.find(
        (item) => item.ticketType.id === id && item.visitDate === visitDate
      );
      if (existing) {
        existing.quantity = Math.max(0, quantity);
        if (existing.quantity === 0) {
          state.cartItems = state.cartItems.filter(
            (item) => !(item.ticketType.id === id && item.visitDate === visitDate)
          );
        }
      }
      saveCart(state.cartItems);
    },
    clearCart(state) {
      state.cartItems = [];
      state.appliedCoupon = null;
      state.couponDiscount = 0;
      saveCart(state.cartItems);
    },
    setVisitDate(state, action: PayloadAction<string>) {
      state.visitDate = action.payload;
    },
    applyCoupon(state, action: PayloadAction<{ code: string; discount: number }>) {
      state.appliedCoupon = action.payload.code;
      state.couponDiscount = action.payload.discount;
    },
    removeCoupon(state) {
      state.appliedCoupon = null;
      state.couponDiscount = 0;
    },
    setBookingStatus(state, action: PayloadAction<BookingState['bookingStatus']>) {
      state.bookingStatus = action.payload;
    },
    setCreatedBooking(state, action: PayloadAction<Booking | null>) {
      state.createdBooking = action.payload;
    },
    setPaymentUrl(state, action: PayloadAction<string | null>) {
      state.paymentUrl = action.payload;
    },
    resetBooking(state) {
      state.bookingStatus = 'idle';
      state.createdBooking = null;
      state.paymentUrl = null;
      state.appliedCoupon = null;
      state.couponDiscount = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setVisitDate,
  applyCoupon,
  removeCoupon,
  setBookingStatus,
  setCreatedBooking,
  setPaymentUrl,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
