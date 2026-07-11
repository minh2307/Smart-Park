import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Box,
} from '@mui/material';
import { Button } from '../../../components/common/Button';
import { visitorFormSchema, VisitorFormInput } from '../schemas/visitorSchema';
import { Visitor } from '../types';
import { mockCustomers } from '../../customer/services/customerApi';

interface VisitorFormProps {
  initialData?: Visitor | null;
  onSubmit: (data: VisitorFormInput) => void;
  loading?: boolean;
}

export const VisitorForm: React.FC<VisitorFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitorFormInput>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      customerId: initialData?.customerId || '',
      fullName: initialData?.fullName || '',
      age: initialData?.age || 0,
      gender: initialData?.gender || 'MALE',
      nationality: initialData?.nationality || '',
      identificationNumber: initialData?.identificationNumber || '',
      relationship: initialData?.relationship || 'SELF',
      emergencyContactName: initialData?.emergencyContactName || '',
      emergencyContactPhone: initialData?.emergencyContactPhone || '',
      medicalNotes: initialData?.medicalNotes || '',
      status: initialData?.status || 'ACTIVE',
    } as any,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.customerId}>
            <InputLabel id="customer-owner-label">Owner Customer Account *</InputLabel>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="customer-owner-label"
                  label="Owner Customer Account *"
                  disabled={!!initialData} // Lock customer association on edit
                >
                  {mockCustomers.map((cust) => (
                    <MenuItem key={cust.id} value={cust.id}>
                      {cust.fullName} (CUST-{String(cust.id).padStart(4, '0')})
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.customerId && <FormHelperText>{errors.customerId.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Visitor Full Name *"
                fullWidth
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Age *"
                fullWidth
                error={!!errors.age}
                helperText={errors.age?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={!!errors.gender}>
            <InputLabel id="visitor-gender-label">Gender *</InputLabel>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="visitor-gender-label" label="Gender *">
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              )}
            />
            {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={!!errors.relationship}>
            <InputLabel id="relationship-label">Relationship to Customer *</InputLabel>
            <Controller
              name="relationship"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="relationship-label" label="Relationship to Customer *">
                  <MenuItem value="SELF">Self</MenuItem>
                  <MenuItem value="SPOUSE">Spouse</MenuItem>
                  <MenuItem value="CHILD">Child</MenuItem>
                  <MenuItem value="PARENT">Parent</MenuItem>
                  <MenuItem value="FRIEND">Friend</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              )}
            />
            {errors.relationship && <FormHelperText>{errors.relationship.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="nationality"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nationality *"
                fullWidth
                error={!!errors.nationality}
                helperText={errors.nationality?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="identificationNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Identification Number (ID / Passport) *"
                fullWidth
                error={!!errors.identificationNumber}
                helperText={errors.identificationNumber?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="emergencyContactName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Emergency Contact Name"
                fullWidth
                error={!!errors.emergencyContactName}
                helperText={errors.emergencyContactName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="emergencyContactPhone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Emergency Contact Phone"
                fullWidth
                error={!!errors.emergencyContactPhone}
                helperText={errors.emergencyContactPhone?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="medicalNotes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Special Medical Notes / Allergies / Assistance Request"
                fullWidth
                multiline
                rows={3}
                error={!!errors.medicalNotes}
                helperText={errors.medicalNotes?.message}
                placeholder="List food allergies, physical constraints, or medical alerts..."
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id="visitor-status-label">Status</InputLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="visitor-status-label" label="Status">
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        <Button type="submit" variant="contained" loading={loading}>
          {initialData ? 'Save Changes' : 'Register Visitor'}
        </Button>
      </Box>
    </Box>
  );
};
