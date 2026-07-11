import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider, Alert, Button } from '@mui/material';
import { ShoppingBag } from '@mui/icons-material';
import { formatCurrency } from '@shared/utils';
import type { TicketType } from '../../tickets/types/ticket.types';

interface BookingSummaryProps {
  selectedQuantities: Record<number, number>;
  ticketTypes: TicketType[];
  visitDate: string;
  onAddToCart: () => void;
  onQuickCheckout: () => void;
  isSubmitting?: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedQuantities,
  ticketTypes,
  visitDate,
  onAddToCart,
  onQuickCheckout,
  isSubmitting = false,
}) => {
  const hasTickets = Object.values(selectedQuantities).some((qty) => qty > 0);

  const selectedItems = ticketTypes
    .filter((ticket) => selectedQuantities[ticket.id] > 0)
    .map((ticket) => ({
      ticket,
      quantity: selectedQuantities[ticket.id],
    }));

  const total = selectedItems.reduce((sum, item) => sum + item.ticket.price * item.quantity, 0);

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} fontFamily="Outfit, sans-serif" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingBag sx={{ color: 'primary.main' }} />
          Thông tin đặt vé
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ngày sử dụng: <strong>{visitDate}</strong>
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {hasTickets ? (
          <Stack spacing={2}>
            {selectedItems.map(({ ticket, quantity }) => (
              <Stack key={ticket.id} direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {ticket.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(ticket.price)} x {quantity}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={700}>
                  {formatCurrency(ticket.price * quantity)}
                </Typography>
              </Stack>
            ))}

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>
                Tạm tính
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {formatCurrency(total)}
              </Typography>
            </Stack>

            <Stack spacing={1.5} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                size="large"
                onClick={onAddToCart}
                disabled={isSubmitting}
                sx={{ fontWeight: 700, borderRadius: 3 }}
              >
                Thêm vào Giỏ hàng
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={onQuickCheckout}
                disabled={isSubmitting}
                sx={{ fontWeight: 700, borderRadius: 3 }}
              >
                Thanh toán ngay
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Vui lòng chọn ngày tham quan và số lượng vé để tiếp tục.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
