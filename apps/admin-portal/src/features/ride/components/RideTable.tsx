import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { MdVisibility, MdEdit, MdDelete, MdInfo } from 'react-icons/md';
import { Ride } from '../types';
import { StatusChip } from './StatusChip';
import { QueueIndicator } from './QueueIndicator';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

interface RideTableProps {
  data: Ride[];
  loading: boolean;
  onViewDetails: (ride: Ride) => void;
  onEdit: (ride: Ride) => void;
  onDelete: (ride: Ride) => void;
}

export const RideTable: React.FC<RideTableProps> = ({
  data,
  loading,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ride Code / Name</TableCell>
              <TableCell>Location / Zone</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Capacity / Hr</TableCell>
              <TableCell>Restrictions</TableCell>
              <TableCell>Queue Wait</TableCell>
              <TableCell>Operating Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton width={120} /><Skeleton width={80} variant="text" /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={85} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={110} /></TableCell>
                <TableCell><Skeleton width={65} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell align="right"><Skeleton width={80} style={{ marginLeft: 'auto' }} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (data.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No theme park rides found matching the filter criteria.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ride Code / Name</TableCell>
            <TableCell>Location / Zone</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Capacity / Hr</TableCell>
            <TableCell>Restrictions</TableCell>
            <TableCell>Queue Wait</TableCell>
            <TableCell>Operating Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((ride) => {
            const minH = ride.restrictions.minHeight;
            const maxH = ride.restrictions.maxHeight;
            let restrictLabel = 'No Limit';
            if (minH && maxH) {
              restrictLabel = `${minH}-${maxH}cm`;
            } else if (minH) {
              restrictLabel = `${minH}cm+`;
            } else if (maxH) {
              restrictLabel = `<${maxH}cm`;
            }
            const extraWarnings = ride.restrictions.healthWarning || ride.restrictions.pregnancyRestriction;

            return (
              <TableRow key={ride.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {ride.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {ride.code}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{ride.venueName || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ride.zoneName || '—'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {ride.categoryName || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {ride.capacity.toLocaleString()} Pax
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="body2">{restrictLabel}</Typography>
                    {extraWarnings && (
                      <Tooltip title="Medical/Pregnancy Warning Active">
                        <Box sx={{ color: 'error.main', display: 'flex' }}>
                          <MdInfo size={16} />
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <QueueIndicator minutes={ride.queueTimeMinutes} status={ride.status} />
                </TableCell>
                <TableCell>
                  <StatusChip status={ride.status} />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={0.5}>
                    <IconButton size="small" onClick={() => onViewDetails(ride)} color="primary">
                      <MdVisibility size={18} />
                    </IconButton>
                    <PermissionWrapper requiredPermission="write:rides">
                      <IconButton size="small" onClick={() => onEdit(ride)} color="info">
                        <MdEdit size={18} />
                      </IconButton>
                    </PermissionWrapper>
                    <PermissionWrapper requiredPermission="write:rides">
                      <IconButton size="small" onClick={() => onDelete(ride)} color="error">
                        <MdDelete size={18} />
                      </IconButton>
                    </PermissionWrapper>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
