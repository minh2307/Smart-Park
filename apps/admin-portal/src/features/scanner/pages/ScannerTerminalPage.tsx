import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { useGetGatesQuery, useUpdateGateMutation } from '../../gate/services/gateApi';
import { useValidateTicketScanMutation } from '../../ticket-validation/services/validationApi';
import { ScannerToolbar } from '../components/ScannerToolbar';
import { ScannerView } from '../components/ScannerView';
import { ValidationResultDialog } from '../../ticket-validation/components/ValidationResultDialog';
import { IncidentDialog } from '../../ticket-validation/components/IncidentDialog';
import { ValidationLog } from '../../ticket-validation/types';
import { MdSettings, MdWifi, MdWifiOff, MdWarning } from 'react-icons/md';

export const ScannerTerminalPage: React.FC = () => {
  const [selectedGateId, setSelectedGateId] = useState<number | ''>('');
  const [scanMode, setScanMode] = useState<'ENTRY' | 'EXIT' | 'RIDE'>('ENTRY');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<string[]>([]);

  // Scanning Result dialogs
  const [currentResultLog, setCurrentResultLog] = useState<ValidationLog | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);
  const [incidentTicketCode, setIncidentTicketCode] = useState('');

  // History list
  const [recentScans, setRecentScans] = useState<ValidationLog[]>([]);

  // APIs
  const { data: gatesData } = useGetGatesQuery({ page: 0, size: 100 });
  const [updateGate] = useUpdateGateMutation();
  const [validateScan] = useValidateTicketScanMutation();

  const gates = gatesData?.content || [];
  const selectedGate = gates.find((g) => g.id === selectedGateId) || null;

  // Sound generator
  const playBeep = (success: boolean) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (success) {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // A3 note
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn('AudioContext not supported or blocked by user gesture.');
    }
  };

  const handleScan = async (qrCode: string) => {
    if (!selectedGateId) {
      toast.error('Vui lòng chọn cổng vận hành trước khi quét vé!');
      return;
    }

    if (!isOnline) {
      // Offline buffering
      setOfflineQueue((prev) => [...prev, qrCode]);
      toast.info(`Ngoại tuyến: Đã lưu mã vé ${qrCode} vào bộ nhớ đệm.`);
      playBeep(true);
      return;
    }

    try {
      const res = await validateScan({
        qrCode,
        gateId: Number(selectedGateId),
        attractionId: scanMode === 'RIDE' ? selectedGate?.assignedAttractionId || undefined : undefined,
      }).unwrap();

      playBeep(res.success);
      setCurrentResultLog(res.log);
      setIsResultOpen(true);

      // Add to recent feed
      setRecentScans((prev) => [res.log, ...prev].slice(0, 10));
    } catch (err) {
      playBeep(false);
      toast.error('Lỗi kết nối hoặc hệ thống xác thực thất bại.');
    }
  };

  const handleSyncOffline = async () => {
    if (offlineQueue.length === 0) return;
    toast.info(`Đang đồng bộ ${offlineQueue.length} lượt quét ngoại tuyến...`);

    const tempQueue = [...offlineQueue];
    setOfflineQueue([]); // Clear queue visually

    for (const code of tempQueue) {
      try {
        const res = await validateScan({
          qrCode: code,
          gateId: Number(selectedGateId),
          attractionId: scanMode === 'RIDE' ? selectedGate?.assignedAttractionId || undefined : undefined,
        }).unwrap();
        setRecentScans((prev) => [res.log, ...prev].slice(0, 10));
      } catch (e) {
        // Re-buffer failed syncs
        setOfflineQueue((prev) => [...prev, code]);
      }
    }
    toast.success('Đồng bộ dữ liệu hoàn tất!');
  };

  const handleEmergencyOpen = async () => {
    if (!selectedGate) return;
    try {
      await updateGate({
        id: selectedGate.id,
        body: { status: 'EMERGENCY', deviceStatus: 'ONLINE' },
      }).unwrap();
      toast.warn(`Cảnh báo: Cổng ${selectedGate.code} đã được mở rào khẩn cấp!`);
    } catch (err) {
      toast.error('Không thể kích hoạt chế độ khẩn cấp.');
    }
  };

  const handleEmergencyClose = async () => {
    if (!selectedGate) return;
    try {
      await updateGate({
        id: selectedGate.id,
        body: { status: 'CLOSED' },
      }).unwrap();
      toast.success(`Đã khóa rào chắn cổng ${selectedGate.code}.`);
    } catch (err) {
      toast.error('Không thể điều khiển rào chắn.');
    }
  };



  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Terminal Quét Vé (Scanner Terminal)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Giao diện điều khiển chuyên dụng cho nhân viên trực cổng. Hỗ trợ giả lập quét camera và máy quét USB cầm tay.
          </Typography>
        </Box>

        {/* Offline Simulation Toggle */}
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            color={isOnline ? 'primary' : 'error'}
            startIcon={isOnline ? <MdWifi /> : <MdWifiOff />}
            onClick={() => setIsOnline(!isOnline)}
            size="small"
          >
            {isOnline ? 'Mạng Trực Tuyến (Online)' : 'Chế Độ Offline'}
          </Button>
        </Box>
      </Box>

      {/* Toolbar Config */}
      <ScannerToolbar
        gates={gates}
        selectedGateId={selectedGateId}
        onGateChange={(id) => {
          setSelectedGateId(id);
          // Pre-populate scanning mode based on gate type
          const gate = gates.find((g) => g.id === id);
          if (gate) {
            setScanMode(gate.type === 'RIDE' ? 'RIDE' : gate.type === 'EXIT' ? 'EXIT' : 'ENTRY');
          }
        }}
        scanMode={scanMode}
        onScanModeChange={setScanMode}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        flashEnabled={flashEnabled}
        onToggleFlash={() => setFlashEnabled(!flashEnabled)}
        onEmergencyOpen={handleEmergencyOpen}
      />

      {selectedGate?.status === 'EMERGENCY' && (
        <Card variant="outlined" sx={{ mb: 3, borderColor: 'error.main', bgcolor: 'error.light', p: 0.5 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <MdWarning style={{ fontSize: '2.5rem', color: 'red' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" color="error.dark">CỔNG ĐANG MỞ KHẨN CẤP!</Typography>
                <Typography variant="body2" mb={1} color="error.dark">
                  Rào chắn đang được mở khóa liên tục để thoát hiểm. Hãy nhấn nút dưới đây để khôi phục trạng thái hoạt động bình thường.
                </Typography>
                <Button variant="contained" color="error" size="small" onClick={handleEmergencyClose}>
                  Khôi phục (Đóng rào chắn)
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {selectedGateId ? (
        <ScannerView
          onScan={handleScan}
          recentScans={recentScans}
          offlineQueueCount={offlineQueue.length}
          onSyncOffline={handleSyncOffline}
          isOnline={isOnline}
          flashEnabled={flashEnabled}
        />
      ) : (
        <Card variant="outlined" sx={{ py: 6, textAlign: 'center', borderRadius: 4 }}>
          <CardContent>
            <MdSettings style={{ fontSize: '4rem', color: '#ccc', marginBottom: 16 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Chưa kích hoạt Terminal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 3 }}>
              Vui lòng chọn cổng vận hành cụ thể từ thanh công cụ phía trên để kích hoạt camera quét vé và bắt đầu kiểm soát luồng ra vào.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Validation Result Dialog */}
      <ValidationResultDialog
        open={isResultOpen}
        log={currentResultLog}
        onClose={() => setIsResultOpen(false)}
        onManualOverride={(log) => {
          toast.success(`Đã phê duyệt ngoại lệ cho vé ${log.ticketCode}`);
          setIsResultOpen(false);
        }}
        onReportIncident={(log) => {
          setIncidentTicketCode(log.ticketCode);
          setIsResultOpen(false);
          setIsIncidentOpen(true);
        }}
      />

      {/* Incident Logger Dialog */}
      <IncidentDialog
        open={isIncidentOpen}
        ticketCode={incidentTicketCode}
        onClose={() => setIsIncidentOpen(false)}
        onSubmit={(data) => {
          toast.error(`Đã báo cáo sự cố loại ${data.category} lên hệ thống quản lý.`);
        }}
      />
    </Box>
  );
};
export default ScannerTerminalPage;
