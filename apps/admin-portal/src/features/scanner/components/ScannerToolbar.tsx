import React from 'react';
import { Box, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button, IconButton, Tooltip } from '@mui/material';
import { MdVolumeUp, MdVolumeMute, MdFlashlightOn, MdFlashlightOff, MdWarning } from 'react-icons/md';
import { Gate } from '../../gate/types';

interface ScannerToolbarProps {
  gates: Gate[];
  selectedGateId: number | '';
  onGateChange: (id: number) => void;
  scanMode: 'ENTRY' | 'EXIT' | 'RIDE';
  onScanModeChange: (mode: 'ENTRY' | 'EXIT' | 'RIDE') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  flashEnabled: boolean;
  onToggleFlash: () => void;
  onEmergencyOpen: () => void;
}

export const ScannerToolbar: React.FC<ScannerToolbarProps> = ({
  gates,
  selectedGateId,
  onGateChange,
  scanMode,
  onScanModeChange,
  soundEnabled,
  onToggleSound,
  flashEnabled,
  onToggleFlash,
  onEmergencyOpen,
}) => {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 3, bgcolor: 'background.paper' }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" gap={2}>
          <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
            {/* Gate Selector */}
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="toolbar-gate-select">Chọn Cổng Vận Hành</InputLabel>
              <Select
                labelId="toolbar-gate-select"
                label="Chọn Cổng Vận Hành"
                value={selectedGateId}
                onChange={(e) => onGateChange(Number(e.target.value))}
              >
                {gates.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name} ({g.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Mode Selector */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="toolbar-mode-select">Chế Độ Quét</InputLabel>
              <Select
                labelId="toolbar-mode-select"
                label="Chế Độ Quét"
                value={scanMode}
                onChange={(e) => onScanModeChange(e.target.value as any)}
              >
                <MenuItem value="ENTRY">Quét Vào (Entry)</MenuItem>
                <MenuItem value="EXIT">Quét Ra (Exit)</MenuItem>
                <MenuItem value="RIDE">Cổng Trò Chơi</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Config & Emergency Actions */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <Tooltip title={soundEnabled ? 'Tắt âm thanh báo' : 'Bật âm thanh báo'}>
              <IconButton onClick={onToggleSound} color={soundEnabled ? 'primary' : 'default'}>
                {soundEnabled ? <MdVolumeUp /> : <MdVolumeMute />}
              </IconButton>
            </Tooltip>

            <Tooltip title={flashEnabled ? 'Tắt đèn hỗ trợ' : 'Bật đèn hỗ trợ'}>
              <IconButton onClick={onToggleFlash} color={flashEnabled ? 'warning' : 'default'}>
                {flashEnabled ? <MdFlashlightOn /> : <MdFlashlightOff />}
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              color="error"
              startIcon={<MdWarning />}
              onClick={onEmergencyOpen}
              sx={{ borderRadius: 2 }}
            >
              MỞ CỔNG KHẨN CẤP
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
export default ScannerToolbar;
