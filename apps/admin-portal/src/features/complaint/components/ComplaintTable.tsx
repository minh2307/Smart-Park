import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  TablePagination,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { MdArrowUpward, MdCheck, MdDelete } from 'react-icons/md';
import { Complaint, ComplaintPriority, ComplaintSeverity, ComplaintStatus } from '../types';

interface ComplaintTableProps {
  complaints: Complaint[];
  totalElements: number;
  page: number;
  size: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
  onEscalate: (id: number, reason: string) => void;
  onResolve: (id: number, resolutionText: string) => void;
  onDelete: (id: number) => void;
}

export const getPriorityColor = (p: ComplaintPriority) => {
  switch (p) {
    case 'LOW':
      return 'default';
    case 'NORMAL':
      return 'primary';
    case 'HIGH':
      return 'warning';
    case 'CRITICAL':
      return 'error';
    default:
      return 'default';
  }
};

export const getSeverityColor = (s: ComplaintSeverity) => {
  switch (s) {
    case 'MINOR':
      return 'success';
    case 'MODERATE':
      return 'primary';
    case 'MAJOR':
      return 'warning';
    case 'SEVERE':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusLabelAndColor = (status: ComplaintStatus) => {
  switch (status) {
    case 'OPEN':
      return { label: 'Đang mở', color: 'error' as any };
    case 'INVESTIGATING':
      return { label: 'Đang xác minh', color: 'warning' as any };
    case 'RESOLVED':
      return { label: 'Đã xử lý', color: 'success' as any };
    case 'CLOSED':
      return { label: 'Đóng vụ việc', color: 'default' as any };
    default:
      return { label: status, color: 'default' as any };
  }
};

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  totalElements,
  page,
  size,
  onPageChange,
  onSizeChange,
  onEscalate,
  onResolve,
  onDelete,
}) => {
  const [escalateTarget, setEscalateTarget] = useState<Complaint | null>(null);
  const [escalationReason, setEscalationReason] = useState('');

  const [resolveTarget, setResolveTarget] = useState<Complaint | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const handleEscalateSubmit = () => {
    if (escalateTarget && escalationReason.trim()) {
      onEscalate(escalateTarget.id, escalationReason);
      setEscalateTarget(null);
      setEscalationReason('');
    }
  };

  const handleResolveSubmit = () => {
    if (resolveTarget && resolutionText.trim()) {
      onResolve(resolveTarget.id, resolutionText);
      setResolveTarget(null);
      setResolutionText('');
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Mã</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Khách Hàng</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Sự Việc Khiếu Nại</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mức Độ</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Độ Ưu Tiên</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Cấp Bậc</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {complaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Hiện tại chưa ghi nhận vụ khiếu nại nào cần giải quyết.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              complaints.map((item) => {
                const sc = getStatusLabelAndColor(item.status);
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>#{item.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        SĐT: {item.customerPhone}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: '280px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-all' }}>
                        {item.description}
                      </Typography>
                      {item.evidenceUrls && item.evidenceUrls.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          {item.evidenceUrls.map((url, i) => (
                            <Typography
                              key={i}
                              variant="caption"
                              component="a"
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              color="primary"
                              sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                            >
                              Bằng chứng #{i + 1}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={item.severity} size="small" color={getSeverityColor(item.severity)} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={item.priority} size="small" color={getPriorityColor(item.priority)} />
                    </TableCell>
                    <TableCell>
                      {item.isEscalated ? (
                        <Tooltip title={item.escalationReason || ''}>
                          <Chip
                            label="Leo thang (Escalated)"
                            size="small"
                            color="error"
                            icon={<MdArrowUpward />}
                          />
                        </Tooltip>
                      ) : (
                        <Chip label="Nội bộ cấp trung" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={sc.label} size="small" color={sc.color} />
                    </TableCell>
                    <TableCell align="right">
                      {!item.isEscalated && item.status !== 'RESOLVED' && (
                        <Tooltip title="Leo thang lên cấp trên">
                          <IconButton onClick={() => setEscalateTarget(item)} size="small" color="error">
                            <MdArrowUpward />
                          </IconButton>
                        </Tooltip>
                      )}
                      {item.status !== 'RESOLVED' && (
                        <Tooltip title="Xác nhận giải quyết">
                          <IconButton onClick={() => setResolveTarget(item)} size="small" color="success">
                            <MdCheck />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Xóa">
                        <IconButton onClick={() => onDelete(item.id)} size="small" color="error">
                          <MdDelete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={size}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
      />

      {/* Escalation Dialog */}
      <Dialog open={!!escalateTarget} onClose={() => setEscalateTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Yêu cầu leo thang khiếu nại #{escalateTarget?.id}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Vụ việc này sẽ được chuyển lên cấp Trưởng phòng điều hành và Ban Giám Đốc xử lý khẩn cấp.
          </Typography>
          <TextField
            label="Lý do yêu cầu leo thang"
            value={escalationReason}
            onChange={(e) => setEscalationReason(e.target.value)}
            multiline
            rows={3}
            fullWidth
            required
            placeholder="e.g. Khách hàng đe dọa kiện pháp lý, hoặc mức độ thiệt hại vượt quyền hạn giải quyết của nhân viên hỗ trợ."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEscalateTarget(null)}>Hủy Bỏ</Button>
          <Button onClick={handleEscalateSubmit} variant="contained" color="error" disabled={!escalationReason.trim()}>
            Yêu Cầu Leo Thang
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={!!resolveTarget} onClose={() => setResolveTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Giải quyết khiếu nại #{resolveTarget?.id}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ghi nhận kết quả xử lý và phản hồi tới khách hàng.
          </Typography>
          <TextField
            label="Phương án giải quyết & Đền bù"
            value={resolutionText}
            onChange={(e) => setResolutionText(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
            placeholder="e.g. Đã kiểm tra lại camera an ninh, đền bù cho khách hàng số tiền..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveTarget(null)}>Hủy Bỏ</Button>
          <Button onClick={handleResolveSubmit} variant="contained" color="success" disabled={!resolutionText.trim()}>
            Lưu Kết Quả Xử Lý
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
