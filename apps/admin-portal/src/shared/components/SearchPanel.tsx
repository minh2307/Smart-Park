import React from 'react';
import { Box, TextField, InputAdornment, Button } from '@mui/material';
import { MdSearch, MdClear } from 'react-icons/md';

interface SearchPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  children?: React.ReactNode;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  search,
  onSearchChange,
  placeholder = 'Tìm kiếm...',
  onClear,
  children,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
        mb: 3,
        p: 2.5,
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <TextField
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        size="small"
        sx={{ minWidth: 260, flexGrow: { xs: 1, sm: 0 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MdSearch size={20} />
            </InputAdornment>
          ),
          endAdornment: search && onClear && (
            <InputAdornment position="end">
              <Button size="small" onClick={onClear} sx={{ minWidth: 'auto', p: 0.5 }}>
                <MdClear size={16} />
              </Button>
            </InputAdornment>
          ),
        }}
      />
      {children}
    </Box>
  );
};
