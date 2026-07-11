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
  Tooltip,
} from '@mui/material';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import { Campaign } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

interface CampaignTableProps {
  campaigns: Campaign[];
  onView: (c: Campaign) => void;
  onEdit: (c: Campaign) => void;
  onDelete: (c: Campaign) => void;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Ma chien dich</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Ten chien dich</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Ngay bat dau</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Ngay ket thuc</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Ngan sach (USD)</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Ti le dat muc tieu (%)</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Doanh thu (USD)</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trang thai</TableCell>
            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Hanh dong</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaigns.map((c) => (
            <TableRow key={c.id} hover>
              <TableCell sx={{ fontFamily: 'monospace' }}>{c.code}</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>{c.name}</TableCell>
              <TableCell>{c.startDate}</TableCell>
              <TableCell>{c.endDate}</TableCell>
              <TableCell>${c.budget.toLocaleString()}</TableCell>
              <TableCell>{c.targetConversion}%</TableCell>
              <TableCell>${c.totalRevenue.toLocaleString()}</TableCell>
              <TableCell>
                <StatusChip status={c.status} />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Xem chi tiet">
                  <IconButton onClick={() => onView(c)} color="info" size="small">
                    <MdVisibility />
                  </IconButton>
                </Tooltip>
                <PermissionWrapper requiredPermission="write:promotions">
                  <Tooltip title="Chinh sua">
                    <IconButton onClick={() => onEdit(c)} color="primary" size="small">
                      <MdEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xoa">
                    <IconButton onClick={() => onDelete(c)} color="error" size="small">
                      <MdDelete />
                    </IconButton>
                  </Tooltip>
                </PermissionWrapper>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default CampaignTable;
