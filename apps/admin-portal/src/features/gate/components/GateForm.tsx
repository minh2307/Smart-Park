import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Divider,
} from '@mui/material';
import { gateSchema, GateInput } from '../schemas/gateSchema';
import { Gate } from '../types';
import { useGetRidesQuery } from '../../ride/services/rideApi';

interface GateFormProps {
  initialValues?: Gate;
  onSubmit: (values: GateInput) => void;
  onCancel: () => void;
}

export const GateForm: React.FC<GateFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const { data: rideData } = useGetRidesQuery({ page: 0, size: 100 });

  const defaultValues: GateInput = initialValues
    ? {
      code: initialValues.code,
      name: initialValues.name,
      type: initialValues.type,
      assignedVenueId: initialValues.assignedVenueId,
      assignedZoneId: initialValues.assignedZoneId || undefined,
      assignedAttractionId: initialValues.assignedAttractionId || undefined,
      status: initialValues.status,
      deviceStatus: initialValues.deviceStatus,
      currentOperator: initialValues.currentOperator || '',
      deviceInfo: {
        ipAddress: initialValues.deviceInfo.ipAddress,
        macAddress: initialValues.deviceInfo.macAddress,
        firmwareVersion: initialValues.deviceInfo.firmwareVersion,
      },
      scannerConfig: {
        autoScan: initialValues.scannerConfig.autoScan,
        continuousScan: initialValues.scannerConfig.continuousScan,
        beepSound: initialValues.scannerConfig.beepSound,
        flashLight: initialValues.scannerConfig.flashLight,
      },
      operatingHours: {
        open: initialValues.operatingHours.open,
        close: initialValues.operatingHours.close,
      },
    }
    : {
      code: '',
      name: '',
      type: 'ENTRY',
      assignedVenueId: 1,
      status: 'OPEN',
      deviceStatus: 'ONLINE',
      currentOperator: '',
      deviceInfo: {
        ipAddress: '192.168.1.100',
        macAddress: '00:1A:2B:3C:4D:5E',
        firmwareVersion: 'v1.0.0',
      },
      scannerConfig: {
        autoScan: true,
        continuousScan: false,
        beepSound: true,
        flashLight: false,
      },
      operatingHours: {
        open: '08:00',
        close: '18:00',
      },
    };

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<GateInput>({
    resolver: zodResolver(gateSchema),
    defaultValues,
  });

  const gateType = watch('type');

  // Show all rides in this single amusement park
  const availableRides = rideData?.content || [];
  const filteredRides = availableRides;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        {/* Core Info */}
        <Grid item xs={12}>
          <Typography variant="h6" color="primary" gutterBottom>
            Thông Tin Chung
          </Typography>
          <Divider />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            {...register('code')}
            label="Mã Cổng"
            fullWidth
            required
            error={!!errors.code}
            helperText={errors.code?.message}
            placeholder="Ví dụ: GATE_ENTRY_01"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            {...register('name')}
            label="Tên Cổng"
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name?.message}
            placeholder="Ví dụ: Cổng Chính Lối Vào 1"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel id="gate-type-label">Loại Cổng</InputLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="gate-type-label" label="Loại Cổng">
                  <MenuItem value="ENTRY">Lối vào cổng chính (ENTRY)</MenuItem>
                  <MenuItem value="EXIT">Lối ra cổng chính (EXIT)</MenuItem>
                  <MenuItem value="RIDE">Lối vào trò chơi (RIDE)</MenuItem>
                  <MenuItem value="VIP">Lối đi ưu tiên/VIP (VIP)</MenuItem>
                </Select>
              )}
            />
            {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id="gate-status-label">Trạng Thái Cổng</InputLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="gate-status-label" label="Trạng Thái Cổng">
                  <MenuItem value="OPEN">Mở (OPEN)</MenuItem>
                  <MenuItem value="CLOSED">Đóng (CLOSED)</MenuItem>
                  <MenuItem value="BUSY">Bận (BUSY)</MenuItem>
                  <MenuItem value="MAINTENANCE">Bảo trì (MAINTENANCE)</MenuItem>
                  <MenuItem value="OFFLINE">Ngoại tuyến (OFFLINE)</MenuItem>
                  <MenuItem value="EMERGENCY">Khẩn cấp (EMERGENCY)</MenuItem>
                  <MenuItem value="DISABLED">Vô hiệu hóa (DISABLED)</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={!!errors.deviceStatus}>
            <InputLabel id="device-status-label">Trạng Thái Thiết Bị</InputLabel>
            <Controller
              name="deviceStatus"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="device-status-label" label="Trạng Thái Thiết Bị">
                  <MenuItem value="ONLINE">Trực tuyến (ONLINE)</MenuItem>
                  <MenuItem value="OFFLINE">Ngoại tuyến (OFFLINE)</MenuItem>
                  <MenuItem value="ERROR">Lỗi (ERROR)</MenuItem>
                </Select>
              )}
            />
            {errors.deviceStatus && <FormHelperText>{errors.deviceStatus.message}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Assignments */}
        <Grid item xs={12} sx={{ mt: 1 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Phân Công Vận Hành
          </Typography>
          <Divider />
        </Grid>

        <Grid item xs={12}>
          {gateType === 'RIDE' ? (
            <FormControl fullWidth error={!!errors.assignedAttractionId}>
              <InputLabel id="attraction-label">Trò Chơi (Attraction)</InputLabel>
              <Controller
                name="assignedAttractionId"
                control={control}
                render={({ field }) => (
                  <Select
                    labelId="attraction-label"
                    label="Trò Chơi (Attraction)"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <MenuItem value="">-- Không chỉ định trò chơi --</MenuItem>
                    {filteredRides.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.assignedAttractionId && <FormHelperText>{errors.assignedAttractionId.message}</FormHelperText>}
            </FormControl>
          ) : (
            <TextField
              {...register('currentOperator')}
              label="Nhân Viên Vận Hành (Tên đăng nhập / Họ tên)"
              fullWidth
              error={!!errors.currentOperator}
              helperText={errors.currentOperator?.message}
              placeholder="Ví dụ: gate_staff_1"
            />
          )}
        </Grid>

        {/* Device Settings */}
        <Grid item xs={12} sx={{ mt: 1 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Thông Số Thiết Bị & Khung Giờ
          </Typography>
          <Divider />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            {...register('deviceInfo.ipAddress')}
            label="Địa chỉ IP"
            fullWidth
            required
            error={!!errors.deviceInfo?.ipAddress}
            helperText={errors.deviceInfo?.ipAddress?.message}
            placeholder="Ví dụ: 192.168.1.100"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            {...register('deviceInfo.macAddress')}
            label="Địa chỉ MAC"
            fullWidth
            required
            error={!!errors.deviceInfo?.macAddress}
            helperText={errors.deviceInfo?.macAddress?.message}
            placeholder="Ví dụ: 00:1A:2B:3C:4D:5E"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            {...register('deviceInfo.firmwareVersion')}
            label="Phiên bản Firmware"
            fullWidth
            required
            error={!!errors.deviceInfo?.firmwareVersion}
            helperText={errors.deviceInfo?.firmwareVersion?.message}
            placeholder="Ví dụ: v2.4.1"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            {...register('operatingHours.open')}
            label="Giờ Mở Cổng (HH:MM)"
            fullWidth
            required
            error={!!errors.operatingHours?.open}
            helperText={errors.operatingHours?.open?.message}
            placeholder="08:00"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            {...register('operatingHours.close')}
            label="Giờ Đóng Cổng (HH:MM)"
            fullWidth
            required
            error={!!errors.operatingHours?.close}
            helperText={errors.operatingHours?.close?.message}
            placeholder="18:00"
          />
        </Grid>

        {/* Scanner Config */}
        <Grid item xs={12} sx={{ mt: 1 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Cấu Hình Đầu Đọc (Scanner)
          </Typography>
          <Divider />
        </Grid>

        <Grid item xs={12} sm={3}>
          <FormControlLabel
            control={
              <Controller
                name="scannerConfig.autoScan"
                control={control}
                render={({ field }) => (
                  <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                )}
              />
            }
            label="Tự Động Quét"
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <FormControlLabel
            control={
              <Controller
                name="scannerConfig.continuousScan"
                control={control}
                render={({ field }) => (
                  <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                )}
              />
            }
            label="Quét Liên Tục"
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <FormControlLabel
            control={
              <Controller
                name="scannerConfig.beepSound"
                control={control}
                render={({ field }) => (
                  <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                )}
              />
            }
            label="Âm Thanh Beep"
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <FormControlLabel
            control={
              <Controller
                name="scannerConfig.flashLight"
                control={control}
                render={({ field }) => (
                  <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                )}
              />
            }
            label="Bật Đèn Flash"
          />
        </Grid>

        {/* Buttons */}
        <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {initialValues ? 'Lưu Thay Đổi' : 'Thêm Cổng Mới'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
export default GateForm;
