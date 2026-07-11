import React, { useState, useCallback } from 'react';
import {
  TextField, InputAdornment, IconButton,
  Paper, alpha, useTheme,
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setSearch } from '../store/ticketSlice';
import { selectFilters } from '../store/ticketSelectors';

export const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { search } = useAppSelector(selectFilters);
  const [localValue, setLocalValue] = useState(search);
  const theme = useTheme();

  // Debounce: commit to Redux after 300ms idle
  const handleChange = useCallback(
    (val: string) => {
      setLocalValue(val);
      const timer = setTimeout(() => dispatch(setSearch(val)), 300);
      return () => clearTimeout(timer);
    },
    [dispatch],
  );

  const handleClear = () => {
    setLocalValue('');
    dispatch(setSearch(''));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1.5px solid',
        borderColor: localValue ? 'primary.main' : alpha(theme.palette.divider, 0.8),
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: localValue
          ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`
          : 'none',
      }}
    >
      <TextField
        fullWidth
        variant="standard"
        placeholder="Tìm kiếm vé theo tên, loại vé..."
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start" sx={{ pl: 1.5 }}>
              <Search sx={{ color: localValue ? 'primary.main' : 'text.disabled', fontSize: 22 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end" sx={{ pr: 0.5 }}>
              <AnimatePresence>
                {localValue && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <IconButton size="small" onClick={handleClear}>
                      <Close fontSize="small" />
                    </IconButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </InputAdornment>
          ),
          sx: {
            px: 1,
            py: 1.25,
            fontSize: '0.9rem',
          },
        }}
      />
    </Paper>
  );
};
