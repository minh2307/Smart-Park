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
  Typography,
} from '@mui/material';
import { MdEdit, MdDelete, MdVisibility, MdWarning } from 'react-icons/md';
import { Gate } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

interface GateTableProps {
  gates: Gate[];
  onView: (g: Gate) => void;
  onEdit: (g: Gate) => void;
  onDelete: (g: Gate) => void;
  onEmergencyOverride?: (g: Gate) => void;
}

export const GateTable: React.FC<GateTableProps> = ({
  gates,
  onView,
  onEdit,
  onDelete,
  onEmergencyOverride,
}) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Mã Cổng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tên Cổng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Loại Cổng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Địa Điểm Chỉ Định</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Thiết Bị (IP)</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Nhân Viên Trực</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái Cổng</TableCell>
            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Hành Động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {gates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">Không tìm thấy cổng nào</Typography>
              </TableCell>
            </TableRow>
          ) : (
            gates.map((g) => (
              <TableRow key={g.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{g.code}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{g.name}</TableCell>
                <TableCell>
                  <StatusChip status={g.type} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {g.assignedVenueName}
                  </Typography>
                  {g.assignedAttractionName && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      T.Chơi: {g.assignedAttractionName}
                    </Typography>
                  )}
                  {g.assignedZoneName && !g.assignedAttractionName && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Khu: {g.assignedZoneName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor:
                          g.deviceStatus === 'ONLINE'
                            ? 'success.main'
                            : g.deviceStatus === 'ERROR'
                              ? 'error.main'
                              : 'text.disabled',
                      }}
                    />
                    <Box>
                      <Typography variant="body2">{g.deviceStatus}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: 'monospace' }}>
                        {g.deviceInfo.ipAddress}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{g.currentOperator || <Typography variant="caption" color="text.secondary">Chưa phân công</Typography>}</TableCell>
                <TableCell>
                  <StatusChip status={g.status} />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={0.5}>
                    <Tooltip title="Xem chi tiết">
                      <IconButton onClick={() => onView(g)} color="info" size="small">
                        <MdVisibility />
                      </IconButton>
                    </Tooltip>
                    
                    <PermissionWrapper requiredPermission="write:venues">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton onClick={() => onEdit(g)} color="primary" size="small">
                          <MdEdit />
                        </IconButton>
                      </Tooltip>
                      
                      {onEmergencyOverride && g.status !== 'EMERGENCY' && (
                        <Tooltip title="Kích hoạt khẩn cấp">
                          <IconButton onClick={() => onEmergencyOverride(g)} color="warning" size="small">
                            <MdWarning />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Xóa">
                        <IconButton onClick={() => onDelete(g)} color="error" size="small">
                          <MdDelete />
                        </IconButton>
                      </Tooltip>
                    </PermissionWrapper>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default GateTable;
