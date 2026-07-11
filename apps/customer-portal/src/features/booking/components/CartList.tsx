import React from 'react';
import { Stack } from '@mui/material';
import { CartItem } from './CartItem';
import type { CartItem as CartItemType } from '../types/booking.types';

interface CartListProps {
  items: CartItemType[];
  onQuantityChange: (id: number, visitDate: string, qty: number) => void;
  onRemove: (id: number, visitDate: string) => void;
}

export const CartList: React.FC<CartListProps> = ({ items, onQuantityChange, onRemove }) => {
  return (
    <Stack spacing={2}>
      {items.map((item) => (
        <CartItem
          key={`${item.ticketType.id}-${item.visitDate}`}
          item={item}
          onQuantityChange={(qty) => onQuantityChange(item.ticketType.id, item.visitDate, qty)}
          onRemove={() => onRemove(item.ticketType.id, item.visitDate)}
        />
      ))}
    </Stack>
  );
};
