import React from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { getAppTheme } from '../theme';
import { RootState } from '../app/store';

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const theme = getAppTheme(mode);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
