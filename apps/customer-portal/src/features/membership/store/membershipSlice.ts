import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MembershipState } from '../types/membership.types';

const initialState: MembershipState = {
  activeTab: 'DASHBOARD',
  loading: false,
  error: null,
};

export const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<MembershipState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setActiveTab, setLoading, setError } = membershipSlice.actions;
export default membershipSlice.reducer;
export const selectActiveTab = (state: any) => state.membership.activeTab;
