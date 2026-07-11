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
  Box,
} from '@mui/material';
import {
  MdEdit,
  MdDelete,
  MdVisibility,
  MdPlayArrow,
  MdPause,
  MdArchive,
  MdCheckCircle,
} from 'react-icons/md';
import { Promotion } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

interface PromotionTableProps {
  promotions: Promotion[];
  onView: (p: Promotion) => void;
  onEdit: (p: Promotion) => void;
  onDelete: (p: Promotion) => void;
  onStatusChange?: (p: Promotion, newStatus: Promotion['status']) => void;
}

export const PromotionTable: React.FC<PromotionTableProps> = ({
  promotions,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      <Table>
        <HeadCell />
        <TableBody>
          {promotions.map((p) => (
            <TableRow key={p.id} hover>
              <TableCell sx={{ fontFamily: 'monospace' }}>{p.code}</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
              <TableCell>{p.campaignName}</TableCell>
              <TableCell>{p.promotionType}</TableCell>
              <TableCell>
                {p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `$${p.discountValue}`}
              </TableCell>
              <TableCell>
                {p.usageCount} / {p.maxUsage || 'Vô hạn'}
              </TableCell>
              <TableCell sx={{ fontSize: '0.85rem' }}>
                {p.startDate} ~ {p.endDate}
              </TableCell>
              <TableCell>
                <StatusChip status={p.status} />
              </TableCell>
              <TableCell align="right">
                <Box display="flex" justifyContent="flex-end" gap={0.5}>
                  <Tooltip title="Xem chi tiet">
                    <IconButton onClick={() => onView(p)} color="info" size="small">
                      <MdVisibility />
                    </IconButton>
                  </Tooltip>
                  <PermissionWrapper requiredPermission="write:promotions">
                    <Tooltip title="Chinh sua">
                      <IconButton onClick={() => onEdit(p)} color="primary" size="small">
                        <MdEdit />
                      </IconButton>
                    </Tooltip>

                    {/* Status Workflow Controls */}
                    {p.status === 'DRAFT' && onStatusChange && (
                      <Tooltip title="Phe duyet">
                        <IconButton onClick={() => onStatusChange(p, 'SCHEDULED')} color="success" size="small">
                          <MdCheckCircle />
                        </IconButton>
                      </Tooltip>
                    )}
                    {p.status === 'SCHEDULED' && onStatusChange && (
                      <Tooltip title="Kich hoat">
                        <IconButton onClick={() => onStatusChange(p, 'ACTIVE')} color="success" size="small">
                          <MdPlayArrow />
                        </IconButton>
                      </Tooltip>
                    )}
                    {p.status === 'ACTIVE' && onStatusChange && (
                      <Tooltip title="Tam dung">
                        <IconButton onClick={() => onStatusChange(p, 'PAUSED')} color="warning" size="small">
                          <MdPause />
                        </IconButton>
                      </Tooltip>
                    )}
                    {p.status === 'PAUSED' && onStatusChange && (
                      <Tooltip title="Tiep tuc">
                        <IconButton onClick={() => onStatusChange(p, 'ACTIVE')} color="success" size="small">
                          <MdPlayArrow />
                        </IconButton>
                      </Tooltip>
                    )}
                    {['ACTIVE', 'PAUSED', 'EXPIRED'].includes(p.status) && onStatusChange && (
                      <Tooltip title="Luu tru">
                        <IconButton onClick={() => onStatusChange(p, 'ARCHIVED')} color="default" size="small">
                          <MdArchive />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Xoa">
                      <IconButton onClick={() => onDelete(p)} color="error" size="small">
                        <MdDelete />
                      </IconButton>
                    </Tooltip>
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

const HeadCell = () => (
  <TableHead sx={{ bgcolor: 'action.hover' }}>
    <TableRow>
      <TableCell sx={{ fontWeight: 'bold' }}>Ma</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>Ten khuyen mai</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>Chien dich</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>Loai</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>Giam gia</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>Da dung / Quota</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>Thoi han</TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>Trang thai</TableCell>
      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Hanh dong</TableCell>
    </TableRow>
  </TableHead>
);
export default PromotionTable;
