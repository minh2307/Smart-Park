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
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { Button } from '../../../components/common/Button';
import { rideSchema, RideFormInput } from '../schemas/rideSchema';
import { Ride } from '../types';
import { mockRideCategories } from '../../ride-category/services/rideCategoryApi';

interface RideFormProps {
  initialData?: Ride | null;
  onSubmit: (data: RideFormInput) => void;
  loading?: boolean;
}

export const RideForm: React.FC<RideFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RideFormInput>({
    resolver: zodResolver(rideSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
      capacity: initialData?.capacity || 100,
      durationSeconds: initialData?.durationSeconds || 120,
      status: initialData?.status || 'OPERATING',
      venueId: initialData?.venueId || 1,
      zoneId: initialData?.zoneId || 1,
      rideCategoryId: initialData?.rideCategoryId || 1,
      operatingHours: {
        open: initialData?.operatingHours?.open || '09:00',
        close: initialData?.operatingHours?.close || '21:00',
      },
      restrictions: {
        minHeight: initialData?.restrictions?.minHeight || '',
        maxHeight: initialData?.restrictions?.maxHeight || '',
        minAge: initialData?.restrictions?.minAge || '',
        maxAge: initialData?.restrictions?.maxAge || '',
        minWeight: initialData?.restrictions?.minWeight || '',
        maxWeight: initialData?.restrictions?.maxWeight || '',
        healthWarning: initialData?.restrictions?.healthWarning ?? false,
        pregnancyRestriction: initialData?.restrictions?.pregnancyRestriction ?? false,
        accessibilityFriendly: initialData?.restrictions?.accessibilityFriendly ?? false,
        safetyNotes: initialData?.restrictions?.safetyNotes || '',
      },
    },
  });

  const mockVenues = [
    { id: 1, name: 'Smart Park East Wing' },
    { id: 2, name: 'Water World Pavilion' },
  ];

  const mockZones = [
    { id: 1, name: 'Space Zone A', venueId: 1 },
    { id: 2, name: 'Tropical Paradise', venueId: 2 },
    { id: 3, name: 'Adrenaline Plaza', venueId: 1 },
    { id: 4, name: 'Fantasy Meadow', venueId: 1 },
    { id: 5, name: 'Cyber Metropolis', venueId: 1 },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="primary" fontWeight="bold">
            Basic Attraction Specs
          </Typography>
          <Divider sx={{ my: 1 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Ride Name"
                placeholder="e.g. Space Mountain"
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
                label="Ride Code"
                placeholder="e.g. RD-SPACE"
                error={!!errors.code}
                helperText={errors.code?.message || 'Uppercase alphanumeric with hyphens/underscores'}
                disabled={loading || !!initialData}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="rideCategoryId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.rideCategoryId} disabled={loading}>
                <InputLabel id="ride-cat-label">Category *</InputLabel>
                <Select {...field} labelId="ride-cat-label" label="Category *">
                  {mockRideCategories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.rideCategoryId && <FormHelperText>{errors.rideCategoryId.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="venueId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.venueId} disabled={loading}>
                <InputLabel id="ride-venue-label">Venue *</InputLabel>
                <Select {...field} labelId="ride-venue-label" label="Venue *">
                  {mockVenues.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.venueId && <FormHelperText>{errors.venueId.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="zoneId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.zoneId} disabled={loading}>
                <InputLabel id="ride-zone-label">Zone *</InputLabel>
                <Select {...field} labelId="ride-zone-label" label="Zone *">
                  {mockZones.map((z) => (
                    <MenuItem key={z.id} value={z.id}>
                      {z.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.zoneId && <FormHelperText>{errors.zoneId.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="capacity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                type="number"
                label="Hourly Capacity (Pax/Hr)"
                error={!!errors.capacity}
                helperText={errors.capacity?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="durationSeconds"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Ride Duration (Seconds)"
                error={!!errors.durationSeconds}
                helperText={errors.durationSeconds?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.status} disabled={loading}>
                <InputLabel id="ride-status-label">Operating Status *</InputLabel>
                <Select {...field} labelId="ride-status-label" label="Operating Status *">
                  <MenuItem value="OPERATING">Operating</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                  <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                  <MenuItem value="TEMPORARILY_CLOSED">Temporarily Closed</MenuItem>
                  <MenuItem value="EMERGENCY_STOP">Emergency Stop</MenuItem>
                  <MenuItem value="RESERVED">Reserved</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="operatingHours.open"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Opening Hour (HH:MM)"
                placeholder="09:00"
                error={!!errors.operatingHours?.open}
                helperText={errors.operatingHours?.open?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="operatingHours.close"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Closing Hour (HH:MM)"
                placeholder="21:00"
                error={!!errors.operatingHours?.close}
                helperText={errors.operatingHours?.close?.message}
                disabled={loading}
              />
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
                rows={3}
                label="Description"
                placeholder="Details about attraction story, special effects, etc."
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary" fontWeight="bold">
            Safety Restrictions & Exclusions
          </Typography>
          <Divider sx={{ my: 1 }} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="restrictions.minHeight"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Min Height (cm)"
                error={!!errors.restrictions?.minHeight}
                helperText={errors.restrictions?.minHeight?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="restrictions.maxHeight"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Max Height (cm)"
                error={!!errors.restrictions?.maxHeight}
                helperText={errors.restrictions?.maxHeight?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="restrictions.minAge"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Min Age (Years)"
                error={!!errors.restrictions?.minAge}
                helperText={errors.restrictions?.minAge?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="restrictions.minWeight"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Min Weight (kg)"
                error={!!errors.restrictions?.minWeight}
                helperText={errors.restrictions?.minWeight?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="restrictions.healthWarning"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="Activate Medical/Heart Warning"
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="restrictions.pregnancyRestriction"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="Pregnancy Restriction"
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="restrictions.accessibilityFriendly"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="Wheelchair/Accessibility Friendly"
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="restrictions.safetyNotes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={2}
                label="Safety & Boarding Advisory Notes"
                placeholder="e.g. Keep hands inside car at all times..."
                error={!!errors.restrictions?.safetyNotes}
                helperText={errors.restrictions?.safetyNotes?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button type="submit" variant="contained" loading={loading}>
          {initialData ? 'Update Ride Specs' : 'Register Ride'}
        </Button>
      </Box>
    </Box>
  );
};
