import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import { Restaurant } from '../types';
import { MdEdit, MdRestaurantMenu, MdAccessTime, MdQueue } from 'react-icons/md';
import { StatusChip } from '../../../shared/components/StatusChip';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onEdit: (restaurant: Restaurant) => void;
  onViewMenu: (restaurant: Restaurant) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onEdit,
  onViewMenu,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1.5}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight="bold" fontFamily="monospace">
              {restaurant.restaurantCode}
            </Typography>
            <Typography variant="h6" fontWeight="bold" mt={0.5}>
              {restaurant.restaurantName}
            </Typography>
          </Box>
          <StatusChip status={restaurant.status} />
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Vị trí: <strong>{restaurant.location}</strong>
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          <Chip
            icon={<MdAccessTime />}
            label={restaurant.businessHours}
            size="small"
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          />
          <Chip
            icon={<MdQueue />}
            label={`Đang đợi: ${restaurant.queueLength}`}
            size="small"
            color={restaurant.queueLength > 3 ? 'warning' : 'default'}
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          />
        </Box>

        <Box bgcolor="action.hover" p={1.5} borderRadius={2} mb={2}>
          <Typography variant="caption" color="text.secondary" display="block">
            Doanh Thu Ngày
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            {restaurant.revenue.toLocaleString()}đ
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Quản lý: {restaurant.manager}
        </Typography>
      </CardContent>

      <Box p={2} borderTop={1} borderColor="divider" display="flex" justifyContent="space-between" gap={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<MdEdit />}
          onClick={() => onEdit(restaurant)}
          sx={{ borderRadius: 2 }}
        >
          Chỉnh sửa
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<MdRestaurantMenu />}
          onClick={() => onViewMenu(restaurant)}
          sx={{ borderRadius: 2 }}
        >
          Xem thực đơn
        </Button>
      </Box>
    </Card>
  );
};
export default RestaurantCard;
