import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
} from '@mui/material';
import { Button } from '../../../components/common/Button';
import { rideCategorySchema, RideCategoryFormInput } from '../schemas/rideCategorySchema';
import { RideCategory } from '../types';

interface RideCategoryFormProps {
  initialData?: RideCategory | null;
  onSubmit: (data: RideCategoryFormInput) => void;
  loading?: boolean;
}

export const RideCategoryForm: React.FC<RideCategoryFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RideCategoryFormInput>({
    resolver: zodResolver(rideCategorySchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
      status: initialData?.status || 'ACTIVE',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Category Name"
                placeholder="e.g. Roller Coasters"
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Category Code"
                placeholder="e.g. CAT-COASTER"
                error={!!errors.code}
                helperText={errors.code?.message || 'Uppercase alphanumeric with hyphens/underscores'}
                disabled={loading || !!initialData}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.status} disabled={loading}>
                <InputLabel id="ride-cat-status-label">Status *</InputLabel>
                <Select
                  {...field}
                  labelId="ride-cat-status-label"
                  label="Status *"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={4}
                label="Description"
                placeholder="Brief description of category features and restrictions"
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button type="submit" variant="contained" loading={loading}>
          {initialData ? 'Update Category' : 'Register Category'}
        </Button>
      </Box>
    </Box>
  );
};
