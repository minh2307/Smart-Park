import React, { useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Chip,
  Skeleton,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  useTheme,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import StarsIcon from '@mui/icons-material/Stars';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HistoryIcon from '@mui/icons-material/History';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { selectActiveTab, setActiveTab } from '../store/membershipSlice';
import {
  useGetMembershipsQuery,
  useGetMembershipHistoryQuery,
  useGetCouponsQuery,
} from '../api/membershipApi';
import type { Membership, PointHistory, MembershipTier } from '../types/membership.types';

// Mock list of all tiers since there is no API endpoint for all tiers
const TIERS_LIST: MembershipTier[] = [
  {
    id: 1,
    name: 'Silver',
    code: 'SILVER',
    discountPercentage: 0,
    pointsMultiplier: 1.0,
    minSpend: 0,
  },
  {
    id: 2,
    name: 'Gold',
    code: 'GOLD',
    discountPercentage: 5.0,
    pointsMultiplier: 1.5,
    minSpend: 500000,
  },
  {
    id: 3,
    name: 'Platinum',
    code: 'PLATINUM',
    discountPercentage: 10.0,
    pointsMultiplier: 2.0,
    minSpend: 1000000,
  },
];

export const MembershipPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);

  // Auth user details
  const { user } = useAppSelector((state) => state.auth);
  const customerId = user?.id || 0;

  // 1. Fetch memberships to find the user's membership
  const { data: membershipsData, isLoading: isLoadingMemberships, error: errorMemberships } = useGetMembershipsQuery(
    { page: 0, size: 100 },
    { skip: !customerId }
  );

  // Extract customer's membership
  const customerMembership = useMemo(() => {
    if (!membershipsData?.content) return null;
    return membershipsData.content.find((m: any) => m.customer?.id === customerId) || null;
  }, [membershipsData, customerId]);

  // Fallback membership object in case table is not pre-populated in dev env
  const membership: Membership = useMemo(() => {
    if (customerMembership) return customerMembership;
    return {
      id: 999,
      membershipCode: `MEM-${100000 + customerId}`,
      points: 120, // default start points
      joinDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      tier: TIERS_LIST[0], // Starts at Silver
      customer: user ? { id: user.id, fullName: user.fullName, email: user.email } : null,
      createdAt: new Date().toISOString(),
    };
  }, [customerMembership, user, customerId]);

  // 2. Fetch point history
  const { data: pointHistory = [], isLoading: isLoadingHistory } = useGetMembershipHistoryQuery(
    membership.id,
    { skip: !membership.id }
  );

  // 3. Fetch vouchers/coupons
  const { data: couponsData, isLoading: isLoadingCoupons } = useGetCouponsQuery({ page: 0, size: 100 });
  const coupons = couponsData?.content || [];

  // Determine next tier and progress calculation
  const currentTierIndex = useMemo(() => {
    return TIERS_LIST.findIndex((t) => t.code === membership.tier.code);
  }, [membership.tier]);

  const nextTier = useMemo(() => {
    if (currentTierIndex === -1 || currentTierIndex >= TIERS_LIST.length - 1) return null;
    return TIERS_LIST[currentTierIndex + 1];
  }, [currentTierIndex]);

  const progressPercentage = useMemo(() => {
    if (!nextTier) return 100;
    const currentPoints = membership.points;
    const nextPoints = nextTier.minSpend / 10000; // 10000 VND = 1 Point
    return Math.min(100, Math.max(0, (currentPoints / nextPoints) * 100));
  }, [membership.points, nextTier]);

  const requiredPointsForNextTier = useMemo(() => {
    if (!nextTier) return 0;
    const nextPoints = nextTier.minSpend / 10000;
    return Math.max(0, nextPoints - membership.points);
  }, [membership.points, nextTier]);

  // Helpers for tier styling
  const getTierColor = (code: string) => {
    switch (code) {
      case 'PLATINUM':
        return '#0288d1';
      case 'GOLD':
        return '#ed6c02';
      case 'SILVER':
      default:
        return '#94a3b8';
    }
  };

  const getTierGlow = (code: string) => {
    switch (code) {
      case 'PLATINUM':
        return '0 8px 32px rgba(2, 136, 209, 0.25)';
      case 'GOLD':
        return '0 8px 32px rgba(237, 108, 2, 0.25)';
      case 'SILVER':
      default:
        return '0 8px 24px rgba(255, 255, 255, 0.05)';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '85vh',
        bgcolor: '#0f172a',
        color: '#ffffff',
        py: 6,
        background: 'radial-gradient(circle at top right, rgba(20, 184, 166, 0.08), transparent 40%)',
      }}
    >
      <Container maxWidth="lg">
        {/* Title */}
        <Box sx={{ mb: 5 }}>
          <Typography
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.8rem' },
              background: 'linear-gradient(135deg, #ffffff 50%, #2dd4bf 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Thành Viên & Ưu Đãi
          </Typography>
          <Typography color="rgba(255, 255, 255, 0.6)" variant="body1">
            Tích lũy điểm thưởng từ mọi giao dịch, thăng hạng thẻ và đổi hàng ngàn voucher hấp dẫn tại Smart Park.
          </Typography>
        </Box>

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => dispatch(setActiveTab(val))}
            textColor="inherit"
            indicatorColor="secondary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                bgcolor: '#2dd4bf',
              },
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 600,
                fontSize: '0.95rem',
                minWidth: 'auto',
                px: 3,
                '&.Mui-selected': {
                  color: '#2dd4bf',
                },
              },
            }}
          >
            <Tab value="DASHBOARD" icon={<StarsIcon />} label="Thẻ Thành Viên" iconPosition="start" />
            <Tab value="TIERS" icon={<LoyaltyIcon />} label="Hạng Thẻ & Đặc Quyền" iconPosition="start" />
            <Tab value="VOUCHERS" icon={<CardGiftcardIcon />} label="Kho Voucher" iconPosition="start" />
            <Tab value="HISTORY" icon={<HistoryIcon />} label="Lịch Sử Điểm" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'DASHBOARD' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={4}>
                {/* Membership Card Visual */}
                <Grid item xs={12} md={5}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)`,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${getTierColor(membership.tier.code)}50`,
                      boxShadow: getTierGlow(membership.tier.code),
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden',
                      height: 260,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: 3,
                    }}
                  >
                    {/* Glowing background highlights based on Tier */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${getTierColor(membership.tier.code)}40 0%, transparent 70%)`,
                        filter: 'blur(10px)',
                      }}
                    />

                    {/* Top Tier Info */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ zIndex: 2 }}>
                      <Stack>
                        <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#ffffff' }}>
                          SMART PARK VIP CARD
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                          Mã số: {membership.membershipCode}
                        </Typography>
                      </Stack>
                      <Chip
                        icon={<StarIcon sx={{ color: '#fff !important' }} />}
                        label={membership.tier.name.toUpperCase()}
                        sx={{
                          bgcolor: getTierColor(membership.tier.code),
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      />
                    </Stack>

                    {/* Customer Profile Link */}
                    <Box sx={{ zIndex: 2 }}>
                      <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 0.5 }}>
                        {user?.fullName || 'Khách Hàng'}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.5)">
                        Ngày tham gia: {membership.joinDate}
                      </Typography>
                    </Box>

                    {/* Bottom balance */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
                      <Stack>
                        <Typography variant="caption" color="rgba(255,255,255,0.4)">
                          Điểm tích lũy hiện tại
                        </Typography>
                        <Typography variant="h4" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#2dd4bf' }}>
                          {membership.points} <span style={{ fontSize: '1rem', fontWeight: 500 }}>điểm</span>
                        </Typography>
                      </Stack>
                      <Chip
                        size="small"
                        label="Hoạt động"
                        color="success"
                        variant="outlined"
                        sx={{ borderColor: '#2e7d32', color: '#2e7d32', fontWeight: 'bold' }}
                      />
                    </Stack>
                  </Card>
                </Grid>

                {/* Progress & Next Tier details */}
                <Grid item xs={12} md={7}>
                  <Card
                    sx={{
                      bgcolor: 'rgba(30, 41, 59, 0.4)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 4,
                      p: 3.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    {nextTier ? (
                      <Stack spacing={3.5}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            Thăng hạng tiếp theo: <span style={{ color: getTierColor(nextTier.code) }}>{nextTier.name}</span>
                            <ArrowUpwardIcon sx={{ color: '#2dd4bf' }} />
                          </Typography>
                          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
                            Cần thêm <strong>{requiredPointsForNextTier} điểm</strong> để đạt mốc chi tiêu {nextTier.minSpend.toLocaleString('vi-VN')} VND.
                          </Typography>
                        </Box>

                        {/* Progress Bar */}
                        <Box>
                          <LinearProgress
                            variant="determinate"
                            value={progressPercentage}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              bgcolor: 'rgba(255, 255, 255, 0.08)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#2dd4bf',
                                borderRadius: 5,
                              },
                            }}
                          />
                          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="caption" color="rgba(255,255,255,0.4)">
                              Hạng hiện tại ({membership.tier.name})
                            </Typography>
                            <Typography variant="caption" color="rgba(255,255,255,0.4)">
                              Mốc thăng hạng ({nextTier.name})
                            </Typography>
                          </Stack>
                        </Box>

                        <Alert
                          severity="info"
                          icon={<InfoIcon />}
                          sx={{
                            bgcolor: 'rgba(2, 136, 209, 0.08)',
                            border: '1px solid rgba(2, 136, 209, 0.2)',
                            color: '#ffffff',
                            '& .MuiAlert-icon': { color: '#0288d1' },
                          }}
                        >
                          Quy tắc tích lũy: Mỗi <strong>10,000 VND</strong> thanh toán đơn hàng thành công sẽ tích lũy được <strong>1 điểm cơ bản</strong>. Điểm thực tế nhân thêm theo hạng thẻ.
                        </Alert>
                      </Stack>
                    ) : (
                      <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 2 }}>
                        <EmojiEventsIcon sx={{ fontSize: 60, color: '#ed6c02', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#ed6c02' }}>
                          Hạng Thẻ Cao Nhất Đạt Được!
                        </Typography>
                        <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
                          Xin chúc mừng! Bạn đang sở hữu thẻ hạng <strong>{membership.tier.name}</strong> cao cấp nhất với đầy đủ các đặc quyền tối thượng của Smart Park.
                        </Typography>
                      </Stack>
                    )}
                  </Card>
                </Grid>

                {/* Benefits Summary Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
                    Đặc Quyền Của Bạn ({membership.tier.name})
                  </Typography>

                  <Grid container spacing={3}>
                    {[
                      {
                        title: `Giảm giá vé dịch vụ: ${membership.tier.discountPercentage}%`,
                        desc: 'Tự động áp dụng khi thanh toán đặt vé và các gói combo trực tuyến trên cổng portal.',
                      },
                      {
                        title: `Hệ số tích điểm: x${membership.tier.pointsMultiplier}`,
                        desc: 'Tăng tốc tích điểm thưởng từ mọi giao dịch ăn uống, trò chơi và mua sắm trong công viên.',
                      },
                      {
                        title: 'Hỗ trợ khách hàng ưu tiên',
                        desc: 'Được hỗ trợ nhanh nhất bởi tư vấn viên qua trợ lý chatbot AI và các cổng dịch vụ.',
                      },
                    ].map((benefit, idx) => (
                      <Grid item xs={12} sm={4} key={idx}>
                        <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3, height: '100%' }}>
                          <CardContent>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                              <CheckCircleIcon sx={{ color: '#2dd4bf' }} />
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {benefit.title}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                              {benefit.desc}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {activeTab === 'TIERS' && (
            <motion.div
              key="tiers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={4}>
                {TIERS_LIST.map((tierItem) => {
                  const isCurrent = tierItem.code === membership.tier.code;
                  return (
                    <Grid item xs={12} md={4} key={tierItem.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          bgcolor: isCurrent ? 'rgba(30, 41, 59, 0.6)' : 'rgba(30, 41, 59, 0.2)',
                          backdropFilter: 'blur(20px)',
                          border: isCurrent ? `2px solid ${getTierColor(tierItem.code)}` : '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: isCurrent ? getTierGlow(tierItem.code) : 'none',
                          borderRadius: 4,
                          position: 'relative',
                          overflow: 'hidden',
                          p: 1.5,
                        }}
                      >
                        {isCurrent && (
                          <Chip
                            label="Hạng thẻ của bạn"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 15,
                              right: 15,
                              bgcolor: '#2dd4bf',
                              color: '#0f172a',
                              fontWeight: 'bold',
                            }}
                          />
                        )}

                        <CardContent sx={{ p: 2.5 }}>
                          <Typography
                            variant="h5"
                            sx={{
                              fontFamily: 'Outfit, sans-serif',
                              fontWeight: 800,
                              color: getTierColor(tierItem.code),
                              mb: 1,
                            }}
                          >
                            {tierItem.name}
                          </Typography>

                          <Typography variant="body2" color="rgba(255,255,255,0.4)" sx={{ mb: 3 }}>
                            Mốc chi tiêu: {tierItem.minSpend === 0 ? 'Mặc định khi đăng ký' : `Từ ${tierItem.minSpend.toLocaleString('vi-VN')} VND`}
                          </Typography>

                          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 3 }} />

                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <CheckCircleIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />
                              <Typography variant="body2">
                                Giảm giá dịch vụ: <strong>{tierItem.discountPercentage}%</strong>
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <CheckCircleIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />
                              <Typography variant="body2">
                                Hệ số tích điểm: <strong>x{tierItem.pointsMultiplier}</strong>
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <CheckCircleIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />
                              <Typography variant="body2">
                                {tierItem.code === 'SILVER' ? 'Hỗ trợ dịch vụ cơ bản' : tierItem.code === 'GOLD' ? 'Ưu tiên check-in cổng phụ' : 'VIP Fast-Pass & Quầy check-in riêng'}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <CheckCircleIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />
                              <Typography variant="body2">
                                {tierItem.code === 'SILVER' ? 'Khuyến mãi theo chiến dịch' : tierItem.code === 'GOLD' ? 'Quà tặng ngày sinh nhật' : 'Tham dự Show sự kiện độc quyền & Birthday Combo'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </motion.div>
          )}

          {activeTab === 'VOUCHERS' && (
            <motion.div
              key="vouchers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {isLoadingCoupons ? (
                <Grid container spacing={3}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Skeleton variant="rectangular" height={180} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }} />
                    </Grid>
                  ))}
                </Grid>
              ) : coupons.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <LocalActivityIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                  <Typography variant="h6" color="rgba(255,255,255,0.5)">
                    Hiện tại chưa có mã giảm giá nào khả dụng.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {coupons.map((coupon) => (
                    <Grid item xs={12} sm={6} md={4} key={coupon.id}>
                      <Card
                        sx={{
                          bgcolor: 'rgba(30, 41, 59, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 3,
                          position: 'relative',
                          overflow: 'hidden',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: '#2dd4bf',
                          },
                        }}
                      >
                        {/* Cut-out ticket circle details for ticket feeling */}
                        <Box sx={{ position: 'absolute', top: '50%', left: -8, width: 16, height: 16, borderRadius: '50%', bgcolor: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.08)' }} />
                        <Box sx={{ position: 'absolute', top: '50%', right: -8, width: 16, height: 16, borderRadius: '50%', bgcolor: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.08)' }} />

                        <CardContent sx={{ p: 3 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Chip label={`Giảm ${coupon.discountPercentage}%`} color="secondary" size="small" sx={{ fontWeight: 'bold', color: '#0f172a' }} />
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#2dd4bf' }}>
                              {coupon.code}
                            </Typography>
                          </Stack>

                          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {coupon.name}
                          </Typography>
                          {coupon.description && (
                            <Typography variant="body2" color="rgba(255,255,255,0.5)" sx={{ mb: 2 }}>
                              {coupon.description}
                            </Typography>
                          )}
                          {coupon.minSpend && (
                            <Typography variant="caption" display="block" color="rgba(255,255,255,0.4)">
                              Đơn tối thiểu: {coupon.minSpend.toLocaleString('vi-VN')} VND
                            </Typography>
                          )}
                        </CardContent>

                        <Box sx={{ p: 3, pt: 0 }}>
                          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2, borderStyle: 'dashed' }} />
                          <Typography variant="caption" color="rgba(255,255,255,0.4)">
                            Hạn sử dụng: {coupon.endDate || 'Vô thời hạn'}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </motion.div>
          )}

          {activeTab === 'HISTORY' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {isLoadingHistory ? (
                <Stack spacing={2}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton variant="rectangular" height={50} key={idx} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                  ))}
                </Stack>
              ) : pointHistory.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <HistoryIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                  <Typography variant="h6" color="rgba(255,255,255,0.5)">
                    Bạn chưa có giao dịch tích điểm nào. Điểm thưởng sẽ tự động tích lũy khi mua vé thành công.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Thời gian</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Nội dung chi tiết</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Mã Đơn</TableCell>
                        <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Điểm thưởng</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pointHistory.map((logItem) => (
                        <TableRow key={logItem.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <TableCell sx={{ color: '#ffffff' }}>{logItem.createdAt}</TableCell>
                          <TableCell sx={{ color: '#ffffff' }}>{logItem.reason}</TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
                            {logItem.orderId ? `#${logItem.orderId}` : 'N/A'}
                          </TableCell>
                          <TableCell align="right">
                            {logItem.pointsEarned > 0 ? (
                              <Chip
                                label={`+${logItem.pointsEarned}`}
                                size="small"
                                sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#4caf50', fontWeight: 'bold', border: '1px solid rgba(46, 125, 50, 0.3)' }}
                              />
                            ) : logItem.pointsRedeemed > 0 ? (
                              <Chip
                                label={`-${logItem.pointsRedeemed}`}
                                size="small"
                                sx={{ bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#f44336', fontWeight: 'bold', border: '1px solid rgba(211, 47, 47, 0.3)' }}
                              />
                            ) : (
                              '0'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};
