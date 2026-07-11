import React from 'react';
import { Box, Grid, Typography, Paper, Divider, Chip } from '@mui/material';
import { Venue } from '../types';
import { VenueStatistics } from './VenueStatistics';
import { MdLocationOn, MdPhone, MdEmail, MdWeb, MdAccessTime } from 'react-icons/md';

interface VenueDetailsProps {
  venue: Venue;
}

export const VenueDetails: React.FC<VenueDetailsProps> = ({ venue }) => {
  const statusStr = typeof venue.status === 'number' ? (venue.status === 1 ? 'ACTIVE' : 'INACTIVE') : venue.status;

  const coverPlaceholder = 'https://images.unsplash.com/photo-1513889961551-6ad8762ebd57?auto=format&fit=crop&w=800&q=80';
  const logoPlaceholder = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=150&q=80';

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box height={240} width="100%" position="relative">
          <img src={venue.coverImageUrl || coverPlaceholder} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Box
            position="absolute"
            bottom={-40}
            left={24}
            width={100}
            height={100}
            borderRadius="50%"
            border="4px solid"
            borderColor="background.paper"
            overflow="hidden"
            bgcolor="background.paper"
          >
            <img src={venue.logoUrl || logoPlaceholder} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        </Box>
        <Box pt={6} px={3} pb={3} display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
          <Box>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Typography variant="h4" fontWeight="bold">
                {venue.name}
              </Typography>
              <Chip label={venue.venueCode} sx={{ fontWeight: 'bold' }} />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {venue.description || 'Không có mô tả cho địa điểm này.'}
            </Typography>
          </Box>
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
            color={statusStr === 'ACTIVE' ? 'success' : 'default'}
            size="medium"
          />
        </Box>
      </Paper>

      <Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Thống kê địa điểm
        </Typography>
        <Divider sx={{ mb: 2.5 }} />
        <VenueStatistics />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Vị trí & Giờ mở cửa
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <MdLocationOn size={20} color="#757575" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {venue.address}, {venue.city}, {venue.provinceState}, {venue.country}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <MdAccessTime size={20} color="#757575" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Giờ hoạt động
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {venue.openingTime || '08:00'} - {venue.closingTime || '22:00'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Thông tin liên hệ
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <MdPhone size={20} color="#757575" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {venue.phone || 'Không có'}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <MdEmail size={20} color="#757575" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Địa chỉ email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {venue.email || 'Không có'}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <MdWeb size={20} color="#757575" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Trang web
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {venue.website || 'Không có'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
