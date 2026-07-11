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
  Box,
  Typography,
  Chip,
  TablePagination,
  Skeleton,
} from '@mui/material';
import { MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import { Visitor } from '../types';
import { mockCustomers } from '../../customer/services/customerApi';

interface VisitorTableProps {
  data: Visitor[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newSize: number) => void;
  onViewDetails: (visitor: Visitor) => void;
  onEdit: (visitor: Visitor) => void;
  onDelete: (visitor: Visitor) => void;
}

export const VisitorTable: React.FC<VisitorTableProps> = ({
  data,
  loading,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  const getOwnerName = (customerId: number) => {
    const cust = mockCustomers.find((c) => c.id === customerId);
    return cust ? cust.fullName : `CUST-${String(customerId).padStart(4, '0')}`;
  };

  const renderStatus = (status: string) => {
    const isInactive = status === 'INACTIVE';
    return (
      <Chip
        label={status}
        size="small"
        color={isInactive ? 'default' : 'success'}
        variant="outlined"
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Visitor Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Owner Customer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Relationship</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Age / Gender</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nationality</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ID Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Bookings / Tickets</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={120} /></TableCell>
                  <TableCell><Skeleton width={130} /></TableCell>
                  <TableCell><Skeleton width={85} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={90} /></TableCell>
                  <TableCell><Skeleton width={110} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell align="right"><Skeleton width={80} height={36} /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No visitor records found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.fullName}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{getOwnerName(row.customerId)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: CUST-{String(row.customerId).padStart(4, '0')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.relationship}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>{row.age} yrs / {row.gender}</TableCell>
                  <TableCell>{row.nationality}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{row.identificationNumber}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.bookingCount} bookings
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.ticketCount} tickets
                    </Typography>
                  </TableCell>
                  <TableCell>{renderStatus(row.status)}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={0.5}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onViewDetails(row)}
                      >
                        <MdVisibility size={20} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onEdit(row)}
                      >
                        <MdEdit size={20} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(row)}
                      >
                        <MdDelete size={20} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};
