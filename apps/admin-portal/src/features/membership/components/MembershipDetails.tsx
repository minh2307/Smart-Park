import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Divider, Chip } from '@mui/material';
import { MembershipTier } from '../types';
import { MembershipBadge } from './MembershipBadge';
import { MembershipBenefitTable } from './MembershipBenefitTable';
import { MdTrendingUp, MdRule, MdConfirmationNumber, MdLocationOn, MdStars } from 'react-icons/md';

interface MembershipDetailsProps {
  tier: MembershipTier;
}

export const MembershipDetails: React.FC<MembershipDetailsProps> = ({ tier }) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={5}>
        <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <MembershipBadge tierCode={tier.code} tierName={tier.name} size="large" />
              <Chip label={tier.status} color={tier.status === 'ACTIVE' ? 'success' : 'default'} size="small" sx={{ fontWeight: 'bold' }} />
            </Box>

            <Typography variant="h3" fontWeight="900" color="primary.main" gutterBottom>
              {tier.discountPercentage}% <Typography component="span" variant="h5" color="text.secondary">Discount</Typography>
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
              <MdRule /> Progression & Retention Rules
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Upgrade Threshold</Typography>
                <Typography variant="body2" fontWeight="bold" display="flex" alignItems="center" gap={0.5}>
                  <MdStars color="#eab308" /> {tier.pointRules.upgradeThreshold} points
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Downgrade Threshold</Typography>
                <Typography variant="body2" fontWeight="bold" display="flex" alignItems="center" gap={0.5}>
                  <MdStars color="#718096" /> {tier.pointRules.downgradeThreshold} points
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Points Validity Duration</Typography>
                <Typography variant="body2" fontWeight="bold">{tier.pointRules.expirationMonths} Months</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Annual Renewal Bonus</Typography>
                <Typography variant="body2" fontWeight="bold">{tier.pointRules.renewalPoints} Points</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Earn Multiplier</Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main" display="flex" alignItems="center" gap={0.5}>
                  <MdTrendingUp /> {tier.pointsMultiplier}x Points
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
              <MdConfirmationNumber /> Applicable Tickets
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
              {tier.applicableTicketTypes.length > 0 ? (
                tier.applicableTicketTypes.map((t, idx) => (
                  <Chip key={idx} label={t} variant="outlined" size="small" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">All ticket types</Typography>
              )}
            </Box>

            <Typography variant="subtitle2" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
              <MdLocationOn /> Applicable Venues & Attractions
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {tier.applicableVenues.map((v, idx) => (
                <Chip key={idx} label={v} color="secondary" variant="outlined" size="small" />
              ))}
              {tier.applicableAttractions.map((a, idx) => (
                <Chip key={idx} label={a} color="info" variant="outlined" size="small" />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={7}>
        <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Configured Privileges & Benefits
            </Typography>
            <MembershipBenefitTable benefits={tier.benefits} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
