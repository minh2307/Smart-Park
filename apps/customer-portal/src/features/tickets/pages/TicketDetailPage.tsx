import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Grid, Typography, Button, Stack, Chip,
  Divider, Paper, Alert, Accordion, AccordionSummary, AccordionDetails,
  Breadcrumbs, Link, Skeleton, alpha, useTheme,
} from '@mui/material';
import {
  ArrowBack, AddShoppingCart, ExpandMore, CheckCircle,
  AccessTime, PeopleAlt, LocalOffer,
  NavigateNext,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTicketDetail, fetchTicketTypes } from '../store/ticketSlice';
import {
  selectSelectedDetail, selectLoading, selectError, selectSelectedVenueId,
  selectFilteredTickets,
} from '../store/ticketSelectors';
import { enrichTicket } from '../utils/enrichTicket';
import { TicketBadge } from '../components/TicketBadge';
import { TicketPrice } from '../components/TicketPrice';
import { TicketCard } from '../components/TicketCard';
import { toggleCompare } from '../store/ticketSlice';
import { selectCompareIds } from '../store/ticketSelectors';

const FAQS = [
  {
    q: 'Vé có thể sử dụng vào bất kỳ ngày nào không?',
    a: 'Vé có giá trị sử dụng trong ngày bạn đặt, trừ loại vé Theo Mùa có thể sử dụng trong 365 ngày.',
  },
  {
    q: 'Tôi có thể hoàn vé không?',
    a: 'Vé có thể hoàn trước 24 giờ so với ngày tham quan. Vui lòng liên hệ bộ phận hỗ trợ để được xử lý.',
  },
  {
    q: 'Trẻ em dưới bao nhiêu tuổi được miễn phí?',
    a: 'Trẻ em dưới 3 tuổi được vào cổng miễn phí khi có người lớn đi kèm.',
  },
  {
    q: 'Làm thế nào để nhận vé sau khi thanh toán?',
    a: 'Sau khi thanh toán thành công, mã QR vé sẽ được gửi vào email và hiển thị trong ví vé điện tử của bạn.',
  },
];

const GALLERY_SEEDS = ['park-ride-1', 'park-show-2', 'park-family-3', 'park-food-4'];

