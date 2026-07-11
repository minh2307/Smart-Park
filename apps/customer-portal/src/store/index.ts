import { configureStore } from '@reduxjs/toolkit';
import { coreReducers } from '@shared/api';
import appReducer from './slices/appSlice';
import ticketReducer from '../features/tickets/store/ticketSlice';
import { baseApi } from './api/baseApi';

export const store = configureStore({
  reducer: {
    ...coreReducers,
    app: appReducer,
    tickets: ticketReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
