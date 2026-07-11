import React from 'react';
import {
  Box, Typography, Paper, Stack, Button,
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Tooltip, alpha, useTheme,
} from '@mui/material';
import { Close, CheckCircle, Cancel, OpenInNew } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { toggleCompare, clearCompare } from '../store/ticketSlice';
import {
  selectCompareTickets, selectCompareIds, selectSelectedVenueId,
} from '../store/ticketSelectors';
import { formatCurrency } from '@shared/utils';

export const TicketComparison: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const tickets = useAppSelector(selectCompareTickets);
  const compareIds = useAppSelector(selectCompareIds);
  const venueId = useAppSelector(selectSelectedVenueId);

  if (compareIds.length === 0) return null;

  const rows: Array<{ label: string; getValue: (t: (typeof tickets)[0]) => React.ReactNode }> = [
    { label: 'Giá vé', getValue: (t) => (
      <Typography fontWeight={800} color="primary.main" fontFamily="Outfit, sans-serif">
        {formatCurrency(t.price)}
      </Typography>
    )},
    { label: 'Loại vé', getValue: (t) => t.category ?? '-' },
    { label: 'Thời hạn', getValue: (t) => t.durationDays === 1 ? 'Trong ngày' : `${t.durationDays} ngày` },
    { label: 'Khuyến mãi', getValue: (t) =>
      t.discountPercent ? (
        <Typography color="error.main" fontWeight={700}>-{t.discountPercent}%</Typography>
      ) : (
        <Cancel sx={{ color: 'text.disabled', fontSize: 18 }} />
      ),
    },
    { label: 'VIP', getValue: (t) =>
      t.category === 'VIP'
        ? <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
        : <Cancel sx={{ color: 'text.disabled', fontSize: 18 }} />,
    },
    { label: 'Gia đình', getValue: (t) =>
      t.category === 'FAMILY'
        ? <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
        : <Cancel sx={{ color: 'text.disabled', fontSize: 18 }} />,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            borderTop: '1px solid',
            borderColor: 'primary.main',
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden',
            maxHeight: '50vh',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="subtitle1" color="white" fontWeight={700} fontFamily="Outfit, sans-serif">
              So sánh vé ({compareIds.length}/3)
            </Typography>
            <Button
              size="small"
              sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}
              onClick={() => dispatch(clearCompare())}
              startIcon={<Close fontSize="small" />}
            >
              Xóa tất cả
            </Button>
          </Box>

          {/* Table */}
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell sx={{ fontWeight: 700, width: 120, fontSize: '0.8rem' }}>Tiêu chí</TableCell>
                {tickets.map((t) => (
                  <TableCell key={t.id} align="center" sx={{ fontWeight: 700 }}>
                    <Stack alignItems="center" spacing={0.5}>
                      <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1.3, textAlign: 'center' }}>
                        {t.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => venueId && navigate(`/tickets/${venueId}/${t.id}`)}
                          >
                            <OpenInNew sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bỏ so sánh">
                          <IconButton size="small" onClick={() => dispatch(toggleCompare(t.id))}>
                            <Close sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.label}
                  sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}
                >
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }}>
                    {row.label}
                  </TableCell>
                  {tickets.map((t) => (
                    <TableCell key={t.id} align="center" sx={{ fontSize: '0.85rem' }}>
                      {row.getValue(t)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
};
