import React from 'react';
import {
  Box, Typography, Button, Stack, Divider,
  Slider, FormControl, Select, MenuItem,
  Chip, alpha, useTheme,
} from '@mui/material';
import { RestartAlt } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setCategory, setPriceRange, setSortBy, resetFilters,
} from '../store/ticketSlice';
import { selectFilters } from '../store/ticketSelectors';
import { formatCurrency } from '@shared/utils';
import type { TicketCategory } from '../types/ticket.types';

const CATEGORIES: Array<{ value: TicketCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'STANDARD', label: 'Tiêu Chuẩn' },
  { value: 'COMBO', label: 'Combo' },
  { value: 'VIP', label: 'VIP' },
  { value: 'FAMILY', label: 'Gia Đình' },
  { value: 'SEASONAL', label: 'Theo Mùa' },
];

const PRICE_MIN = 0;
const PRICE_MAX = 5000000;
const PRICE_STEP = 50000;

export const FilterPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const theme = useTheme();

  const isDefaultFilter =
    filters.category === 'ALL' &&
    filters.priceMin === PRICE_MIN &&
    filters.priceMax === PRICE_MAX;

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.6),
        backgroundColor: 'background.paper',
        position: 'sticky',
        top: 88,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700} fontFamily="Outfit, sans-serif">
          Bộ lọc
        </Typography>
        {!isDefaultFilter && (
          <Button
            size="small"
            startIcon={<RestartAlt fontSize="small" />}
            onClick={() => dispatch(resetFilters())}
            sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
          >
            Đặt lại
          </Button>
        )}
      </Stack>

      {/* Category */}
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
        Loại vé
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3 }}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.value}
            label={cat.label}
            size="small"
            clickable
            onClick={() => dispatch(setCategory(cat.value))}
            variant={filters.category === cat.value ? 'filled' : 'outlined'}
            color={filters.category === cat.value ? 'primary' : 'default'}
            sx={{
              fontWeight: filters.category === cat.value ? 700 : 400,
              fontSize: '0.75rem',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Price range */}
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
        Khoảng giá
      </Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={[filters.priceMin, filters.priceMax]}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          onChange={(_e, v) => {
            const [min, max] = v as [number, number];
            dispatch(setPriceRange([min, max]));
          }}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => formatCurrency(v)}
          sx={{ color: 'primary.main' }}
        />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
            {formatCurrency(filters.priceMin)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
            {formatCurrency(filters.priceMax)}
          </Typography>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Sort */}
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
        Sắp xếp theo
      </Typography>
      <FormControl fullWidth size="small">
        <Select
          value={filters.sortBy}
          onChange={(e) => dispatch(setSortBy(e.target.value as typeof filters.sortBy))}
          sx={{ borderRadius: 2, fontSize: '0.85rem' }}
        >
          <MenuItem value="popular">Phổ biến nhất</MenuItem>
          <MenuItem value="price_asc">Giá tăng dần</MenuItem>
          <MenuItem value="price_desc">Giá giảm dần</MenuItem>
          <MenuItem value="name_asc">Tên A-Z</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
