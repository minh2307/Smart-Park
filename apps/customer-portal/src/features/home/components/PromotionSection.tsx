import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Button, Stack, Paper, IconButton, Chip, Skeleton, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { formatCurrency } from '@shared/utils';
import { useGetPromotionsQuery } from '../api/homeApi';

export const PromotionSection: React.FC = () => {
  const { data: promotions, isLoading, isError, refetch } = useGetPromotionsQuery();
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 25, seconds: 30 });
  const [claimedVouchers, setClaimedVouchers] = useState<number[]>([]);

  // Simple countdown ticker simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaim = (id: number) => {
    if (claimedVouchers.includes(id)) return;
    setClaimedVouchers((prev) => [...prev, id]);
  };

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const formatDiscount = (type: string, value: number): string => {
    if (type.toUpperCase() === 'PERCENTAGE') {
      return `${Math.round(value)}% OFF`;
    }
    return `${formatCurrency(value)} OFF`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return `Hạn dùng: ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch {
      return `Hạn dùng: ${dateString}`;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Grid container spacing={4} sx={{ alignItems: 'center' }}>
        {/* Countdown Flash Deal Banner */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={10}
            sx={{
              p: 5,
              borderRadius: 4,
              backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background design accents */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -50,
                right: -50,
                width: 250,
                height: 250,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }}
            />

            <Stack spacing={3}>
              <Box>
                <Chip
                  label="Flash Deal Đang Diễn Ra"
                  color="warning"
                  sx={{ fontWeight: 'bold', mb: 2, fontSize: '0.8rem' }}
                />
                <Typography
                  variant="h3"
                  sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, mb: 1, lineHeight: 1.2 }}
                >
                  Ưu Đãi Đặt Vé Giờ Vàng
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Nhập mã <strong style={{ color: '#fbbf24' }}>GOLDENHOUR</strong> khi thanh toán để nhận ngay ưu đãi giảm 20% tổng giá trị hóa đơn.
                </Typography>
              </Box>

              {/* Countdown Ticker */}
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <AccessTimeFilledIcon sx={{ color: 'secondary.main', fontSize: '2rem' }} />
                <Stack direction="row" spacing={1}>
                  {[{ label: 'Giờ', value: timeLeft.hours }, { label: 'Phút', value: timeLeft.minutes }, { label: 'Giây', value: timeLeft.seconds }].map((t, idx) => (
                    <Stack key={idx} sx={{ alignItems: 'center' }}>
                      <Paper
                        sx={{
                          width: 60,
                          height: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold" sx={{ color: '#ffffff' }}>
                          {formatNumber(t.value)}
                        </Typography>
                      </Paper>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
                        {t.label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>

              <Button
                variant="contained"
                color="secondary"
                size="large"
                sx={{
                  fontWeight: 'bold',
                  py: 1.5,
                  alignSelf: 'flex-start',
                  color: '#0f172a',
                }}
              >
                Nhận Ưu Đãi Ngay
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Voucher Cards Column */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, mb: 1 }}>
                Kho Voucher Của Bạn
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nhấn "Thu thập" để lưu mã giảm giá vào tài khoản của bạn. Mã sẽ tự động được gợi ý khi đặt vé.
              </Typography>
            </Box>

            {isLoading ? (
              [1, 2].map((i) => (
                <Card
                  key={i}
                  sx={{
                    borderRadius: 3,
                    border: '1px dashed rgba(13, 148, 136, 0.4)',
                    boxShadow: 'none',
                  }}
                >
                  <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', width: '100%' }}>
                      <Skeleton variant="circular" width={56} height={56} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton width="40%" height={28} sx={{ mb: 1 }} />
                        <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
                        <Skeleton width="80%" height={16} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            ) : isError ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Alert severity="error" action={
                  <Button color="inherit" size="small" onClick={() => refetch()} startIcon={<RefreshIcon />}>
                    Tải lại
                  </Button>
                } sx={{ mb: 2 }}>
                  Không thể tải danh sách ưu đãi.
                </Alert>
              </Box>
            ) : promotions?.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <InfoIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 1.5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  Hiện tại không có chương trình khuyến mãi nào được phát hành.
                </Typography>
              </Box>
            ) : (
              promotions?.map((promo) => {
                const isClaimed = claimedVouchers.includes(promo.id);
                const discountText = formatDiscount(promo.discountType, promo.value);
                const promoCode = `PROMO${promo.id}`;
                
                return (
                  <Card
                    key={promo.id}
                    sx={{
                      borderRadius: 3,
                      border: '1px dashed rgba(13, 148, 136, 0.4)',
                      backgroundColor: 'rgba(13, 148, 136, 0.02)',
                      boxShadow: 'none',
                      position: 'relative',
                    }}
                  >
                    <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexGrow: 1, mr: 2 }}>
                        <IconButton color="primary" sx={{ backgroundColor: 'rgba(13, 148, 136, 0.1)', p: 2 }}>
                          <LocalActivityIcon sx={{ fontSize: '2rem' }} />
                        </IconButton>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                            {discountText}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {promo.name} (Mã: {promoCode})
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {promo.description}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatDate(promo.endDate)}
                          </Typography>
                        </Box>
                      </Stack>

                      <Button
                        component={motion.button}
                        whileTap={{ scale: 0.95 }}
                        variant={isClaimed ? 'text' : 'contained'}
                        color={isClaimed ? 'success' : 'primary'}
                        onClick={() => handleClaim(promo.id)}
                        startIcon={isClaimed ? <CheckCircleIcon /> : undefined}
                        sx={{
                          fontWeight: 'bold',
                          minWidth: 120,
                          flexShrink: 0,
                        }}
                      >
                        {isClaimed ? 'Đã Nhận' : 'Thu Thập'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};
