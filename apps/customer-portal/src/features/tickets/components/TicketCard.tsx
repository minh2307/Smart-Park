import React from 'react';
import {
  Box, Card, CardActionArea, CardContent, CardMedia,
  Typography, Button, Stack, Tooltip, Skeleton,
  alpha, useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircleOutline, AddShoppingCart, CompareArrows,
  AccessTime, PeopleAlt,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TicketBadge } from './TicketBadge';
import { TicketPrice } from './TicketPrice';
import type { TicketType } from '../types/ticket.types';

interface TicketCardProps {
  ticket: TicketType;
  venueId: number;
  viewMode: 'grid' | 'list';
  isInCompare: boolean;
  onToggleCompare: (id: number) => void;
  onBuyNow: (ticket: TicketType) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket, venueId, viewMode, isInCompare, onToggleCompare, onBuyNow,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleViewDetail = () => {
    navigate(`/tickets/${venueId}/${ticket.id}`);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -2 }}
      >
        <Card
          sx={{
            display: 'flex',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: isInCompare ? 'primary.main' : alpha(theme.palette.divider, 0.6),
            boxShadow: isInCompare
              ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`
              : '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
          }}
        >
          <CardMedia
            component="img"
            sx={{ width: 180, flexShrink: 0, objectFit: 'cover', cursor: 'pointer' }}
            image={ticket.imageUrl}
            alt={ticket.name}
            onClick={handleViewDetail}
          />
          <CardContent sx={{ flex: 1, p: 3, display: 'flex', gap: 3, alignItems: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TicketBadge
                category={ticket.category}
                isPromotion={ticket.isPromotion}
                discountPercent={ticket.discountPercent}
                isPopular={ticket.isPopular}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mt: 1, mb: 0.5, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}
                onClick={handleViewDetail}
              >
                {ticket.name}
              </Typography>
              {ticket.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
                  {ticket.description}
                </Typography>
              )}
              <Stack direction="row" spacing={2}>
                {ticket.durationDays && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AccessTime sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                      {ticket.durationDays === 1 ? 'Trong ngày' : `${ticket.durationDays} ngày`}
                    </Typography>
                  </Stack>
                )}
                {ticket.availableCount !== undefined && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PeopleAlt sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                      Còn {ticket.availableCount} vé
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
              <TicketPrice price={ticket.price} discountPercent={ticket.discountPercent} size="medium" />
              <Stack direction="row" spacing={1}>
                <Tooltip title={isInCompare ? 'Bỏ so sánh' : 'So sánh'}>
                  <Button
                    size="small"
                    variant={isInCompare ? 'contained' : 'outlined'}
                    color="secondary"
                    onClick={() => onToggleCompare(ticket.id)}
                    sx={{ minWidth: 36, px: 1 }}
                  >
                    <CompareArrows fontSize="small" />
                  </Button>
                </Tooltip>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleViewDetail}
                  sx={{ fontWeight: 600 }}
                >
                  Chi tiết
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddShoppingCart fontSize="small" />}
                  onClick={() => onBuyNow(ticket)}
                  sx={{ fontWeight: 700 }}
                >
                  Mua ngay
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: isInCompare ? 'primary.main' : alpha(theme.palette.divider, 0.5),
          boxShadow: isInCompare
            ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
            : '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
          },
          position: 'relative',
        }}
      >
        {/* Image */}
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardActionArea onClick={handleViewDetail}>
            <CardMedia
              component="img"
              height="200"
              image={ticket.imageUrl}
              alt={ticket.name}
              sx={{
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            />
          </CardActionArea>
          {/* Badges overlay */}
          <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
            <TicketBadge
              category={ticket.category}
              isPromotion={ticket.isPromotion}
              discountPercent={ticket.discountPercent}
              isPopular={ticket.isPopular}
            />
          </Box>
          {/* Compare toggle */}
          <Tooltip title={isInCompare ? 'Bỏ so sánh' : 'Thêm so sánh'}>
            <Box
              onClick={() => onToggleCompare(ticket.id)}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: isInCompare ? 'primary.main' : 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            >
              <CompareArrows
                sx={{ fontSize: 16, color: isInCompare ? '#fff' : 'text.secondary' }}
              />
            </Box>
          </Tooltip>
        </Box>

        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontFamily: 'Outfit, sans-serif',
              mb: 0.75,
              lineHeight: 1.3,
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
              transition: 'color 0.2s',
            }}
            onClick={handleViewDetail}
          >
            {ticket.name}
          </Typography>

          {ticket.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1.5,
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {ticket.description}
            </Typography>
          )}

          {/* Key benefits (top 3) */}
          {ticket.benefits && ticket.benefits.length > 0 && (
            <Box sx={{ mb: 2, flex: 1 }}>
              {ticket.benefits.slice(0, 3).map((b, i) => (
                <Stack key={i} direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
                  <CheckCircleOutline sx={{ fontSize: 14, color: 'success.main', flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                    {b}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}

          {/* Footer */}
          <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.4) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
              <TicketPrice price={ticket.price} discountPercent={ticket.discountPercent} size="medium" />
              <Stack direction="column" spacing={0.75} alignItems="flex-end">
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  onClick={handleViewDetail}
                  sx={{ fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}
                >
                  Xem chi tiết
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  fullWidth
                  startIcon={<AddShoppingCart sx={{ fontSize: 14 }} />}
                  onClick={() => onBuyNow(ticket)}
                  sx={{ fontWeight: 700, fontSize: '0.7rem', py: 0.5 }}
                >
                  Mua ngay
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ─── Skeleton ───────────────────────────────────────────────────────────────

export const TicketCardSkeleton: React.FC<{ viewMode?: 'grid' | 'list' }> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <Card sx={{ display: 'flex', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="rectangular" width={180} height={140} />
        <CardContent sx={{ flex: 1, p: 3 }}>
          <Skeleton variant="rounded" width={80} height={22} sx={{ mb: 1.5 }} />
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="50%" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent sx={{ p: 2.5 }}>
        <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="85%" sx={{ mb: 1.5 }} />
        <Skeleton variant="text" width="55%" />
        <Skeleton variant="text" width="65%" />
        <Skeleton variant="text" width="50%" sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
          <Skeleton variant="text" width={90} height={36} />
          <Skeleton variant="rounded" width={80} height={30} />
        </Box>
      </CardContent>
    </Card>
  );
};
