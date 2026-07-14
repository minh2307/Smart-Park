import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Avatar, Rating, Stack, Paper, Skeleton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import { useGetFeedbacksQuery } from '../api/homeApi';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 9001,
    name: 'Nguyễn Văn Minh',
    role: 'Gia đình 4 thành viên',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Tôi vô cùng ấn tượng với tính năng đặt vé QR và trợ lý AI của Smart Park. Cả nhà vào cổng chưa đầy 30 giây, không phải chờ đợi chút nào!',
  },
  {
    id: 9002,
    name: 'Trần Thị Thảo',
    role: 'Trải nghiệm du lịch cặp đôi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Các trò chơi cảm giác mạnh như Dragon Coaster quá phấn khích! Dịch vụ Fast Pass VIP thực sự đáng tiền để bỏ qua hàng dài xếp hàng.',
  },
  {
    id: 9003,
    name: 'Phạm Minh Tuấn',
    role: 'Khách hàng năm Premium',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    rating: 4.8,
    comment: 'Quy đổi điểm tích lũy thành voucher ẩm thực rất nhanh chóng ngay trên Ví vé. Smart Park thực sự đem lại cảm giác quản lý thông minh.',
  },
];

export const TestimonialSection: React.FC = () => {
  const { data: dbFeedbacks, isLoading } = useGetFeedbacksQuery();
  const [activeIdx, setActiveIdx] = useState(0);

  // Combine DB feedback with default reviews to ensure a rich carousel list
  const getCombinedTestimonials = (): Testimonial[] => {
    if (!dbFeedbacks || !Array.isArray(dbFeedbacks) || dbFeedbacks.length === 0) {
      return DEFAULT_TESTIMONIALS;
    }

    const mappedDb = dbFeedbacks.map((f) => ({
      id: f.id,
      name: f.customerName || 'Khách hàng ẩn danh',
      role: f.category === 'RIDE' ? 'Trải nghiệm trò chơi' : f.category === 'SERVICE' ? 'Dịch vụ khách hàng' : 'Khách hàng',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + f.id * 100000}?auto=format&fit=crop&w=150&q=80`,
      rating: f.rating,
      comment: f.content,
    }));

    // Merge them: DB feedback first, then default reviews
    return [...mappedDb, ...DEFAULT_TESTIMONIALS].slice(0, 5);
  };

  const testimonials = getCombinedTestimonials();

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  // Adjust active index if it exceeds list size due to async data updates
  useEffect(() => {
    if (activeIdx >= testimonials.length) {
      setActiveIdx(0);
    }
  }, [testimonials, activeIdx]);

  return (
    <Box sx={{ backgroundColor: 'rgba(13, 148, 136, 0.02)', py: 10 }}>
      <Container maxWidth="md">
        {/* Title */}
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
            Ý Kiến Khách Hàng
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lắng nghe chia sẻ từ những vị khách thực tế sau ngày trải nghiệm tại công viên của chúng tôi.
          </Typography>
        </Box>

        {/* Carousel Window */}
        <Paper
          elevation={4}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            border: '1px solid rgba(226, 232, 240, 0.8)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: 220,
          }}
        >
          {isLoading ? (
            <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Skeleton variant="circular" width={80} height={80} />
              <Skeleton width={120} height={24} />
              <Skeleton width="80%" height={24} />
              <Skeleton width="60%" height={20} />
            </Stack>
          ) : (
            <AnimatePresence mode="wait">
              {testimonials.length > 0 && testimonials[activeIdx] && (
                <Box
                  key={testimonials[activeIdx].id}
                  component={motion.div}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
                    <Avatar
                      src={testimonials[activeIdx].avatar}
                      alt={testimonials[activeIdx].name}
                      sx={{ width: 80, height: 80, border: '3px solid #0d9488' }}
                      onError={(e) => {
                        // Fallback avatar if unsplash image fails
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                      }}
                    />

                    <Rating
                      value={testimonials[activeIdx].rating}
                      precision={0.1}
                      readOnly
                      emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                    />

                    <Typography
                      variant="h6"
                      sx={{
                        fontStyle: 'italic',
                        fontWeight: 500,
                        lineHeight: 1.6,
                        color: 'text.primary',
                        maxWidth: 700,
                      }}
                    >
                      "{testimonials[activeIdx].comment}"
                    </Typography>

                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {testimonials[activeIdx].name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonials[activeIdx].role}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </AnimatePresence>
          )}

          {/* Dots Indicator */}
          {!isLoading && testimonials.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ mt: 4, justifyContent: 'center' }}>
              {testimonials.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  sx={{
                    width: idx === activeIdx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: idx === activeIdx ? 'primary.main' : 'rgba(13, 148, 136, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
};
