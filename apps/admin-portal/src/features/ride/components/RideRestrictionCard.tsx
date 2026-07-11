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

export const RideRestrictionCard: React.FC<RideRestrictionCardProps> = ({ restrictions }) => {
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
  } = restrictions;

  const items = [
    {
      label: 'Height Limit',
      value: minHeight
        ? `${minHeight}cm ${maxHeight ? `- ${maxHeight}cm` : 'minimum'}`
        : 'No restriction',
      icon: <MdHeight size={24} />,
      active: !!minHeight,
    },
    {
      label: 'Age Range',
      value: minAge
        ? `${minAge} yrs ${maxAge ? `- ${maxAge} yrs` : 'minimum'}`
        : 'All ages welcome',
      icon: <MdChildCare size={24} />,
      active: !!minAge,
    },
    {
      label: 'Weight Limits',
      value: minWeight
        ? `${minWeight}kg ${maxWeight ? `- ${maxWeight}kg` : 'minimum'}`
        : 'No weight limits',
      icon: <MdScale size={24} />,
      active: !!minWeight,
    },
  ];

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1}>
          <MdHealthAndSafety color="primary" /> Safety & Admission Restrictions
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
              <MdWarningAmber size={18} /> Health Warning Active
            </Box>
          )}
          {pregnancyRestriction && (
            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'error.main', fontSize: '0.85rem', fontWeight: 600 }}>
              <MdWarningAmber size={18} /> Expectant Mothers Prohibited
            </Box>
          )}
          {accessibilityFriendly ? (
            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'success.main', fontSize: '0.85rem', fontWeight: 600 }}>
              <MdCheckCircle size={18} /> Wheelchair Accessible
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              <MdWarningAmber size={18} /> Special Access Transfer Needed
            </Box>
          )}
        </Box>

        {safetyNotes && (
          <Box p={1.5} sx={{ mt: 2, borderRadius: 2, bgcolor: 'error.light', borderLeft: '4px solid', borderColor: 'error.main' }}>
            <Typography variant="caption" display="block" color="error.contrastText" fontWeight="bold" mb={0.5}>
              CRITICAL SAFETY NOTES
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
