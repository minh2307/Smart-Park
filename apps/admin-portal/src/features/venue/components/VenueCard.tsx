import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip } from '@mui/material';
import { MdLocationOn, MdAccessTime, MdPerson } from 'react-icons/md';
import { Venue } from '../types';
import { useNavigate } from 'react-router-dom';

interface VenueCardProps {
  venue: Venue;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  const navigate = useNavigate();
  const statusStr = typeof venue.status === 'number' ? (venue.status === 1 ? 'ACTIVE' : 'INACTIVE') : venue.status;

  const statusColors: Record<string, 'success' | 'default' | 'warning' | 'error'> = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    UNDER_MAINTENANCE: 'warning',
    CLOSED: 'error',
  };

  const coverPlaceholder = 'https://images.unsplash.com/photo-1513889961551-6ad8762ebd57?auto=format&fit=crop&w=400&q=80';

  return (
    <Card
      onClick={() => navigate(`/admin/venues/${venue.id}`)}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          borderColor: 'primary.main',
        },
        '&:active': {
          transform: 'translateY(-1px) scale(0.99)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="160"
          image={venue.coverImageUrl || coverPlaceholder}
          alt={venue.name}
          sx={{ objectFit: 'cover' }}
        />
        {/* Gradient overlay on image */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Status badge on image */}
        <Chip
          label={
            statusStr === 'ACTIVE'
              ? 'Hoạt động'
              : statusStr === 'INACTIVE'
              ? 'Ngưng hoạt động'
              : statusStr === 'UNDER_MAINTENANCE'
              ? 'Đang bảo trì'
              : statusStr === 'CLOSED'
              ? 'Đã đóng cửa'
              : statusStr
          }
          color={statusColors[statusStr] || 'default'}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontWeight: 700,
            fontSize: '0.625rem',
            height: 22,
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label={venue.venueCode}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.6875rem', height: 22 }}
          />
        </Box>
        <Typography variant="h6" fontWeight={700} noWrap sx={{ mt: 0.5 }}>
          {venue.name}
        </Typography>
        <Box display="flex" alignItems="center" gap={0.75} color="text.secondary">
          <MdLocationOn size={15} />
          <Typography variant="body2" noWrap>
            {venue.address}, {venue.city}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.75} color="text.secondary">
          <MdAccessTime size={15} />
          <Typography variant="body2">
            {venue.openingTime || '08:00'} – {venue.closingTime || '22:00'}
          </Typography>
        </Box>
        {venue.manager && (
          <Box display="flex" alignItems="center" gap={0.75} color="text.secondary" mt="auto" pt={1}>
            <MdPerson size={15} />
            <Typography variant="body2" fontWeight={500}>
              {venue.manager}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
