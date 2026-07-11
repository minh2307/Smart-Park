import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { CameraScanner } from './CameraScanner';
import { BarcodeScanner } from './BarcodeScanner';
import { ValidationLog } from '../../ticket-validation/types';
import { MdWifi, MdWifiOff, MdSync, MdHistory } from 'react-icons/md';
import { StatusChip } from '../../../shared/components/StatusChip';
import dayjs from 'dayjs';

interface ScannerViewProps {
  onScan: (code: string) => void;
  recentScans: ValidationLog[];
  offlineQueueCount: number;
  onSyncOffline: () => void;
  isOnline: boolean;
  flashEnabled: boolean;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onScan,
  recentScans,
  offlineQueueCount,
  onSyncOffline,
  isOnline,
  flashEnabled,
}) => {
  return (
    <Grid container spacing={3}>
      {/* Scanner Viewfinder / Input */}
      <Grid item xs={12} md={7}>
        <CameraScanner onScan={onScan} flashEnabled={flashEnabled} />
        <BarcodeScanner onScan={onScan} enabled={true} />
      </Grid>

      {/* Real-time Status / Queue & Recent logs */}
      <Grid item xs={12} md={5}>
        <Grid container spacing={2}>
          {/* Connection & Sync Status */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Trạng Thái Kết Nối
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {isOnline ? (
                      <ChipIcon label="Trực tuyến" icon={<MdWifi />} color="success" />
                    ) : (
                      <ChipIcon label="Ngoại tuyến" icon={<MdWifiOff />} color="error" />
                    )}
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Hàng chờ đồng bộ ngoại tuyến:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {offlineQueueCount} lượt quét
                    </Typography>
                  </Box>

                  {offlineQueueCount > 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<MdSync />}
                      onClick={onSyncOffline}
                    >
                      Đồng bộ ngay
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Scans Feed */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 3, minHeight: 310 }}>
              <CardContent sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <MdHistory style={{ fontSize: '1.25rem' }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Lịch sử Quét Vừa Qua (Feed)
                  </Typography>
                </Box>
                <Divider />

                <List sx={{ maxHeight: 240, overflow: 'auto', mt: 1 }}>
                  {recentScans.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                      Chưa có dữ liệu lượt quét nào.
                    </Typography>
                  ) : (
                    recentScans.map((scan) => (
                      <React.Fragment key={scan.id}>
                        <ListItem
                          alignItems="flex-start"
                          disableGutters
                          secondaryAction={<StatusChip status={scan.status} />}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                                {scan.ticketCode}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Khách: {scan.customerName} | Cổng: {scan.gateCode}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {dayjs(scan.checkInTime).format('HH:mm:ss')}
                                </Typography>
                                {scan.failureReason && (
                                  <Typography variant="caption" color="error.main" display="block" sx={{ fontWeight: 500 }}>
                                    Lỗi: {scan.failureReason}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        <Divider variant="fullWidth" component="li" />
                      </React.Fragment>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

// Internal Helper Chip component
const ChipIcon: React.FC<{ label: string; icon: React.ReactNode; color: 'success' | 'error' }> = ({
  label,
  icon,
  color,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      px: 1,
      py: 0.25,
      borderRadius: 1,
      bgcolor: color === 'success' ? 'success.light' : 'error.light',
      color: color === 'success' ? 'success.dark' : 'error.dark',
      fontWeight: 'bold',
      fontSize: '0.75rem',
    }}
  >
    {icon}
    {label}
  </Box>
);

export default ScannerView;
