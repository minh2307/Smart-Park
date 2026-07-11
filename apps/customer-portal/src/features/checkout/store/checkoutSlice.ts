import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CheckoutState } from '../types/checkout.types';

const initialState: CheckoutState = {
  paymentStatus: 'IDLE',
  checkoutStatus: 'IDLE',
  redirectStatus: 'IDLE',
  transactionId: null,
  error: null,
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setPaymentStatus: (
      state,
      action: PayloadAction<CheckoutState['paymentStatus']>
    ) => {
      state.paymentStatus = action.payload;
    },
    setCheckoutStatus: (
      state,
      action: PayloadAction<CheckoutState['checkoutStatus']>
    ) => {
      state.checkoutStatus = action.payload;
    },
    setRedirectStatus: (
      state,
      action: PayloadAction<CheckoutState['redirectStatus']>
    ) => {
      state.redirectStatus = action.payload;
    },
    setTransactionId: (state, action: PayloadAction<string | null>) => {
      state.transactionId = action.payload;
    },
    setCheckoutError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetCheckoutState: (state) => {
      state.paymentStatus = 'IDLE';
      state.checkoutStatus = 'IDLE';
      state.redirectStatus = 'IDLE';
      state.transactionId = null;
      state.error = null;
    },
  },
});

export const {
  setPaymentStatus,
  setCheckoutStatus,
  setRedirectStatus,
  setTransactionId,
  setCheckoutError,
  resetCheckoutState,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
