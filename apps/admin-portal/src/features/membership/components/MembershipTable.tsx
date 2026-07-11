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
  Chip,
  Box,
  Skeleton,
} from '@mui/material';
import { MdVisibility, MdEdit, MdDelete, MdStars } from 'react-icons/md';
import { Membership } from '../types';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

interface MembershipTableProps {
  data: Membership[];
  loading: boolean;
  onViewDetails: (mem: Membership) => void;
  onEdit: (mem: Membership) => void;
  onDelete: (mem: Membership) => void;
}

export const MembershipTable: React.FC<MembershipTableProps> = ({
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
              <TableCell>Code / Customer</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Tier Status</TableCell>
              <TableCell>Loyalty Points</TableCell>
              <TableCell>Validity Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton width={120} /><Skeleton width={80} variant="text" /></TableCell>
                <TableCell><Skeleton width={130} /><Skeleton width={90} /></TableCell>
                <TableCell><Skeleton width={90} /></TableCell>
                <TableCell><Skeleton width={70} /></TableCell>
                <TableCell><Skeleton width={110} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
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
          No memberships found matching the search criteria.
        </Typography>
      </Paper>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'SUSPENDED':
        return 'warning';
      case 'EXPIRED':
        return 'error';
      case 'CANCELLED':
      default:
        return 'default';
    }
  };

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Code / Customer</TableCell>
            <TableCell>Contact Info</TableCell>
            <TableCell>Tier Level</TableCell>
            <TableCell>Loyalty Points</TableCell>
            <TableCell>Validity Period</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((mem) => (
            <TableRow key={mem.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {mem.customerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {mem.membershipCode}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">{mem.customerEmail}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mem.customerPhone}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  {mem.tierName}
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <MdStars color="#eab308" size={18} />
                  <Typography variant="body2" fontWeight="bold">
                    {mem.points.toLocaleString()}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">Join: {mem.joinDate}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Exp: {mem.expirationDate || 'Lifetime'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={mem.status}
                  size="small"
                  color={getStatusColor(mem.status)}
                  sx={{ fontWeight: 'bold', borderRadius: '6px' }}
                />
              </TableCell>
              <TableCell align="right">
                <Box display="flex" justifyContent="flex-end" gap={0.5}>
                  <IconButton size="small" onClick={() => onViewDetails(mem)} color="primary">
                    <MdVisibility size={18} />
                  </IconButton>
                  <PermissionWrapper requiredPermission="write:memberships">
                    <IconButton size="small" onClick={() => onEdit(mem)} color="info">
                      <MdEdit size={18} />
                    </IconButton>
                  </PermissionWrapper>
                  <PermissionWrapper requiredPermission="write:memberships">
                    <IconButton size="small" onClick={() => onDelete(mem)} color="error">
                      <MdDelete size={18} />
                    </IconButton>
                  </PermissionWrapper>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
