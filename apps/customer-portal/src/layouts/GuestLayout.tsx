import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from '../components/Navbar';

/**
 * GuestLayout - wraps public routes (/, /tickets, /cart, etc.)
 * 
 * Uses the unified Navbar. The Navbar reads isAuthenticated from Redux,
 * so it automatically renders the guest variant (logo + park nav + login button).
 * The pt offset (68px) keeps content below the fixed Navbar.
 */
export const GuestLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      <Box
        component="main"
        sx={{ flexGrow: 1, pt: { xs: '60px', md: '68px' } }}
        id="main-content"
      >
        <Outlet />
      </Box>
    </Box>
  );
};
