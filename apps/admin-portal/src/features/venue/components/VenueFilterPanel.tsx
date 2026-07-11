import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Select } from '../../../components/common/Form';
import { Button } from '../../../components/common/Button';
import { MdRefresh } from 'react-icons/md';

interface VenueFilterPanelProps {
  status: string;
  city: string;
  country: string;
  onStatusChange: (status: string) => void;
  onCityChange: (city: string) => void;
  onCountryChange: (country: string) => void;
  onReset: () => void;
  onRefresh: () => void;
}

export const VenueFilterPanel: React.FC<VenueFilterPanelProps> = ({
  status,
  city,
  country,
  onStatusChange,
  onCityChange,
  onCountryChange,
  onReset,
  onRefresh,
}) => {
  return (
    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
      <Box width={160}>
        <Select
          label="Trạng thái"
          value={status}
          onChange={(e: any) => onStatusChange(e.target.value)}
          options={[
            { value: '', label: 'Tất cả trạng thái' },
            { value: 'ACTIVE', label: 'Hoạt động' },
            { value: 'INACTIVE', label: 'Ngưng hoạt động' },
            { value: 'UNDER_MAINTENANCE', label: 'Đang bảo trì' },
            { value: 'CLOSED', label: 'Đã đóng cửa' },
          ]}
        />
      </Box>
      <Box width={160}>
        <Select
          label="Thành phố"
          value={city}
          onChange={(e: any) => onCityChange(e.target.value)}
          options={[
            { value: '', label: 'Tất cả thành phố' },
            { value: 'Ho Chi Minh', label: 'Hồ Chí Minh' },
            { value: 'Hanoi', label: 'Hà Nội' },
            { value: 'Da Nang', label: 'Đà Nẵng' },
          ]}
        />
      </Box>
      <Box width={160}>
        <Select
          label="Quốc gia"
          value={country}
          onChange={(e: any) => onCountryChange(e.target.value)}
          options={[
            { value: '', label: 'Tất cả quốc gia' },
            { value: 'Vietnam', label: 'Việt Nam' },
            { value: 'Singapore', label: 'Singapore' },
          ]}
        />
      </Box>
      <Button variant="outlined" onClick={onReset}>
        Đặt lại
      </Button>
      <IconButton onClick={onRefresh} color="primary" title="Làm mới danh sách">
        <MdRefresh size={22} />
      </IconButton>
    </Box>
  );
};
