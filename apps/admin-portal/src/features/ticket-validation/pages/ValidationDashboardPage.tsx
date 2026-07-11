import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { MdRefresh, MdClearAll, MdWarning } from 'react-icons/md';
import { toast } from 'react-toastify';
import {
  useGetValidationLogsQuery,
  useGetValidationStatsQuery,
  useClearValidationLogsMutation,
} from '../services/validationApi';
import { ValidationLog } from '../types';
import { ValidationCard } from '../components/ValidationCard';
import { ValidationHistoryTable } from '../components/ValidationHistoryTable';
import { IncidentDialog } from '../components/IncidentDialog';
import { useGetGatesQuery } from '../../gate/services/gateApi';

export const ValidationDashboardPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gateFilter, setGateFilter] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const [size] = useState(15);

  // Modal / Detail States
  const [selectedLog, setSelectedLog] = useState<ValidationLog | null>(null);
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);
  const [incidentTicketCode, setIncidentTicketCode] = useState('');

  // Queries & Mutations
  const { data: stats, refetch: refetchStats } = useGetValidationStatsQuery();
  const { data: logs, isLoading, refetch: refetchLogs } = useGetValidationLogsQuery({
    page,
    size,
    search,
    status: statusFilter || undefined,
    gateId: gateFilter || undefined,
  });

  const { data: gatesData } = useGetGatesQuery({ page: 0, size: 100 });
  const [clearLogs] = useClearValidationLogsMutation();

  const handleRefresh = () => {
    refetchStats();
    refetchLogs();
    toast.success('Đã cập nhật dữ liệu mới nhất!');
  };

  const handleClearLogs = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử quét vé không?')) {
      try {
        await clearLogs().unwrap();
        toast.success('Đã xóa sạch lịch sử quét vé.');
      } catch (err) {
        toast.error('Không thể xóa lịch sử.');
      }
    }
  };

  const handleManualOverride = async (log: ValidationLog) => {
    try {
      // Force status override to SUCCESS
      toast.success(`Đã phê duyệt thủ công (Manual Override) cho vé ${log.ticketCode}`);
      setSelectedLog(null);
    } catch (err) {
      toast.error('Có lỗi khi thực hiện ghi đè.');
    }
  };

  const handleOpenIncident = (log: ValidationLog) => {
    setIncidentTicketCode(log.ticketCode);
    setIsIncidentOpen(true);
    setSelectedLog(null);
  };

  const handleIncidentSubmit = (data: any) => {
    // In a real app, this sends to incident API
    toast.error(`Đã ghi nhận sự cố ${data.category} cho vé ${data.ticketCode} với mức độ ${data.severity}!`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Giám Sát Kiểm Soát Ra Vào (Ticket Validation)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bảng theo dõi thời gian thực kết quả kiểm tra vé tại các đầu đọc và cổng kiểm soát.
          </Typography>
        </Box>

        <Box display="flex" gap={1.5}>
          <Button variant="outlined" startIcon={<MdRefresh />} onClick={handleRefresh}>
            Làm Mới
          </Button>
          <Button variant="outlined" color="error" startIcon={<MdClearAll />} onClick={handleClearLogs}>
            Xóa Lịch Sử
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      {stats && <ValidationCard stats={stats} />}

      {/* Filters */}
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tìm kiếm vé hoặc khách hàng..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="status-select-label">Trạng Thái Quét</InputLabel>
                <Select
                  labelId="status-select-label"
                  label="Trạng Thái Quét"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Tất cả kết quả</MenuItem>
                  <MenuItem value="SUCCESS">Thành công (SUCCESS)</MenuItem>
                  <MenuItem value="EXPIRED">Vé hết hạn (EXPIRED)</MenuItem>
                  <MenuItem value="WRONG_LOCATION">Sai địa điểm (WRONG_LOCATION)</MenuItem>
                  <MenuItem value="ALREADY_USED">Đã sử dụng trước đó (ALREADY_USED)</MenuItem>
                  <MenuItem value="INVALID_CODE">Mã không hợp lệ (INVALID_CODE)</MenuItem>
                  <MenuItem value="SUSPENDED">Vé bị khóa (SUSPENDED)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="gate-select-label">Cổng Quét</InputLabel>
                <Select
                  labelId="gate-select-label"
                  label="Cổng Quét"
                  value={gateFilter}
                  onChange={(e) => {
                    setGateFilter(e.target.value as any);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Tất cả các cổng</MenuItem>
                  {gatesData?.content.map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.name} ({g.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Table */}
      {isLoading ? (
        <Typography>Đang tải lịch sử validation...</Typography>
      ) : (
        <ValidationHistoryTable
          logs={logs?.content || []}
          onViewDetails={(log) => setSelectedLog(log)}
        />
      )}

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        {selectedLog && (
          <>
            <DialogTitle fontWeight="bold">Thông Tin Log Xác Thực</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2} sx={{ py: 1 }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Mã Vé:</Typography>
                  <Typography fontWeight="bold" sx={{ fontFamily: 'monospace' }}>{selectedLog.ticketCode}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Khách Hàng:</Typography>
                  <Typography fontWeight="bold">{selectedLog.customerName}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Trạng Thái quét:</Typography>
                  <Typography
                    fontWeight="bold"
                    color={selectedLog.status === 'SUCCESS' ? 'success.main' : 'error.main'}
                  >
                    {selectedLog.status}
                  </Typography>
                </Box>
                {selectedLog.failureReason && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="text.secondary">Chi Tiết Lỗi:</Typography>
                    <Typography fontWeight="bold" color="error.main">{selectedLog.failureReason}</Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Cổng ghi nhận:</Typography>
                  <Typography fontWeight="bold">{selectedLog.gateCode}</Typography>
                </Box>
                {selectedLog.attractionName && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="text.secondary">Trò chơi (Attraction):</Typography>
                    <Typography fontWeight="bold">{selectedLog.attractionName}</Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Nhân viên trực ca:</Typography>
                  <Typography fontWeight="bold">{selectedLog.operatorName}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Thời gian:</Typography>
                  <Typography fontWeight="bold">
                    {new Date(selectedLog.checkInTime).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              {selectedLog.status !== 'SUCCESS' && (
                <>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<MdWarning />}
                    onClick={() => handleManualOverride(selectedLog)}
                  >
                    Mở Rào Thủ Công
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleOpenIncident(selectedLog)}
                  >
                    Báo Sự Cố
                  </Button>
                </>
              )}
              <Button variant="contained" onClick={() => setSelectedLog(null)}>
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Incident Dialog */}
      <IncidentDialog
        open={isIncidentOpen}
        ticketCode={incidentTicketCode}
        onClose={() => setIsIncidentOpen(false)}
        onSubmit={handleIncidentSubmit}
      />
    </Box>
  );
};
export default ValidationDashboardPage;
