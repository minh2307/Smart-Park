import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Chip,
  Skeleton,
  Stack,
  useTheme,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventIcon from '@mui/icons-material/Event';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAppSelector } from '../../../store/hooks';
import { useGetCustomerTicketsQuery } from '../api/myTicketApi';
import type { Ticket, TicketStatus } from '../types/my-ticket.types';

export const MyTicketsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Auth details
  const { user } = useAppSelector((state) => state.auth);
  const customerId = user?.id || 0;

  // Pagination & Filters State
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'USED' | 'EXPIRED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc'>('date_desc');

  // Query customer tickets
  const { data, isLoading, error } = useGetCustomerTicketsQuery(
    { customerId, page, size: pageSize },
    { skip: !customerId }
  );

  const tickets = data?.content || [];

  // Filter & Sort tickets locally for instant responsiveness
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Status filter
    if (activeTab === 'ACTIVE') {
      result = result.filter((t) => t.status === 'PAID');
    } else if (activeTab === 'USED') {
      result = result.filter((t) => t.status === 'CHECKED_IN' || t.status === 'USED');
    } else if (activeTab === 'EXPIRED') {
      result = result.filter(
        (t) =>
          t.status === 'EXPIRED' ||
          t.status === 'CANCELLED' ||
          t.status === 'REFUNDED'
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.ticketCode.toLowerCase().includes(q) ||
          t.ticketType.name.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'date_desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [tickets, activeTab, searchQuery, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tickets.length;
    const active = tickets.filter((t) => t.status === 'PAID').length;
    const used = tickets.filter((t) => t.status === 'CHECKED_IN' || t.status === 'USED').length;
    const other = total - active - used;
    return { total, active, used, other };
  }, [tickets]);

  // Helper for status styling
  const getStatusChipProps = (status: TicketStatus) => {
    switch (status) {
      case 'PAID':
        return {
          label: 'Chưa sử dụng',
          color: 'success' as const,
          sx: {
            bgcolor: 'rgba(46, 125, 50, 0.1)',
            color: '#2e7d32',
            fontWeight: 'bold',
            border: '1px solid rgba(46, 125, 50, 0.3)',
          },
        };
      case 'CHECKED_IN':
        return {
          label: 'Đã check-in',
          color: 'info' as const,
          sx: {
            bgcolor: 'rgba(2, 136, 209, 0.1)',
            color: '#0288d1',
            fontWeight: 'bold',
            border: '1px solid rgba(2, 136, 209, 0.3)',
          },
        };
      case 'USED':
        return {
          label: 'Đã sử dụng',
          color: 'default' as const,
          sx: {
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: 'bold',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        };
      case 'EXPIRED':
        return {
          label: 'Hết hạn',
          color: 'warning' as const,
          sx: {
            bgcolor: 'rgba(237, 108, 2, 0.1)',
            color: '#ed6c02',
            fontWeight: 'bold',
            border: '1px solid rgba(237, 108, 2, 0.3)',
          },
        };
      case 'CANCELLED':
      case 'REFUNDED':
        return {
          label: status === 'REFUNDED' ? 'Đã hoàn tiền' : 'Đã hủy',
          color: 'error' as const,
          sx: {
            bgcolor: 'rgba(211, 47, 47, 0.1)',
            color: '#d32f2f',
            fontWeight: 'bold',
            border: '1px solid rgba(211, 47, 47, 0.3)',
          },
        };
      default:
        return {
          label: status,
          color: 'default' as const,
          sx: {},
        };
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
        {/* Header Title */}
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
            Ví Vé Điện Tử
          </Typography>
          <Typography color="rgba(255, 255, 255, 0.6)" variant="body1">
            Quản lý các vé tham quan, trải nghiệm và QR check-in cổng tự động của bạn tại Smart Park.
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[
            { label: 'Tổng số vé', count: stats.total, color: '#ffffff' },
            { label: 'Vé chưa sử dụng', count: stats.active, color: '#2dd4bf' },
            { label: 'Đã check-in/sử dụng', count: stats.used, color: '#0ea5e9' },
            { label: 'Đã hết hạn/hủy', count: stats.other, color: '#94a3b8' },
          ].map((item, idx) => (
            <Grid item xs={6} md={3} key={idx}>
              <Card
                sx={{
                  bgcolor: 'rgba(30, 41, 59, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" sx={{ mb: 0.5 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700,
                      color: item.color,
                    }}
                  >
                    {isLoading ? <Skeleton width={40} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} /> : item.count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters and Tab Navigation */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 3,
            mb: 4,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            pb: 2,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
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
            <Tab value="ALL" label="Tất cả" />
            <Tab value="ACTIVE" label="Chưa sử dụng" />
            <Tab value="USED" label="Đã sử dụng" />
            <Tab value="EXPIRED" label="Hết hạn / Hủy" />
          </Tabs>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { md: 450 } }}>
            <TextField
              size="small"
              placeholder="Tìm kiếm theo mã, tên vé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  bgcolor: 'rgba(30, 41, 59, 0.4)',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
                },
              }}
            />

            <TextField
              select
              size="small"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              sx={{
                width: { sm: 160 },
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  bgcolor: 'rgba(30, 41, 59, 0.4)',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
                },
              }}
            >
              <MenuItem value="date_desc">Mới nhất</MenuItem>
              <MenuItem value="date_asc">Cũ nhất</MenuItem>
            </TextField>
          </Stack>
        </Box>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#f44336' }}>
            Không thể tải danh sách vé. Vui lòng thử lại sau.
          </Alert>
        )}

        {/* Ticket Grid List */}
        {isLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', height: 260 }}>
                  <CardContent>
                    <Skeleton variant="rectangular" height={24} width="40%" sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 2 }} />
                    <Skeleton variant="rectangular" height={36} width="80%" sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 2 }} />
                    <Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 1 }} />
                    <Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : filteredTickets.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 12,
              textAlign: 'center',
            }}
          >
            <ConfirmationNumberIcon sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Không tìm thấy vé nào
            </Typography>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" sx={{ mb: 4, maxWidth: 400 }}>
              {searchQuery
                ? 'Không tìm thấy vé trùng khớp với từ khóa tìm kiếm. Vui lòng kiểm tra lại.'
                : 'Bạn chưa có vé nào trong ví của mình. Hãy mua vé để bắt đầu hành trình.'}
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/booking')}
                sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}
              >
                Đặt vé ngay
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence mode="popLayout">
              {filteredTickets.map((ticket) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={ticket.id}
                  component={motion.div}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: 'rgba(30, 41, 59, 0.4)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        borderColor: ticket.status === 'PAID' ? 'rgba(45, 212, 191, 0.5)' : 'rgba(255, 255, 255, 0.15)',
                        boxShadow: ticket.status === 'PAID'
                          ? '0 12px 30px rgba(45, 212, 191, 0.15)'
                          : '0 12px 30px rgba(0, 0, 0, 0.25)',
                      },
                    }}
                  >
                    {/* Glowing highlight for active ticket */}
                    {ticket.status === 'PAID' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background: 'linear-gradient(90deg, #2dd4bf, #0ea5e9)',
                        }}
                      />
                    )}

                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      {/* Top Bar with Status and Code */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                        <Chip size="small" {...getStatusChipProps(ticket.status)} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            color: 'rgba(255, 255, 255, 0.4)',
                            letterSpacing: '0.05em',
                            fontWeight: 'bold',
                          }}
                        >
                          {ticket.ticketCode}
                        </Typography>
                      </Stack>

                      {/* Ticket Type Name */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          mb: 1.5,
                          height: 56,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {ticket.ticketType.name}
                      </Typography>

                      {/* Visit Date */}
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, color: 'rgba(255, 255, 255, 0.6)' }}>
                        <EventIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Hạn sử dụng: {ticket.validDate}
                        </Typography>
                      </Stack>

                      {/* Venue Details */}
                      <Typography variant="body2" color="rgba(255, 255, 255, 0.4)" sx={{ mb: 1 }}>
                        Công viên số {ticket.ticketType.venueId}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
                        {ticket.status === 'PAID' ? (
                          <Button
                            variant="contained"
                            color="secondary"
                            fullWidth
                            startIcon={<QrCodeIcon />}
                            onClick={() => navigate(`/wallet/ticket/${ticket.ticketCode}`)}
                            sx={{
                              fontWeight: 'bold',
                              color: '#0f172a',
                              bgcolor: '#2dd4bf',
                              '&:hover': {
                                bgcolor: '#0d9488',
                              },
                            }}
                          >
                            Dùng Vé (QR)
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            fullWidth
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate(`/wallet/ticket/${ticket.ticketCode}`)}
                            sx={{
                              fontWeight: 'bold',
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                              },
                            }}
                          >
                            Xem Chi Tiết
                          </Button>
                        )}
                      </Stack>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Container>
    </Box>
  );
};
