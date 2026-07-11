import { logger } from '../../../services/logger';
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  Grid,
  CircularProgress,
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { supportTicketSchema, SupportTicketFormValues } from '../schemas/engagement.schema';
import {
  useSubmitIncidentMutation,
  useGetParksQuery,
  useGetZonesByParkQuery,
} from '../services/engagementApi';
import { useAppSelector } from '../../../store/hooks';
import { toast } from 'react-toastify';

export const SupportRequestForm: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const reporterId = user?.id || 0;

  const [submitIncident, { isLoading, error }] = useSubmitIncidentMutation();
  const { data: parksData, isLoading: parksLoading } = useGetParksQuery();

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      severity: 'LOW',
      description: '',
    },
  });

  const selectedParkId = watch('parkId');
  const { data: zonesData, isLoading: zonesLoading } = useGetZonesByParkQuery(
    selectedParkId,
    { skip: !selectedParkId }
  );

  // Reset zoneId when park changes
  useEffect(() => {
    setValue('zoneId', undefined as any);
  }, [selectedParkId, setValue]);

  const onSubmit = async (data: SupportTicketFormValues) => {
    if (!reporterId) {
      toast.error('Vui lòng đăng nhập để gửi yêu cầu hỗ trợ.');
      return;
    }
    try {
      await submitIncident({
        zone: { id: data.zoneId },
        reporterId,
        description: data.description,
        severity: data.severity,
      }).unwrap();

      toast.success('Yêu cầu hỗ trợ đã được ghi nhận! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      reset();
    } catch (err) {
      logger.error('Support ticket submission failed:', err);
      toast.error('Gửi yêu cầu thất bại. Vui lòng thử lại sau.');
    }
  };

  const parks = parksData?.content ?? [];

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        p: 4,
        bgcolor: 'rgba(30, 41, 59, 0.3)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 4,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            bgcolor: 'rgba(45, 212, 191, 0.1)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2dd4bf',
          }}
        >
          <SupportAgentIcon />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#ffffff' }}
          >
            Gửi yêu cầu hỗ trợ (Support Ticket)
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>
            Mô tả chi tiết sự cố hoặc vấn đề bạn gặp phải tại công viên
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
          Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ. Vui lòng thử lại sau.
        </Alert>
      )}

      <Stack spacing={3}>
        <Grid container spacing={2}>
          {/* Park Selector */}
          <Grid item xs={12} md={6}>
            <Controller
              name="parkId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label="Chọn Công viên *"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!errors.parkId}
                  helperText={errors.parkId?.message}
                  InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
                  InputProps={{
                    endAdornment: parksLoading ? (
                      <CircularProgress size={16} sx={{ color: '#2dd4bf' }} />
                    ) : null,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      bgcolor: 'rgba(15, 23, 42, 0.2)',
                      borderRadius: 2.5,
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
                    },
                  }}
                >
                  {parks.map((park) => (
                    <MenuItem key={park.id} value={park.id}>
                      {park.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Zone Selector */}
          <Grid item xs={12} md={6}>
            <Controller
              name="zoneId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label="Chọn Khu vực *"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!errors.zoneId}
                  helperText={errors.zoneId?.message}
                  disabled={!selectedParkId || zonesLoading}
                  InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
                  InputProps={{
                    endAdornment: zonesLoading ? (
                      <CircularProgress size={16} sx={{ color: '#2dd4bf' }} />
                    ) : null,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      bgcolor: 'rgba(15, 23, 42, 0.2)',
                      borderRadius: 2.5,
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
                    },
                  }}
                >
                  {(zonesData ?? []).map((zone) => (
                    <MenuItem key={zone.id} value={zone.id}>
                      {zone.name} ({zone.code})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        </Grid>

        {/* Severity */}
        <TextField
          select
          label="Mức độ nghiêm trọng *"
          {...register('severity')}
          error={!!errors.severity}
          helperText={errors.severity?.message}
          InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#ffffff',
              bgcolor: 'rgba(15, 23, 42, 0.2)',
              borderRadius: 2.5,
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.08)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
            },
          }}
        >
          <MenuItem value="LOW">Thấp - Phản hồi trong 24h</MenuItem>
          <MenuItem value="MEDIUM">Trung bình - Phản hồi trong 8h</MenuItem>
          <MenuItem value="HIGH">Cao - Phản hồi trong 2h</MenuItem>
          <MenuItem value="CRITICAL">Nghiêm trọng - Phản hồi ngay lập tức</MenuItem>
        </TextField>

        {/* Description */}
        <TextField
          multiline
          rows={5}
          label="Mô tả chi tiết sự cố *"
          placeholder="Vui lòng mô tả rõ sự cố bạn đang gặp phải: thời gian xảy ra, địa điểm cụ thể, ảnh hưởng thực tế..."
          {...register('description')}
          error={!!errors.description}
          helperText={errors.description?.message}
          InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#ffffff',
              bgcolor: 'rgba(15, 23, 42, 0.2)',
              borderRadius: 2.5,
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.08)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          startIcon={<SupportAgentIcon />}
          sx={{
            py: 1.5,
            background: 'linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)',
            color: '#0f172a',
            fontWeight: 800,
            textTransform: 'none',
            borderRadius: 2.5,
            boxShadow: '0 4px 14px rgba(45, 212, 191, 0.3)',
            '&:hover': { boxShadow: '0 6px 20px rgba(45, 212, 191, 0.5)' },
          }}
        >
          {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
        </Button>
      </Stack>
    </Box>
  );
};
