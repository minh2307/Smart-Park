import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
} from '@mui/material';

const pointAdjustmentSchema = z.object({
  customerId: z.number({ required_error: 'Vui lòng chọn khách hàng' }),
  type: z.enum(['ADD', 'DEDUCT'], { required_error: 'Vui lòng chọn loại điều chỉnh' }),
  points: z.number({ required_error: 'Vui lòng nhập số điểm' }).min(1, 'Số điểm phải tối thiểu là 1'),
  reason: z.string({ required_error: 'Vui lòng nhập lý do' }).min(5, 'Lý do phải có ít nhất 5 ký tự'),
});

type PointAdjustmentFormValues = z.infer<typeof pointAdjustmentSchema>;

interface PointAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PointAdjustmentFormValues) => void;
  customers: { id: number; fullName: string; email: string }[];
  isSubmitting?: boolean;
}

export const PointAdjustmentDialog: React.FC<PointAdjustmentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  customers,
  isSubmitting = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PointAdjustmentFormValues>({
    resolver: zodResolver(pointAdjustmentSchema),
    defaultValues: {
      customerId: undefined as any,
      type: 'ADD',
      points: 0,
      reason: '',
    },
  });

  const handleFormSubmit = (values: PointAdjustmentFormValues) => {
    onSubmit(values);
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle fontWeight="bold">Yêu cầu điều chỉnh điểm tích lũy</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Chọn khách hàng"
                    fullWidth
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.customerId}
                    helperText={errors.customerId?.message}
                  >
                    {customers.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.fullName} ({c.email})
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Loại điều chỉnh"
                    fullWidth
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value="ADD">Cộng điểm (+)</MenuItem>
                    <MenuItem value="DEDUCT">Trừ điểm (-)</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="points"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Số điểm"
                    fullWidth
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.points}
                    helperText={errors.points?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Lý do / Giải trình để kiểm toán"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="secondary" variant="outlined" disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
            Gửi yêu cầu
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
