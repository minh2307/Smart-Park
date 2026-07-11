import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'medium',
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const getStarSize = () => {
    if (size === 'small') return 20;
    if (size === 'large') return 36;
    return 28;
  };

  const handleClick = (val: number) => {
    if (!readOnly && onChange) {
      onChange(val);
    }
  };

  const getLabel = (val: number) => {
    switch (val) {
      case 1:
        return 'Rất tệ';
      case 2:
        return 'Tạm được';
      case 3:
        return 'Bình thường';
      case 4:
        return 'Rất tốt';
      case 5:
        return 'Tuyệt vời';
      default:
        return '';
    }
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Stack direction="row" spacing={0.5}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const starVal = idx + 1;
          const isFilled = starVal <= displayValue;
          
          return (
            <Box
              key={starVal}
              onClick={() => handleClick(starVal)}
              onMouseEnter={() => !readOnly && setHoverValue(starVal)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              sx={{
                cursor: readOnly ? 'default' : 'pointer',
                color: isFilled ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  transform: readOnly ? 'none' : 'scale(1.15)',
                  color: readOnly ? '#f59e0b' : '#f59e0b',
                },
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {isFilled ? (
                <StarIcon sx={{ fontSize: getStarSize() }} />
              ) : (
                <StarBorderIcon sx={{ fontSize: getStarSize() }} />
              )}
            </Box>
          );
        })}
      </Stack>

      {!readOnly && displayValue > 0 && (
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            color: '#f59e0b',
            bgcolor: 'rgba(245, 158, 11, 0.08)',
            py: 0.5,
            px: 1.5,
            borderRadius: 1.5,
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          {getLabel(displayValue)}
        </Typography>
      )}
    </Stack>
  );
};
