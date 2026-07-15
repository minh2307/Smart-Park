import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { MdExpandLess, MdExpandMore, MdMenuOpen, MdMenu } from 'react-icons/md';
import { menuConfig, MenuItem } from './menuConfig';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const handleSubMenuToggle = (title: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const hasAccess = (item: MenuItem) => {
    if (!user) return false;
    if (user.role === 'SYSTEM_ADMIN') return true;
    if (item.allowedRoles && !item.allowedRoles.includes(user.role)) {
      return false;
    }
    return true;
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    if (!hasAccess(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isSelected = item.route ? location.pathname === item.route : false;
    const isSubMenuOpen = openSubMenus[item.title] || false;
    const Icon = item.icon;

    const button = (
      <ListItemButton
        onClick={() => {
          if (hasChildren) {
            handleSubMenuToggle(item.title);
          } else if (item.route) {
            navigate(item.route);
          }
        }}
        sx={{
          minHeight: 44,
          justifyContent: open ? 'initial' : 'center',
          px: 1.5,
          mx: open ? 1.5 : 1,
          mb: 0.5,
          borderRadius: 2.5,
          backgroundColor: isSelected
            ? 'primary.main'
            : 'transparent',
          color: isSelected ? '#fff' : 'text.primary',
          '&:hover': {
            backgroundColor: isSelected
              ? 'primary.dark'
              : 'action.hover',
          },
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 2 : 'auto',
            justifyContent: 'center',
            color: isSelected ? '#fff' : 'text.secondary',
          }}
        >
          <Icon size={20} />
        </ListItemIcon>
        {open && (
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              fontSize: '0.8125rem',
              fontWeight: isSelected ? 700 : 500,
            }}
          />
        )}
        {open && hasChildren && (
          isSubMenuOpen
            ? <MdExpandLess size={18} />
            : <MdExpandMore size={18} />
        )}
      </ListItemButton>
    );

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          {open ? button : (
            <Tooltip title={item.title} placement="right" arrow>
              {button}
            </Tooltip>
          )}
        </ListItem>
        {hasChildren && open && (
          <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 1 }}>
              {item.children!.map((child) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderRightColor: 'divider',
        },
      }}
    >
      {/* Brand area */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: open ? 2.5 : 0,
          py: 2,
          minHeight: 64,
        }}
      >
        {open && (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2.5,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}
            >
              SP
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              sx={{ letterSpacing: '-0.01em' }}
            >
              Smart Park
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            mx: open ? 0 : 'auto',
          }}
        >
          {open ? <MdMenuOpen size={18} /> : <MdMenu size={18} />}
        </IconButton>
      </Box>

      {/* Subtle separator */}
      <Box sx={{ mx: open ? 2 : 1, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }} />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', pt: 0.5 }}>
        <List sx={{ py: 0 }}>
          {menuConfig.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Bottom user info (when expanded) */}
      {open && user && (
        <Box
          sx={{
            mx: 1.5,
            mb: 1.5,
            p: 1.5,
            borderRadius: 3,
            backgroundColor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.75rem',
              flexShrink: 0,
            }}
          >
            {user.fullName?.charAt(0).toUpperCase() || 'U'}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.role}
            </Typography>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};