export const TicketDetailPage: React.FC = () => {
  const { venueId, ticketId } = useParams<{ venueId: string; ticketId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const [selectedImage, setSelectedImage] = useState(0);

  const rawDetail = useAppSelector(selectSelectedDetail);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const venueIdNum = useAppSelector(selectSelectedVenueId) ?? Number(venueId);
  const compareIds = useAppSelector(selectCompareIds);
  const relatedTickets = useAppSelector(selectFilteredTickets).slice(0, 4);

  const detail = rawDetail ? enrichTicket(rawDetail) : null;

  useEffect(() => {
    if (venueId && ticketId) {
      dispatch(fetchTicketDetail({ venueId: Number(venueId), ticketId: Number(ticketId) }));
      dispatch(fetchTicketTypes(Number(venueId)));
    }
  }, [dispatch, venueId, ticketId]);

  const images = detail
    ? [
        detail.imageUrl ?? `https://picsum.photos/seed/${detail.name}/900/540`,
        ...GALLERY_SEEDS.map((s) => `https://picsum.photos/seed/${s}/900/540`),
      ]
    : [];

  if (loading.detail) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Skeleton variant="rounded" height={460} sx={{ mb: 3 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={160} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !detail) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Không thể tải thông tin vé. Vui lòng thử lại.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Quay lại danh sách vé
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* Breadcrumb */}
      <Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04), py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ fontSize: '0.82rem' }}>
            <Link underline="hover" color="inherit" href="/" sx={{ cursor: 'pointer' }}>Trang chủ</Link>
            <Link underline="hover" color="inherit" onClick={() => navigate('/tickets')} sx={{ cursor: 'pointer' }}>Danh mục vé</Link>
            <Typography color="text.primary" sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{detail.name}</Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* ── Left: Gallery + Info ── */}
          <Grid item xs={12} md={8}>
            {/* Image gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <Box sx={{ borderRadius: 4, overflow: 'hidden', mb: 2, position: 'relative' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={images[selectedImage]}
                    alt={detail.name}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{
                      width: '100%',
                      height: 380,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </AnimatePresence>
              </Box>

              {/* Thumbnails */}
              <Stack direction="row" spacing={1.5} sx={{ mb: 4, overflowX: 'auto', pb: 0.5 }}>
                {images.map((img, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={img}
                    alt={`thumbnail-${i}`}
                    onClick={() => setSelectedImage(i)}
                    sx={{
                      width: 80,
                      height: 56,
                      objectFit: 'cover',
                      borderRadius: 2,
                      cursor: 'pointer',
                      flexShrink: 0,
                      border: '2px solid',
                      borderColor: selectedImage === i ? 'primary.main' : 'transparent',
                      opacity: selectedImage === i ? 1 : 0.65,
                      transition: 'all 0.2s ease',
                      '&:hover': { opacity: 1 },
                    }}
                  />
                ))}
              </Stack>
            </motion.div>

            {/* Title + badges */}
            <TicketBadge
              category={detail.category}
              isPromotion={detail.isPromotion}
              discountPercent={detail.discountPercent}
              isPopular={detail.isPopular}
              size="medium"
            />
            <Typography
              variant="h4"
              fontWeight={800}
              fontFamily="Outfit, sans-serif"
              sx={{ mt: 1.5, mb: 1, lineHeight: 1.2 }}
            >
              {detail.name}
            </Typography>

            {/* Meta chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                size="small"
                icon={<AccessTime fontSize="small" />}
                label={detail.durationDays === 1 ? 'Trong ngày' : `${detail.durationDays} ngày`}
                variant="outlined"
              />
              {detail.availableCount !== undefined && (
                <Chip
                  size="small"
                  icon={<PeopleAlt fontSize="small" />}
                  label={`Còn ${detail.availableCount} vé`}
                  variant="outlined"
                  color={detail.availableCount < 20 ? 'error' : 'default'}
                />
              )}
              {detail.ageMin === 0 && detail.ageMax === 99 && (
                <Chip size="small" label="Phù hợp mọi lứa tuổi" variant="outlined" />
              )}
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Benefits */}
            <Typography variant="h6" fontWeight={700} fontFamily="Outfit, sans-serif" sx={{ mb: 2 }}>
              Quyền lợi bao gồm
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 4 }}>
              {detail.benefits?.map((b, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{b}</Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>

            {/* Map placeholder */}
            <Typography variant="h6" fontWeight={700} fontFamily="Outfit, sans-serif" sx={{ mb: 2 }}>
              Vị trí khu vui chơi
            </Typography>
            <Box
              sx={{
                height: 200,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <LocalOffer sx={{ fontSize: 36, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary">
                  Bản đồ khu vui chơi
                </Typography>
              </Stack>
            </Box>

            {/* FAQ */}
            <Typography variant="h6" fontWeight={700} fontFamily="Outfit, sans-serif" sx={{ mb: 2 }}>
              Câu hỏi thường gặp
            </Typography>
            {FAQS.map((faq, i) => (
              <Accordion
                key={i}
                disableGutters
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px !important',
                  mb: 1,
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{ px: 2.5, py: 1.5, '& .MuiAccordionSummary-content': { m: 0 } }}
                >
                  <Typography variant="body2" fontWeight={600}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.5, pb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>

          {/* ── Right: Purchase card (sticky) ── */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: { md: 'sticky' }, top: 88 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1.5px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
                  mb: 2,
                }}
              >
                <TicketPrice price={detail.price} discountPercent={detail.discountPercent} size="large" />

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Loại vé</Typography>
                    <Typography variant="body2" fontWeight={600}>{detail.category}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Thời hạn</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {detail.durationDays === 1 ? 'Trong ngày' : `${detail.durationDays} ngày`}
                    </Typography>
                  </Stack>
                  {detail.availableCount !== undefined && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Còn lại</Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={detail.availableCount < 20 ? 'error.main' : 'success.main'}
                      >
                        {detail.availableCount} vé
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<AddShoppingCart />}
                  onClick={() =>
                    navigate('/booking', {
                      state: { ticketId: detail.id, ticketName: detail.name, price: detail.price },
                    })
                  }
                  sx={{
                    fontWeight: 800,
                    py: 1.5,
                    fontSize: '1rem',
                    borderRadius: 3,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                  }}
                >
                  Mua Ngay
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{ mt: 1.5, borderRadius: 3 }}
                  onClick={() => navigate(-1)}
                >
                  Xem vé khác
                </Button>
              </Paper>

              {/* Operating hours */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: alpha(theme.palette.info.main, 0.04),
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Giờ hoạt động
                </Typography>
                {[
                  { day: 'Thứ 2 - Thứ 6', hours: '08:00 - 21:00' },
                  { day: 'Thứ 7 - Chủ nhật', hours: '07:30 - 22:00' },
                  { day: 'Ngày lễ', hours: '07:00 - 23:00' },
                ].map((r) => (
                  <Stack key={r.day} direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{r.day}</Typography>
                    <Typography variant="caption" fontWeight={600}>{r.hours}</Typography>
                  </Stack>
                ))}
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Related tickets */}
        {relatedTickets.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={800} fontFamily="Outfit, sans-serif" sx={{ mb: 3 }}>
              Vé tương tự
            </Typography>
            <Grid container spacing={2.5}>
              {relatedTickets
                .filter((t) => t.id !== detail.id)
                .slice(0, 3)
                .map((t) => (
                  <Grid item xs={12} sm={6} md={4} key={t.id}>
                    <TicketCard
                      ticket={enrichTicket(t)}
                      venueId={venueIdNum}
                      viewMode="grid"
                      isInCompare={compareIds.includes(t.id)}
                      onToggleCompare={(id) => dispatch(toggleCompare(id))}
                      onBuyNow={(ticket) =>
                        navigate('/booking', {
                          state: { ticketId: ticket.id, ticketName: ticket.name, price: ticket.price },
                        })
                      }
                    />
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};
