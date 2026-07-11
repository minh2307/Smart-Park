import React, { useState } from 'react';
import { Box, Typography, Container, Stack, Chip, Card, CardMedia, CardContent, Button, Grid, Skeleton, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { useGetRecommendedAttractionsQuery } from '../api/homeApi';

export const AIRecommendation: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Thrill' | 'Family' | 'Water' | 'Kids'>('All');

  const {
    data: recommendedItems,
    isLoading,
    isError,
    refetch,
  } = useGetRecommendedAttractionsQuery({
    category: activeCategory === 'All' ? undefined : activeCategory,
  });

  const categories: Array<'All' | 'Thrill' | 'Family' | 'Water' | 'Kids'> = ['All', 'Thrill', 'Family', 'Water', 'Kids'];

  const getFallbackImage = (category: string): string => {
    const lowercaseCat = category.toLowerCase();
    if (lowercaseCat === 'thrill') {
      return 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80';
    }
    if (lowercaseCat === 'water') {
      return 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80';
    }
    if (lowercaseCat === 'kids') {
      return 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', py: 10 }}>
      <Container maxWidth="lg">
        {/* Title */}
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
          <AutoAwesomeIcon sx={{ color: 'secondary.main', fontSize: '2rem' }} />
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0f172a 30%, #0d9488 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Trợ Lý AI Gợi Ý
          </Typography>
        </Stack>

        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ maxWidth: 600, mx: 'auto', mb: 6 }}
        >
          Chọn sở thích của bạn để Trợ lý AI phân tích và đề xuất lịch trình trò chơi tối ưu nhất tại công viên.
        </Typography>

        {/* Filter Tabs */}
        <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 6, flexWrap: 'wrap', gap: 1.5 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat === 'All' ? 'Tất cả gợi ý' : cat}
              clickable
              onClick={() => setActiveCategory(cat)}
              color={activeCategory === cat ? 'primary' : 'default'}
              variant={activeCategory === cat ? 'filled' : 'outlined'}
              sx={{
                fontSize: '0.9rem',
                fontWeight: 'bold',
                px: 2,
                py: 2.5,
              }}
            />
          ))}
        </Stack>

        {/* Recommendation Grid */}
        <Box sx={{ minHeight: 350 }}>
          {isLoading ? (
            <Grid container spacing={4}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card sx={{ borderRadius: 4, height: '100%' }}>
                    <Skeleton variant="rectangular" height={180} />
                    <CardContent sx={{ p: 3 }}>
                      <Skeleton width="80%" height={28} sx={{ mb: 1.5 }} />
                      <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
                      <Skeleton width="60%" height={20} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : isError ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Alert severity="error" action={
                <Button color="inherit" size="small" onClick={() => refetch()} startIcon={<RefreshIcon />}>
                  Thử lại
                </Button>
              } sx={{ maxWidth: 500, mx: 'auto' }}>
                Lỗi khi kết nối với máy chủ AI Recommendation.
              </Alert>
            </Box>
          ) : recommendedItems?.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <InfoIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                Không có đề xuất phù hợp cho danh mục này.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              <AnimatePresence mode="popLayout">
                {recommendedItems?.map((item, idx) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    key={item.id}
                    component={motion.div}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <Card
                      sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="180"
                          image={item.image || getFallbackImage(item.category)}
                          alt={item.title}
                        />
                        <Chip
                          icon={<StarIcon style={{ color: '#fbbf24', fontSize: '0.9rem' }} />}
                          label={`Độ tương thích: ${item.matchScore}%`}
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            '& .MuiChip-icon': { color: '#fbbf24' },
                          }}
                        />
                      </Box>

                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 1.5 }}>
                          {item.title}
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                          {item.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                          ))}
                        </Stack>
                      </CardContent>

                      <Box sx={{ p: 3, pt: 0 }}>
                        <Button variant="contained" color="primary" fullWidth sx={{ fontWeight: 'bold' }}>
                          Thêm vào Lịch trình
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};
