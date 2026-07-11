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
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
} from '@mui/material';
import { MdTimeline, MdAssignment, MdCheck, MdDelete } from 'react-icons/md';
import { Incident, IncidentSeverity, IncidentStatus, IncidentType } from '../types';

interface IncidentTableProps {
  incidents: Incident[];
  totalElements: number;
  page: number;
  size: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
  onUpdateStatus: (id: number, status: IncidentStatus, notes: string) => void;
  onResolve: (id: number, rootCause: string, corrective: string, preventive: string) => void;
  onDelete: (id: number) => void;
}

export const getSeverityChipColor = (sev: IncidentSeverity) => {
  switch (sev) {
    case 'LOW':
      return 'default';
    case 'MEDIUM':
      return 'primary';
    case 'HIGH':
      return 'warning';
    case 'CRITICAL':
      return 'error';
    default:
      return 'default';
  }
};

export const getIncidentTypeLabel = (type: IncidentType) => {
  switch (type) {
    case 'RIDE_BREAKDOWN':
      return 'Hỏng hóc trò chơi';
    case 'POWER_FAILURE':
      return 'Mất điện nguồn';
    case 'MEDICAL_EMERGENCY':
      return 'Cấp cứu y tế';
    case 'LOST_CHILD':
      return 'Trẻ lạc';
    case 'LOST_PROPERTY':
      return 'Thất lạc đồ đạc';
    case 'SECURITY':
      return 'An ninh trật tự';
    case 'WEATHER':
      return 'Thời tiết xấu';
    case 'PARKING':
      return 'Lỗi bãi đỗ xe';
    case 'PAYMENT':
      return 'Lỗi thanh toán';
    case 'NETWORK':
      return 'Lỗi mạng nội bộ';
    case 'SYSTEM_ERROR':
      return 'Lỗi phần mềm';
    case 'OTHER':
      return 'Sự cố khác';
    default:
      return type;
  }
};

