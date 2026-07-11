import React from 'react';
import { Card, CardContent, Typography, Divider, Box, Button, Grid } from '@mui/material';
import { MdPlayArrow, MdPause, MdWarning, MdVolumeUp, MdVolumeMute } from 'react-icons/md';
import { Gate } from '../../gate/types';

interface OperatorPanelProps {
  gate: Gate | null;
  shiftStartTime: string;
  onEmergencyOpen: () => void;
  onEmergencyClose: () => void;
  onToggleStatus: () => void;
}

export const OperatorPanel: React.FC<OperatorPanelProps> = ({
  gate,
  shiftStartTime,
  onEmergencyOpen,
  onEmergencyClose,
  onToggleStatus,
}) => {
  const [mute, setMute] = React.useState(false);

  if (!gate) return null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="primary">
              Bàn Vận Hành - Cổng {gate.code}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bắt đầu ca trực: {shiftStartTime} | Nhân viên: {gate.currentOperator || 'Chưa định danh'}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={mute ? <MdVolumeMute /> : <MdVolumeUp />}
            onClick={() => setMute(!mute)}
          >
            {mute ? 'Muted' : 'Sound On'}
          </Button>
        </Box>
        <Divider />

        <Grid container spacing={2} sx={{ mt: 1.5 }}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color={gate.status === 'OPEN' ? 'error' : 'success'}
              startIcon={gate.status === 'OPEN' ? <MdPause /> : <MdPlayArrow />}
              onClick={onToggleStatus}
            >
              {gate.status === 'OPEN' ? 'Tạm Dừng Cổng' : 'Mở Cổng Quét'}
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              startIcon={<MdWarning />}
              onClick={onEmergencyOpen}
            >
              KHẨN CẤP: MỞ RÀO
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={onEmergencyClose}
            >
              KHẨN CẤP: KHÓA RÀO
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default OperatorPanel;
