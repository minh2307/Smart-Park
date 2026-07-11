import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, CardActions, Button, Chip, Stack, Skeleton, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useGetVenuesQuery, useGetVenueAttractionsQuery } from '../api/homeApi';

const getAttractionImage = (name: string, code: string): string => {
  const lowercaseName = name.toLowerCase();
  const lowercaseCode = code.toLowerCase();
  
  if (lowercaseName.includes('hố đen') || lowercaseCode.includes('black_hole')) {
    return 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80';
  }
  if (lowercaseName.includes('bể tạo sóng') || lowercaseCode.includes('wave_pool') || lowercaseName.includes('nước')) {
    return 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=800&q=80';
  }
  if (lowercaseName.includes('tàu lượn') || lowercaseCode.includes('roller_coaster') || lowercaseName.includes('rồng')) {
    return 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80';
};

const getCategory = (minHeight?: number): string => {
  if (!minHeight) return 'Family';
  if (minHeight >= 1.3) return 'Thrill';
  if (minHeight >= 1.1) return 'Water';
  return 'Kids';
};

export const FeaturedAttractions: React.FC = () => {
  const { data: venues, isLoading: isLoadingVenues, isError: isErrorVenues, refetch: refetchVenues } = useGetVenuesQuery();
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);

  useEffect(() => {
    if (venues && venues.length > 0 && selectedVenueId === null) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  const {
    data: attractions,
    isLoading: isLoadingAttractions,
    isError: isErrorAttractions,
    refetch: refetchAttractions
  } = useGetVenueAttractionsQuery(selectedVenueId ?? 0, {
    skip: selectedVenueId === null,
  });

  const handleRetry = () => {
    if (isErrorVenues) {
      refetchVenues();
    } else {
      refetchAttractions();
    }
  };

  const currentVenueName = venues?.find(v => v.id === selectedVenueId)?.name ?? '';

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      {/* Section Title */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
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
          Trò Chơi Nổi Bật
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
        >
          Trải nghiệm những trò chơi đỉnh cao được yêu thích nhất từ cảm giác mạnh tột độ đến thế giới cổ tích nhiệm màu.
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
          }>
            Không thể tải danh sách địa điểm. Vui lòng kiểm tra kết nối mạng.
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

      {/* Attractions Grid / Loading / Error */}
      {selectedVenueId === null || isLoadingAttractions ? (
        <Grid container spacing={4}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ borderRadius: 4, height: '100%' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent sx={{ p: 3 }}>
                  <Skeleton width="40%" height={24} sx={{ mb: 1.5 }} />
                  <Skeleton width="80%" height={32} sx={{ mb: 1.5 }} />
                  <Skeleton width="100%" height={60} sx={{ mb: 2 }} />
                  <Skeleton width="60%" height={24} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : isErrorAttractions ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            Lỗi khi tải thông tin trò chơi thuộc {currentVenueName}.
          </Alert>
          <Button variant="contained" onClick={handleRetry} startIcon={<RefreshIcon />}>
            Thử lại
          </Button>
        </Box>
      ) : attractions?.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <InfoIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Không tìm thấy trò chơi nào tại {currentVenueName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Vui lòng chọn địa điểm khác để khám phá.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {attractions?.map((attraction, idx) => {
            const category = getCategory(attraction.minHeight);
            return (
              <Grid item xs={12} sm={6} md={3} key={attraction.id}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  sx={{ height: '100%' }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
                      transition: 'box-shadow 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 10px 40px rgba(13, 148, 136, 0.15)',
                      },
                    }}
                  >
                    {/* Category Chip */}
                    <Chip
                      label={category}
                      color={
                        category === 'Thrill'
                          ? 'error'
                          : category === 'Water'
                          ? 'info'
                          : category === 'Kids'
                          ? 'warning'
                          : 'primary'
                      }
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        zIndex: 2,
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                      }}
                    />

                    <Box sx={{ overflow: 'hidden', position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={getAttractionImage(attraction.name, attraction.code)}
                        alt={attraction.name}
                        sx={{
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="h5"
                        component="h3"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 700,
                          mb: 1.5,
                          color: 'text.primary',
                        }}
                      >
                        {attraction.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3, lineHeight: 1.5, flexGrow: 1 }}
                      >
                        {attraction.description || 'Chưa có mô tả chi tiết cho trò chơi này.'}
                      </Typography>

                      <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                          <AccessTimeIcon sx={{ fontSize: '1rem' }} />
                          <Typography variant="caption">
                            {attraction.durationSeconds ? `${Math.round(attraction.durationSeconds / 60)} phút` : '3 phút'}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                          <ChildCareIcon sx={{ fontSize: '1rem' }} />
                          <Typography variant="caption">
                            {attraction.minHeight ? `>= ${attraction.minHeight}m` : 'Mọi lứa tuổi'}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button variant="outlined" color="primary" fullWidth sx={{ fontWeight: 'bold' }}>
                        Khám phá chi tiết
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};
