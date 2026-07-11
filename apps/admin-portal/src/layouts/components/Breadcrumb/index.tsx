import React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { MdChevronRight } from 'react-icons/md';

const routeNameMap: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  tickets: 'Tickets',
  overview: 'Overview',
  types: 'Types',
  orders: 'Orders',
  users: 'Users',
  venues: 'Venues',
  settings: 'Settings',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumb if only 1 or 0 segments
  if (pathnames.length <= 1) return null;

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<MdChevronRight size={16} style={{ opacity: 0.4 }} />}
      sx={{ display: { xs: 'none', sm: 'block' } }}
    >
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const name = routeNameMap[value.toLowerCase()] || value;

        // Skip numeric route segments (e.g. IDs)
        if (/^\d+$/.test(value)) {
          return (
            <Typography
              key={to}
              variant="body2"
              color={last ? 'text.primary' : 'text.secondary'}
              fontWeight={last ? 600 : 400}
            >
              #{value}
            </Typography>
          );
        }

        return last ? (
          <Typography
            key={to}
            variant="body2"
            color="text.primary"
            fontWeight={600}
          >
            {name}
          </Typography>
        ) : (
          <Link
            component={RouterLink}
            underline="hover"
            color="text.secondary"
            to={to}
            key={to}
            sx={{ fontSize: '0.8125rem' }}
          >
            {name}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};
