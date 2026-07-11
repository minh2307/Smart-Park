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
          label="Status"
          value={status}
          onChange={(e: any) => onStatusChange(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'ACTIVE', label: 'ACTIVE' },
            { value: 'INACTIVE', label: 'INACTIVE' },
            { value: 'UNDER_MAINTENANCE', label: 'UNDER_MAINTENANCE' },
            { value: 'CLOSED', label: 'CLOSED' },
          ]}
        />
      </Box>
      <Box width={160}>
        <Select
          label="City"
          value={city}
          onChange={(e: any) => onCityChange(e.target.value)}
          options={[
            { value: '', label: 'All Cities' },
            { value: 'Ho Chi Minh', label: 'Ho Chi Minh' },
            { value: 'Hanoi', label: 'Hanoi' },
            { value: 'Da Nang', label: 'Da Nang' },
          ]}
        />
      </Box>
      <Box width={160}>
        <Select
          label="Country"
          value={country}
          onChange={(e: any) => onCountryChange(e.target.value)}
          options={[
            { value: '', label: 'All Countries' },
            { value: 'Vietnam', label: 'Vietnam' },
            { value: 'Singapore', label: 'Singapore' },
          ]}
        />
      </Box>
      <Button variant="outlined" onClick={onReset}>
        Reset
      </Button>
      <IconButton onClick={onRefresh} color="primary" title="Refresh List">
        <MdRefresh size={22} />
      </IconButton>
    </Box>
  );
};
