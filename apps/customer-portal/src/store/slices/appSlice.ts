import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  globalLoading: boolean;
  bookingLockTimeLeft: number; // in seconds, countdown timer for reserving tickets
}

const initialState: AppState = {
  globalLoading: false,
  bookingLockTimeLeft: 0,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setBookingLockTimeLeft: (state, action: PayloadAction<number>) => {
      state.bookingLockTimeLeft = action.payload;
    },
    decrementBookingLockTime: (state) => {
      if (state.bookingLockTimeLeft > 0) {
        state.bookingLockTimeLeft -= 1;
      }
    },
  },
});

export const { setGlobalLoading, setBookingLockTimeLeft, decrementBookingLockTime } = appSlice.actions;
export default appSlice.reducer;
