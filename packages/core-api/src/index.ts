import authReducer, * as authActions from './slices/authSlice';
import themeReducer, * as themeActions from './slices/themeSlice';

export { axiosClient } from './client';

export const coreReducers = {
  auth: authReducer,
  theme: themeReducer,
};

export const coreActions = {
  ...authActions,
  ...themeActions,
};

export * from './slices/authSlice';
export * from './slices/themeSlice';
