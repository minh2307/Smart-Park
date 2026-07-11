import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLazyGetCurrentUserQuery } from '../../features/auth/services/authApi';
import { setCredentials, logoutSuccess } from '../../features/auth/store/authSlice';

export const AppLayout: React.FC = () => {
  const dispatch = useDispatch();
  const [triggerGetCurrentUser] = useLazyGetCurrentUserQuery();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && token !== 'mocked-token-for-preview') {
        try {
          const user = await triggerGetCurrentUser().unwrap();
          dispatch(setCredentials({ user, accessToken: token }));
        } catch (err) {
          console.error('Session restoration failed:', err);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          dispatch(logoutSuccess());
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch(logoutSuccess());
      }
      setIsInitializing(false);
    };

    initAuth();
  }, [triggerGetCurrentUser, dispatch]);

  if (isInitializing) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Outlet />
    </Box>
  );
};
