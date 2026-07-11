import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, FormHelperText } from '@mui/material';
import { ticketSchema, TicketInput } from '../schemas/ticketSchema';
import { Ticket, TicketStatus } from '../types';

interface TicketFormProps {
  initialData?: Ticket;
  onSubmit: (data: TicketInput) => void;
  loading?: boolean;
}

export const TicketForm: React.FC<TicketFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      status: 'AVAILABLE',
      validDate: '',
      maxUses: 1,
      customerName: '',
      customerEmail: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        status: initialData.status || 'AVAILABLE',
        validDate: initialData.validDate || '',
        maxUses: initialData.maxUses || 1,
        customerName: initialData.customer?.fullName || '',
        customerEmail: initialData.customer?.email || '',
      });
    }
  }, [initialData, reset]);

  const ticketStatuses: TicketStatus[] = [
    'DRAFT',
    'AVAILABLE',
    'RESERVED',
    'SOLD',
    'ACTIVATED',
    'USED',
    'PARTIALLY_USED',
    'EXPIRED',
    'CANCELLED',
    'REFUNDED',
  ];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2.5} sx={{ mt: 1 }}>
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth size="small" error={!!errors.status}>
            <InputLabel id="ticket-form-status-label">Ticket Status</InputLabel>
            <Select
              labelId="ticket-form-status-label"
              id="ticket-form-status"
              {...field}
              label="Ticket Status"
            >
              {ticketStatuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <Controller
        name="validDate"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            size="small"
            label="Expiration Date (YYYY-MM-DD)"
            type="date"
            InputLabelProps={{ shrink: true }}
            error={!!errors.validDate}
            helperText={errors.validDate?.message}
          />
        )}
      />

      <Controller
        name="maxUses"
        control={control}
        render={({ field: { value, onChange, ...field } }) => (
          <TextField
            {...field}
            value={value || ''}
            onChange={(e) => onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            fullWidth
            size="small"
            label="Maximum Uses"
            type="number"
            error={!!errors.maxUses}
            helperText={errors.maxUses?.message}
          />
        )}
      />

      <Controller
        name="customerName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            size="small"
            label="Visitor Full Name"
            error={!!errors.customerName}
            helperText={errors.customerName?.message}
          />
        )}
      />

      <Controller
        name="customerEmail"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            size="small"
            label="Visitor Email Address (Optional)"
            error={!!errors.customerEmail}
            helperText={errors.customerEmail?.message}
          />
        )}
      />

      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 1 }}>
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};
