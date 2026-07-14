/**
 * Navbar.tsx - Main Navbar orchestrator
 *
 * Architecture:
 *   Left:   NavbarLogo
 *   Center: NavbarNavigation (declarative nav items, NavLink-based active state)
 *   Right:  NavbarActions (cart, notification bell, avatar/login)
 *   Mobile: MobileDrawer (hamburger + slide-in drawer)
 *
 * Auth state consumed from ONE Redux source (state.auth).
 * No auth logic lives inside this component.
 */
import React, { useMemo } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { NavbarLogo } from './NavbarLogo';
import { NavbarNavigation } from './NavbarNavigation';
import { NavbarActions } from './NavbarActions';
import { MobileDrawer } from './MobileDrawer';
import { useAppSelector } from '../../store/hooks';

export const Navbar: React.FC = React.memo(() => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Scroll-elevation: navbar darkens slightly more on scroll (always starts with dark base)
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 60], [0.88, 1]);

  const containerStyle = useMemo(() => ({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1100,
    // Provide a solid fallback (prefers-reduced-transparency handled via inline)
  }), []);

  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component="header"
      sx={containerStyle}
      role="banner"
    >
      {/* Animated background layer (scroll-driven opacity) */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark ? 'rgba(10,18,32,1)' : 'rgba(255,255,255,1)',
          opacity: bgOpacity,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          boxShadow: isDark ? '0 1px 30px rgba(0,0,0,0.3)' : '0 1px 30px rgba(0,0,0,0.05)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Always-visible thin accent line at top */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #0d9488 30%, #06b6d4 70%, transparent 100%)',
          opacity: 0.8,
          zIndex: 1,
        }}
      />

      {/* Toolbar content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1280px',
          mx: 'auto',
          px: { xs: 2, sm: 3, lg: 4 },
          height: { xs: 60, md: 68 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Left: Logo */}
        <NavbarLogo />

        {/* Center: Navigation (desktop only) */}
        {isDesktop && (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <NavbarNavigation isAuthenticated={isAuthenticated} />
          </Box>
        )}

        {/* Right: Actions + Mobile Drawer trigger */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isDesktop ? (
            <NavbarActions isAuthenticated={isAuthenticated} />
          ) : (
            <>
              <NavbarActions isAuthenticated={isAuthenticated} />
              <MobileDrawer isAuthenticated={isAuthenticated} />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
});

Navbar.displayName = 'Navbar';
