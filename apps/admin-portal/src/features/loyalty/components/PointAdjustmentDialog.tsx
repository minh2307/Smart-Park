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
  customerId: z.number({ required_error: 'Please select a customer' }),
  type: z.enum(['ADD', 'DEDUCT'], { required_error: 'Adjustment type is required' }),
  points: z.number({ required_error: 'Points value is required' }).min(1, 'Points must be at least 1'),
  reason: z.string({ required_error: 'Reason is required' }).min(5, 'Reason must be at least 5 characters'),
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
      <DialogTitle fontWeight="bold">Request Loyalty Point Adjustment</DialogTitle>
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
                    label="Select Customer"
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
                    label="Adjustment Type"
                    fullWidth
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value="ADD">Add Points (+)</MenuItem>
                    <MenuItem value="DEDUCT">Deduct Points (-)</MenuItem>
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
                    label="Points Count"
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
                    label="Reason / Explanation for Audit"
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
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
            Submit Request
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
