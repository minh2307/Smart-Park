import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Button, Divider, List, ListItem, ListItemIcon, ListItemText, Chip, Skeleton, Alert, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { formatCurrency } from '@shared/utils';
import { useGetVenuesQuery, useGetVenueTicketTypesQuery } from '../api/homeApi';

const getMockBenefits = (type: string): string[] => {
  const lowercaseType = type.toLowerCase();
  if (lowercaseType.includes('vip')) {
    return [
      'Đường đi ưu tiên VIP Express cho mọi trò chơi',
      'Khu vực phòng chờ VIP có đồ ăn nhẹ miễn phí',
      'Xem show diễn tại hàng ghế VIP trung tâm',
      'Miễn phí tủ đồ thông minh locker',
    ];
  }
  if (lowercaseType.includes('standard') || lowercaseType.includes('adult') || lowercaseType.includes('daily')) {
    return [
      'Vào cổng tham quan không giới hạn',
      'Tham gia hơn 40 trò chơi ngoài trời',
      'Xem tất cả các show diễn công cộng',
      'Đã bao gồm VAT',
    ];
  }
  return [
    'Vào cổng tham quan không giới hạn',
    'Phù hợp với lứa tuổi/chiều cao tương ứng',
    'Trải nghiệm hơn 20 trò chơi gia đình',
    'Ưu đãi 5% khi mua quà lưu niệm',
  ];
};

export const TicketSection: React.FC = () => {
  const { data: venues, isLoading: isLoadingVenues, isError: isErrorVenues, refetch: refetchVenues } = useGetVenuesQuery();
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);

  useEffect(() => {
    if (venues && venues.length > 0 && selectedVenueId === null) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  const {
    data: ticketTypes,
    isLoading: isLoadingTickets,
    isError: isErrorTickets,
    refetch: refetchTickets
  } = useGetVenueTicketTypesQuery(selectedVenueId ?? 0, {
    skip: selectedVenueId === null,
  });

  const handleRetry = () => {
    if (isErrorVenues) {
      refetchVenues();
    } else {
      refetchTickets();
    }
  };

  const currentVenueName = venues?.find(v => v.id === selectedVenueId)?.name ?? '';

  return (
    <Box sx={{ backgroundColor: 'background.default', py: 10 }}>
      <Container maxWidth="lg">
        {/* Title */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(135deg, #0f172a 30%, #0d9488 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Bảng Giá Vé Trực Tuyến
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
          >
            Đặt vé trực tuyến để nhận chiết khấu hấp dẫn và quét mã QR vào cổng trực tiếp không cần xếp hàng mua vé giấy.
          </Typography>

          {/* Venue Selector */}
          {isLoadingVenues ? (
            <Stack direction="row" spacing={2} justifyContent="center">
              <Skeleton width={120} height={40} sx={{ borderRadius: 2 }} />
              <Skeleton width={120} height={40} sx={{ borderRadius: 2 }} />
            </Stack>
          ) : isErrorVenues ? (
            <Alert severity="error" action={
              <Button color="inherit" size="small" onClick={handleRetry} startIcon={<RefreshIcon />}>
                Thử lại
              </Button>
            } sx={{ maxWidth: 500, mx: 'auto' }}>
              Không thể tải danh sách địa điểm.
            </Alert>
          ) : (
            <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" gap={1}>
              {venues?.map((venue) => (
                <Chip
                  key={venue.id}
                  label={venue.name}
                  clickable
                  onClick={() => setSelectedVenueId(venue.id)}
                  color={selectedVenueId === venue.id ? 'primary' : 'default'}
                  variant={selectedVenueId === venue.id ? 'filled' : 'outlined'}
                  sx={{
                    px: 2,
                    py: 2.5,
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Pricing Cards Grid / Loading / Error */}
        {selectedVenueId === null || isLoadingTickets ? (
          <Grid container spacing={4}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{ borderRadius: 4, p: 4, height: '100%' }}>
                  <Skeleton width="60%" height={32} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton width="100%" height={24} sx={{ mb: 2 }} />
                  <Skeleton width="80%" height={48} sx={{ mx: 'auto', mb: 3 }} />
                  <Divider sx={{ mb: 3 }} />
                  <Skeleton width="90%" height={24} sx={{ mb: 1 }} />
                  <Skeleton width="85%" height={24} sx={{ mb: 1 }} />
                  <Skeleton width="90%" height={24} sx={{ mb: 3 }} />
                  <Skeleton width="100%" height={48} />
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : isErrorTickets ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
              Lỗi khi tải bảng giá vé cho {currentVenueName}.
            </Alert>
            <Button variant="contained" onClick={handleRetry} startIcon={<RefreshIcon />}>
              Thử lại
            </Button>
          </Box>
        ) : ticketTypes?.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <InfoIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              Chưa cấu hình loại vé nào tại {currentVenueName}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ alignItems: 'stretch', justifyContent: 'center' }}>
            {ticketTypes?.map((ticket, idx) => {
              const isVip = ticket.type.toLowerCase().includes('vip');
              const badge = isVip ? 'Premium' : ticket.type.toLowerCase().includes('child') ? 'Trẻ em' : 'Bán chạy nhất';
              const benefits = getMockBenefits(ticket.type);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={ticket.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    style={{ height: '100%' }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        position: 'relative',
                        border: isVip 
                          ? '2px solid #0d9488' 
                          : '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: isVip 
                          ? '0 10px 30px rgba(13, 148, 136, 0.15)' 
                          : '0 4px 20px rgba(0, 0, 0, 0.02)',
                        backgroundColor: 'background.paper',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.03)',
                        },
                      }}
                    >
                      {/* Badge */}
                      <Chip
                        label={badge}
                        color={isVip ? 'primary' : 'secondary'}
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          px: 1,
                        }}
                      />

                      <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 700,
                            mb: 1.5,
                            color: 'text.primary',
                            textAlign: 'center',
                            mt: 1,
                          }}
                        >
                          {ticket.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3, minHeight: 40, textAlign: 'center', fontSize: '0.875rem' }}
                        >
                          {ticket.description || 'Truy cập vào tất cả trò chơi của công viên theo quy định.'}
                        </Typography>

                        <Box sx={{ mb: 3, textAlign: 'center' }}>
                          <Typography
                            variant="h3"
                            color={isVip ? 'primary.main' : 'text.primary'}
                            sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}
                          >
                            {formatCurrency(ticket.price)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            / khách hàng
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <List sx={{ mb: 3, flexGrow: 1 }}>
                          {benefits.map((benefit, bIdx) => (
                            <ListItem key={bIdx} disableGutters sx={{ py: 0.5, alignItems: 'flex-start' }}>
                              <ListItemIcon sx={{ minWidth: 28, mt: 0.3 }}>
                                <CheckIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Typography variant="body2" color="text.secondary">
                                    {benefit}
                                  </Typography>
                                } 
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>

                      <Box sx={{ p: 4, pt: 0 }}>
                        <Button
                          variant={isVip ? 'contained' : 'outlined'}
                          color="primary"
                          fullWidth
                          size="large"
                          sx={{
                            fontWeight: 'bold',
                            py: 1.5,
                            borderRadius: 2.5,
                          }}
                        >
                          Mua Vé Ngay
                        </Button>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};
