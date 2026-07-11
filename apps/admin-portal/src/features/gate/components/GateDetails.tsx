import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Gate } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';
import { MdSettings, MdComputer, MdTimer, MdSecurity, MdArrowBack } from 'react-icons/md';

interface GateDetailsProps {
  gate: Gate;
  onBack: () => void;
  onEdit: () => void;
}

export const GateDetails: React.FC<GateDetailsProps> = ({
  gate,
  onBack,
  onEdit,
}) => {
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<MdArrowBack />} onClick={onBack} variant="outlined" size="small">
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ ml: 1, fontWeight: 'bold' }}>
          Chi tiết Cổng: {gate.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* General & Status */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Thông Tin Trạng Thái
                </Typography>
                <Button startIcon={<MdSettings />} variant="text" size="small" onClick={onEdit}>
                  Chỉnh sửa
                </Button>
              </Box>
              <Divider />
              <List>
                <ListItem disableGutters>
                  <ListItemText primary="Mã định danh (Code)" secondary={gate.code} secondaryTypographyProps={{ sx: { fontFamily: 'monospace', fontWeight: 'bold' } }} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Loại Cổng" secondary={<StatusChip status={gate.type} sx={{ mt: 0.5 }} />} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Trạng thái Hoạt động" secondary={<StatusChip status={gate.status} sx={{ mt: 0.5 }} />} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Nhân viên phụ trách" secondary={gate.currentOperator || 'Chưa phân công'} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Information */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <MdComputer style={{ fontSize: '1.25rem' }} />
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Thông Số Thiết Bị
                </Typography>
              </Box>
              <Divider />
              <List>
                <ListItem disableGutters>
                  <ListItemText primary="Trạng thái Kết nối" secondary={<StatusChip status={gate.deviceStatus} sx={{ mt: 0.5 }} />} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Địa chỉ IP" secondary={gate.deviceInfo.ipAddress} secondaryTypographyProps={{ sx: { fontFamily: 'monospace' } }} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Địa chỉ MAC" secondary={gate.deviceInfo.macAddress} secondaryTypographyProps={{ sx: { fontFamily: 'monospace' } }} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Phiên bản phần sụn (Firmware)" secondary={gate.deviceInfo.firmwareVersion} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Assignments & Hours */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <MdTimer style={{ fontSize: '1.25rem' }} />
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Phân Cắt & Giờ Mở Cửa
                </Typography>
              </Box>
              <Divider />
              <List>
                <ListItem disableGutters>
                  <ListItemText primary="Địa điểm chính" secondary={gate.assignedVenueName} />
                </ListItem>
                {gate.assignedZoneName && (
                  <ListItem disableGutters>
                    <ListItemText primary="Phân khu chỉ định" secondary={gate.assignedZoneName} />
                  </ListItem>
                )}
                {gate.assignedAttractionName && (
                  <ListItem disableGutters>
                    <ListItemText primary="Trò chơi chỉ định (Attraction)" secondary={gate.assignedAttractionName} />
                  </ListItem>
                )}
                <ListItem disableGutters>
                  <ListItemText primary="Khung giờ hoạt động" secondary={`${gate.operatingHours.open} - ${gate.operatingHours.close}`} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Scanner Configurations */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <MdSecurity style={{ fontSize: '1.25rem' }} />
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Cấu Hình Đầu Đọc
                </Typography>
              </Box>
              <Divider />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Tự động quét:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: gate.scannerConfig.autoScan ? 'success.main' : 'text.disabled' }}>
                    {gate.scannerConfig.autoScan ? 'Đang bật' : 'Đang tắt'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Quét liên tục:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: gate.scannerConfig.continuousScan ? 'success.main' : 'text.disabled' }}>
                    {gate.scannerConfig.continuousScan ? 'Đang bật' : 'Đang tắt'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Âm thanh Beep:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: gate.scannerConfig.beepSound ? 'success.main' : 'text.disabled' }}>
                    {gate.scannerConfig.beepSound ? 'Đang bật' : 'Đang tắt'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Đèn Flash hỗ trợ:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: gate.scannerConfig.flashLight ? 'success.main' : 'text.disabled' }}>
                    {gate.scannerConfig.flashLight ? 'Đang bật' : 'Đang tắt'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default GateDetails;
