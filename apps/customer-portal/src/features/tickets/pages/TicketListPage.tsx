import React, { useEffect, useCallback } from 'react';
import {
  Container, Box, Grid, Typography, Stack, ToggleButtonGroup,
  ToggleButton, Pagination, Alert, Chip, alpha, useTheme,
  useMediaQuery, Drawer, Fab, Badge,
} from '@mui/material';
import { ViewModule, ViewList, FilterList } from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchVenues, fetchTicketTypes, setSelectedVenue, setViewMode, setPage, resetFilters, toggleCompare,
} from '../store/ticketSlice';
import {
  selectVenues, selectSelectedVenueId,
  selectPaginatedTickets, selectFilteredTickets, selectTotalPages,
  selectCurrentPage, selectViewMode, selectLoading, selectError,
  selectCompareIds, selectFilters,
} from '../store/ticketSelectors';
import { enrichTicket } from '../utils/enrichTicket';
import { TicketCard, TicketCardSkeleton } from '../components/TicketCard';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { EmptyState } from '../components/EmptyState';
import { TicketComparison } from '../components/TicketComparison';
import type { TicketType } from '../types/ticket.types';

const SKELETON_COUNT = 8;

export const TicketListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);

  const venues = useAppSelector(selectVenues);
  const selectedVenueId = useAppSelector(selectSelectedVenueId);
  const rawTickets = useAppSelector(selectPaginatedTickets);
  const filteredCount = useAppSelector(selectFilteredTickets).length;
  const totalPages = useAppSelector(selectTotalPages);
  const currentPage = useAppSelector(selectCurrentPage);
  const viewMode = useAppSelector(selectViewMode);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const compareIds = useAppSelector(selectCompareIds);
  const filters = useAppSelector(selectFilters);

  const tickets = rawTickets.map(enrichTicket);

  // Load venues on mount
  useEffect(() => {
    dispatch(fetchVenues());
  }, [dispatch]);

  // Load tickets when venue changes
  useEffect(() => {
    if (selectedVenueId) {
      dispatch(fetchTicketTypes(selectedVenueId));
    }
  }, [dispatch, selectedVenueId]);

  const handleBuyNow = useCallback(
    (ticket: TicketType) => {
      navigate('/booking', { state: { ticketId: ticket.id, ticketName: ticket.name, price: ticket.price } });
    },
    [navigate],
  );

  const handleToggleCompare = useCallback(
    (id: number) => dispatch(toggleCompare(id)),
    [dispatch],
  );

  const isFiltered =
    filters.search !== '' ||
    filters.category !== 'ALL' ||
    filters.priceMin !== 0 ||
    filters.priceMax !== 5000000;

  return (
    <>
      {/* Page header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          py: { xs: 5, md: 7 },
          px: 2,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative blob */}
        <Box
          sx={{
            position: 'absolute', top: -60, right: -60, width: 260, height: 260,
            borderRadius: '50%',
            background: alpha('#fff', 0.06),
            pointerEvents: 'none',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h3"
            fontWeight={800}
            fontFamily="Outfit, sans-serif"
            sx={{ mb: 1, fontSize: { xs: '1.75rem', md: '2.5rem' } }}
          >
            Danh Mục Vé Tham Quan
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 3, maxWidth: 560, mx: 'auto', lineHeight: 1.6 }}>
            Chọn loại vé phù hợp với gia đình bạn. Đặt trực tuyến, nhận vé QR tức thì.
          </Typography>
        </motion.div>

        {/* Venue selector */}
        {venues.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              {venues.map((v) => (
                <Chip
                  key={v.id}
                  label={v.name}
                  clickable
                  onClick={() => dispatch(setSelectedVenue(v.id))}
                  variant={selectedVenueId === v.id ? 'filled' : 'outlined'}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    backgroundColor: selectedVenueId === v.id ? 'rgba(255,255,255,0.25)' : 'transparent',
                    fontWeight: selectedVenueId === v.id ? 700 : 400,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                  }}
                />
              ))}
            </Stack>
          </motion.div>
        )}
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error} - Vui lòng thử lại.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* ── Sidebar filter (desktop) ── */}
          {!isMobile && (
            <Grid item md={3} lg={2.5}>
              <FilterPanel />
            </Grid>
          )}

          {/* ── Main content ── */}
          <Grid item xs={12} md={9} lg={9.5}>
            {/* Toolbar */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ mb: 3 }}
            >
              <Box sx={{ flex: 1 }}>
                <SearchBar />
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                {/* Result count */}
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {loading.tickets ? '...' : `${filteredCount} vé`}
                </Typography>

                {/* View toggle */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  size="small"
                  onChange={(_e, v) => v && dispatch(setViewMode(v))}
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <ViewModule fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewList fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>

            {/* Ticket grid / list */}
            {loading.tickets ? (
              <Grid container spacing={2.5}>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} lg={viewMode === 'grid' ? 4 : 12} key={i}>
                    <TicketCardSkeleton viewMode={viewMode} />
                  </Grid>
                ))}
              </Grid>
            ) : tickets.length === 0 ? (
              <EmptyState
                title={isFiltered ? 'Không có vé phù hợp' : 'Chưa có vé nào'}
                description={
                  isFiltered
                    ? 'Thử bỏ bớt bộ lọc để xem thêm kết quả.'
                    : 'Địa điểm này chưa có vé. Chọn địa điểm khác.'
                }
                onReset={isFiltered ? () => dispatch(resetFilters()) : undefined}
              />
            ) : (
              <AnimatePresence mode="wait">
                <Grid container spacing={2.5}>
                  {tickets.map((ticket, i) => (
                    <Grid
                      item
                      xs={12}
                      sm={viewMode === 'grid' ? 6 : 12}
                      lg={viewMode === 'grid' ? 4 : 12}
                      key={ticket.id}
                      component={motion.div}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <TicketCard
                        ticket={ticket}
                        venueId={selectedVenueId!}
                        viewMode={viewMode}
                        isInCompare={compareIds.includes(ticket.id)}
                        onToggleCompare={handleToggleCompare}
                        onBuyNow={handleBuyNow}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={currentPage + 1}
                  onChange={(_e, p) => dispatch(setPage(p - 1))}
                  color="primary"
                  shape="rounded"
                  size="large"
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile filter FAB */}
      {isMobile && (
        <>
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: compareIds.length > 0 ? 100 : 24, right: 24, zIndex: 1100 }}
            onClick={() => setFilterDrawerOpen(true)}
          >
            <Badge badgeContent={isFiltered ? '!' : 0} color="error">
              <FilterList />
            </Badge>
          </Fab>
          <Drawer
            anchor="bottom"
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            PaperProps={{ sx: { borderRadius: '16px 16px 0 0', maxHeight: '80vh', overflow: 'auto' } }}
          >
            <Box sx={{ p: 2 }}>
              <FilterPanel />
            </Box>
          </Drawer>
        </>
      )}

      {/* Comparison tray */}
      <TicketComparison />
    </>
  );
};
