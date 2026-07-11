import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

export const BlankLayout = () => {
  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Outlet />
    </Box>
  );
};