export const getIncidentStatusChipColor = (status: IncidentStatus) => {
  switch (status) {
    case 'REPORTED':
      return 'error';
    case 'INVESTIGATING':
      return 'warning';
    case 'IN_PROGRESS':
      return 'primary';
    case 'RESOLVED':
      return 'success';
    case 'CLOSED':
      return 'default';
    default:
      return 'default';
  }
};

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  totalElements,
  page,
  size,
  onPageChange,
  onSizeChange,
  onUpdateStatus,
  onResolve,
  onDelete,
}) => {
  const [selectedTimeline, setSelectedTimeline] = useState<Incident | null>(null);
  const [updateStatusTarget, setUpdateStatusTarget] = useState<Incident | null>(null);
  const [newStatus, setNewStatus] = useState<IncidentStatus>('INVESTIGATING');
  const [statusNotes, setStatusNotes] = useState('');

  const [resolveTarget, setResolveTarget] = useState<Incident | null>(null);
  const [rootCause, setRootCause] = useState('');
  const [corrective, setCorrective] = useState('');
  const [preventive, setPreventive] = useState('');

  const handleStatusSubmit = () => {
    if (updateStatusTarget && statusNotes.trim()) {
      onUpdateStatus(updateStatusTarget.id, newStatus, statusNotes);
      setUpdateStatusTarget(null);
      setStatusNotes('');
    }
  };

  const handleResolveSubmit = () => {
    if (resolveTarget && rootCause.trim() && corrective.trim() && preventive.trim()) {
      onResolve(resolveTarget.id, rootCause, corrective, preventive);
      setResolveTarget(null);
      setRootCause('');
      setCorrective('');
      setPreventive('');
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Mã sự cố</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tên vụ việc / Địa điểm</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phân Loại</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mức Độ</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Người Báo / Liên Hệ</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nhân Viên Xử Lý</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Thời Điểm</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa ghi nhận sự cố an toàn/kỹ thuật nào trong phiên này.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>#{item.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Vị trí: {item.location} {item.venueName ? `| ${item.venueName}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>{getIncidentTypeLabel(item.type)}</TableCell>
                  <TableCell>
                    <Chip label={item.severity} size="small" color={getSeverityChipColor(item.severity)} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.reporterName}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      SĐT: {item.reporterContact}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.assigneeName || 'Chưa phân phối'}</TableCell>
                  <TableCell>
                    <Chip label={item.status} size="small" color={getIncidentStatusChipColor(item.status)} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Xem dòng thời gian sự cố (Timeline)">
                      <IconButton onClick={() => setSelectedTimeline(item)} size="small" color="primary">
                        <MdTimeline />
                      </IconButton>
                    </Tooltip>
                    {item.status !== 'RESOLVED' && item.status !== 'CLOSED' && (
                      <>
                        <Tooltip title="Cập nhật trạng thái">
                          <IconButton onClick={() => {
                            setUpdateStatusTarget(item);
                            setNewStatus(item.status);
                          }} size="small" color="warning">
                            <MdAssignment />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xử lý / Khắc phục">
                          <IconButton onClick={() => setResolveTarget(item)} size="small" color="success">
                            <MdCheck />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Xóa">
                      <IconButton onClick={() => onDelete(item.id)} size="small" color="error">
                        <MdDelete />
                      </IconButton>
                    </Tooltip>
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
        rowsPerPage={size}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
      />

      {/* Timeline Dialog */}
      <Dialog open={!!selectedTimeline} onClose={() => setSelectedTimeline(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Dòng thời gian sự cố #{selectedTimeline?.id}</DialogTitle>
        <DialogContent dividers>
          {selectedTimeline && (
            <Box>
              <Typography variant="body2" sx={{ mb: 3 }}>
                <strong>Mô tả ban đầu:</strong> {selectedTimeline.description}
              </Typography>
              <Stepper orientation="vertical" activeStep={selectedTimeline.timeline.length}>
                {selectedTimeline.timeline.map((step, idx) => (
                  <Step key={idx} active={true}>
                    <StepLabel
                      error={step.status === 'REPORTED'}
                      optional={
                        <Typography variant="caption" display="block">
                          Cập nhật bởi: {step.updatedBy} lúc {new Date(step.createdAt).toLocaleString('vi-VN')}
                        </Typography>
                      }
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Trạng thái: {step.status}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ghi chú: {step.notes}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {selectedTimeline.rootCause && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'success.lighter', borderRadius: 1.5, border: '1px solid', borderColor: 'success.light' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Kết luận giải quyết:</Typography>
                  <Typography variant="caption" display="block"><strong>Nguyên nhân gốc rễ:</strong> {selectedTimeline.rootCause}</Typography>
                  <Typography variant="caption" display="block"><strong>Biện pháp khắc phục:</strong> {selectedTimeline.correctiveAction}</Typography>
                  <Typography variant="caption" display="block"><strong>Biện pháp phòng ngừa:</strong> {selectedTimeline.preventiveAction}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTimeline(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={!!updateStatusTarget} onClose={() => setUpdateStatusTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Cập nhật nhật trình sự cố #{updateStatusTarget?.id}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                label="Trạng thái tiếp theo"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as IncidentStatus)}
                fullWidth
              >
                <MenuItem value="INVESTIGATING">Investigating (Đang khảo sát thực địa)</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress (Đang thực hiện sửa chữa)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ghi chú kỹ thuật / Vận hành"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
                required
                placeholder="Nhập ghi chú hiện trường..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateStatusTarget(null)}>Hủy Bỏ</Button>
          <Button onClick={handleStatusSubmit} variant="contained" color="warning" disabled={!statusNotes.trim()}>
            Cập Nhật Nhật Trình
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolution Dialog */}
      <Dialog open={!!resolveTarget} onClose={() => setResolveTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Hoàn thành giải quyết sự cố #{resolveTarget?.id}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nguyên nhân gốc rễ (Root Cause)"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                multiline
                rows={2}
                fullWidth
                required
                placeholder="Phân tích nguyên nhân xảy ra sự cố..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Biện pháp khắc phục tạm thời (Corrective Action)"
                value={corrective}
                onChange={(e) => setCorrective(e.target.value)}
                multiline
                rows={2}
                fullWidth
                required
                placeholder="Biện pháp đã xử lý ngay lập tức..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Biện pháp phòng ngừa lâu dài (Preventive Action)"
                value={preventive}
                onChange={(e) => setPreventive(e.target.value)}
                multiline
                rows={2}
                fullWidth
                required
                placeholder="Biện pháp ngăn ngừa tái diễn..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveTarget(null)}>Hủy Bỏ</Button>
          <Button
            onClick={handleResolveSubmit}
            variant="contained"
            color="success"
            disabled={!rootCause.trim() || !corrective.trim() || !preventive.trim()}
          >
            Đóng Sự Cố (Resolve)
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
