import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@shared/config';
import { storage } from '@shared/utils';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
}

const getInitialMode = (): ThemeMode => {
  const savedMode = storage.get<ThemeMode>(STORAGE_KEYS.THEME_MODE);
  if (savedMode) return savedMode;
  // Default dark — all customer portal pages ship dark-first.
  return 'dark';
};

const initialState: ThemeState = {
  mode: getInitialMode(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      storage.set(STORAGE_KEYS.THEME_MODE, state.mode);
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      storage.set(STORAGE_KEYS.THEME_MODE, state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
