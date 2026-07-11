import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EngagementState {
  localReadIds: number[];
  localDeletedIds: number[];
}

const initialState: EngagementState = {
  localReadIds: [],
  localDeletedIds: [],
};

export const engagementSlice = createSlice({
  name: 'engagement',
  initialState,
  reducers: {
    markRead: (state, action: PayloadAction<number>) => {
      if (!state.localReadIds.includes(action.payload)) {
        state.localReadIds.push(action.payload);
      }
    },
    markAllRead: (state, action: PayloadAction<number[]>) => {
      action.payload.forEach((id) => {
        if (!state.localReadIds.includes(id)) {
          state.localReadIds.push(id);
        }
      });
    },
    deleteNotification: (state, action: PayloadAction<number>) => {
      if (!state.localDeletedIds.includes(action.payload)) {
        state.localDeletedIds.push(action.payload);
      }
    },
    resetLocalEngagementStates: (state) => {
      state.localReadIds = [];
      state.localDeletedIds = [];
    },
  },
});

export const { markRead, markAllRead, deleteNotification, resetLocalEngagementStates } = engagementSlice.actions;
export default engagementSlice.reducer;
