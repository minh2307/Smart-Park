import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { RideRestrictions } from '../types';
import {
  MdHeight,
  MdChildCare,
  MdScale,
  MdHealthAndSafety,
  MdWarningAmber,
  MdCheckCircle,
} from 'react-icons/md';

interface RideRestrictionCardProps {
  restrictions: RideRestrictions;
}

export const RideRestrictionCard: React.FC<RideRestrictionCardProps> = ({ restrictions = {} }) => {
  const {
    minHeight,
    maxHeight,
    minAge,
    maxAge,
    minWeight,
    maxWeight,
    healthWarning,
    pregnancyRestriction,
    accessibilityFriendly,
    safetyNotes,
  } = restrictions || {};

  const items = [
    {
      label: 'Giới hạn chiều cao',
      value: minHeight
        ? `${minHeight}cm ${maxHeight ? `- ${maxHeight}cm` : 'tối thiểu'}`
        : 'Không giới hạn',
      icon: <MdHeight size={24} />,
      active: !!minHeight,
    },
    {
      label: 'Độ tuổi',
      value: minAge
        ? `${minAge} tuổi ${maxAge ? `- ${maxAge} tuổi` : 'tối thiểu'}`
        : 'Mọi độ tuổi',
      icon: <MdChildCare size={24} />,
      active: !!minAge,
    },
    {
      label: 'Giới hạn cân nặng',
      value: minWeight
        ? `${minWeight}kg ${maxWeight ? `- ${maxWeight}kg` : 'tối thiểu'}`
        : 'Không giới hạn cân nặng',
      icon: <MdScale size={24} />,
      active: !!minWeight,
    },
  ];

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1}>
          <MdHealthAndSafety color="primary" /> Quy định an toàn & Giới hạn tham gia
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {items.map((item, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Box
                p={1.5}
                sx={{
                  borderRadius: 2,
                  bgcolor: item.active ? 'action.hover' : 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box sx={{ color: item.active ? 'primary.main' : 'text.disabled' }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {healthWarning && (
            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'error.main', fontSize: '0.85rem', fontWeight: 600 }}>
              <MdWarningAmber size={18} /> Có cảnh báo sức khỏe
            </Box>
          )}
          {pregnancyRestriction && (
            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'error.main', fontSize: '0.85rem', fontWeight: 600 }}>
              <MdWarningAmber size={18} /> Không dành cho phụ nữ mang thai
            </Box>
          )}
          {accessibilityFriendly ? (
            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'success.main', fontSize: '0.85rem', fontWeight: 600 }}>
              <MdCheckCircle size={18} /> Hỗ trợ xe lăn
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              <MdWarningAmber size={18} /> Cần hỗ trợ di chuyển đặc biệt
            </Box>
          )}
        </Box>

        {safetyNotes && (
          <Box p={1.5} sx={{ mt: 2, borderRadius: 2, bgcolor: 'error.light', borderLeft: '4px solid', borderColor: 'error.main' }}>
            <Typography variant="caption" display="block" color="error.contrastText" fontWeight="bold" mb={0.5}>
              LƯU Ý AN TOÀN QUAN TRỌNG
            </Typography>
            <Typography variant="body2" color="error.contrastText">
              {safetyNotes}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
