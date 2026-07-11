import React from 'react';
import { Box, Typography, Stack, IconButton, useTheme, alpha } from '@mui/material';
import { DeleteOutline, CalendarMonth } from '@mui/icons-material';
import { QuantitySelector } from './QuantitySelector';
import { formatCurrency } from '@shared/utils';
import type { CartItem as CartItemType } from '../types/booking.types';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
  const theme = useTheme();
  const { ticketType, quantity, visitDate } = item;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        p: 2.5,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: theme.palette.background.paper,
        gap: 2.5,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          fontFamily="Outfit, sans-serif"
          sx={{ color: 'text.primary', mb: 0.5 }}
        >
          {ticketType.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarMonth fontSize="inherit" color="primary" />
          Ngày sử dụng: {visitDate}
        </Typography>
        <Typography variant="subtitle1" color="primary.main" fontWeight={700}>
          {formatCurrency(ticketType.price)}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={2.5}
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: { xs: '100%', sm: 'auto' } }}
      >
        <QuantitySelector value={quantity} onChange={onQuantityChange} min={1} />
        
        <Box sx={{ minWidth: 100, textAlign: 'right' }}>
          <Typography variant="subtitle1" fontWeight={800} fontFamily="Outfit, sans-serif">
            {formatCurrency(ticketType.price * quantity)}
          </Typography>
        </Box>

        <IconButton
          color="error"
          onClick={onRemove}
          sx={{
            backgroundColor: alpha(theme.palette.error.main, 0.05),
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1),
            },
          }}
        >
          <DeleteOutline />
        </IconButton>
      </Stack>
    </Box>
  );
};
