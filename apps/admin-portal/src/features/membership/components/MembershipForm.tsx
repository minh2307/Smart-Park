import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  membershipTierSchema,
  membershipSchema,
  MembershipTierFormValues,
  MembershipFormValues,
} from '../schemas/membershipSchema';
import { Membership, MembershipTier } from '../types';

// ==========================================
// MEMBERSHIP TIER CONFIGURATION FORM
// ==========================================
interface MembershipTierFormProps {
  initialValues?: MembershipTier;
  onSubmit: (values: MembershipTierFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const MembershipTierForm: React.FC<MembershipTierFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const defaultValues: MembershipTierFormValues = initialValues
    ? {
        name: initialValues.name,
        code: initialValues.code,
        discountPercentage: Number(initialValues.discountPercentage),
        pointsMultiplier: Number(initialValues.pointsMultiplier),
        minSpend: Number(initialValues.minSpend),
        status: initialValues.status,
        applicableTicketTypes: initialValues.applicableTicketTypes,
        applicableVenues: initialValues.applicableVenues,
        applicableAttractions: initialValues.applicableAttractions,
        benefits: {
          ticketDiscount: Number(initialValues.benefits.ticketDiscount),
          foodDiscount: Number(initialValues.benefits.foodDiscount),
          shopDiscount: Number(initialValues.benefits.shopDiscount),
          parkingDiscount: Number(initialValues.benefits.parkingDiscount),
          lockerDiscount: Number(initialValues.benefits.lockerDiscount),
          priorityQueue: initialValues.benefits.priorityQueue,
          fastPass: initialValues.benefits.fastPass,
          birthdayGift: initialValues.benefits.birthdayGift,
          vipLoungeAccess: initialValues.benefits.vipLoungeAccess,
          freeParking: initialValues.benefits.freeParking,
          freeLocker: initialValues.benefits.freeLocker,
          earlyParkEntry: initialValues.benefits.earlyParkEntry,
        },
        pointRules: {
          upgradeThreshold: Number(initialValues.pointRules.upgradeThreshold),
          downgradeThreshold: Number(initialValues.pointRules.downgradeThreshold),
          expirationMonths: Number(initialValues.pointRules.expirationMonths),
          renewalPoints: Number(initialValues.pointRules.renewalPoints),
        },
      }
    : {
        name: '',
        code: '',
        discountPercentage: 0,
        pointsMultiplier: 1.0,
        minSpend: 0,
        status: 'ACTIVE',
        applicableTicketTypes: ['Standard Admission'],
        applicableVenues: ['Adventure Park'],
        applicableAttractions: ['Colossus Coaster'],
        benefits: {
          ticketDiscount: 0,
          foodDiscount: 0,
          shopDiscount: 0,
          parkingDiscount: 0,
          lockerDiscount: 0,
          priorityQueue: false,
          fastPass: false,
          birthdayGift: false,
          vipLoungeAccess: false,
          freeParking: false,
          freeLocker: false,
          earlyParkEntry: false,
        },
        pointRules: {
          upgradeThreshold: 1000,
          downgradeThreshold: 0,
          expirationMonths: 12,
          renewalPoints: 100,
        },
      };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MembershipTierFormValues>({
    resolver: zodResolver(membershipTierSchema),
    defaultValues,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Tier Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
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
                label="Tier Code (uppercase)"
                fullWidth
                disabled={!!initialValues}
                error={!!errors.code}
                helperText={errors.code?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="discountPercentage"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Discount Percentage"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.discountPercentage}
                helperText={errors.discountPercentage?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Controller
            name="pointsMultiplier"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Points Multiplier"
                fullWidth
                inputProps={{ step: 0.05 }}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.pointsMultiplier}
                helperText={errors.pointsMultiplier?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Controller
            name="minSpend"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Minimum Spend ($)"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.minSpend}
                helperText={errors.minSpend?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Point Progression & Rules
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="pointRules.upgradeThreshold"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Upgrade Point Threshold"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.pointRules?.upgradeThreshold}
                helperText={errors.pointRules?.upgradeThreshold?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="pointRules.downgradeThreshold"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Downgrade Point Threshold"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.pointRules?.downgradeThreshold}
                helperText={errors.pointRules?.downgradeThreshold?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="pointRules.expirationMonths"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Point Expiration Period (Months)"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.pointRules?.expirationMonths}
                helperText={errors.pointRules?.expirationMonths?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="pointRules.renewalPoints"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Renewal Bonus Points"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.pointRules?.renewalPoints}
                helperText={errors.pointRules?.renewalPoints?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Configure Benefit Privileges
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="benefits.ticketDiscount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Ticket Discount %"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="benefits.foodDiscount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="F&B Discount %"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="benefits.shopDiscount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Shop Discount %"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="benefits.parkingDiscount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Parking Discount %"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="benefits.priorityQueue"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="Priority Queue Access"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="benefits.fastPass"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="Fast Pass Privileges"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="benefits.vipLoungeAccess"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="VIP Lounge Access"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="benefits.freeParking"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="Free Parking"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="benefits.freeLocker"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="Free Locker Rental"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="benefits.earlyParkEntry"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="Early Park Entry"
              />
            )}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 4 }}>
        <Button onClick={onCancel} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
          {initialValues ? 'Save Changes' : 'Create Tier'}
        </Button>
      </Box>
    </Box>
  );
};

// ==========================================
// CUSTOMER MEMBERSHIP FORM
// ==========================================
interface MembershipFormProps {
  initialValues?: Membership;
  tiers: MembershipTier[];
  onSubmit: (values: MembershipFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const MembershipForm: React.FC<MembershipFormProps> = ({
  initialValues,
  tiers,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const defaultValues: MembershipFormValues = initialValues
    ? {
        customerId: initialValues.customerId,
        customerName: initialValues.customerName,
        customerEmail: initialValues.customerEmail,
        customerPhone: initialValues.customerPhone,
        tierId: initialValues.tierId,
        membershipCode: initialValues.membershipCode,
        points: initialValues.points,
        joinDate: initialValues.joinDate,
        expirationDate: initialValues.expirationDate || '',
        status: initialValues.status,
      }
    : {
        customerId: 1,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        tierId: tiers[0]?.id || 1,
        membershipCode: '',
        points: 0,
        joinDate: new Date().toISOString().split('T')[0],
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'ACTIVE',
      };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="customerName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Customer Full Name"
                fullWidth
                error={!!errors.customerName}
                helperText={errors.customerName?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="membershipCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Membership Code"
                fullWidth
                error={!!errors.membershipCode}
                helperText={errors.membershipCode?.message || 'Unique code identifying member card'}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="customerEmail"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email Address"
                fullWidth
                error={!!errors.customerEmail}
                helperText={errors.customerEmail?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="customerPhone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Phone Number"
                fullWidth
                error={!!errors.customerPhone}
                helperText={errors.customerPhone?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="tierId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Membership Tier"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.tierId}
                helperText={errors.tierId?.message}
              >
                {tiers.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} (Discount: {t.discountPercentage}%)
                  </MenuItem>
                ))}
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
                label="Loyalty Points Balance"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.points}
                helperText={errors.points?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="joinDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="Join Date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.joinDate}
                helperText={errors.joinDate?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="expirationDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="Expiration Date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.expirationDate}
                helperText={errors.expirationDate?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Status"
                fullWidth
                error={!!errors.status}
                helperText={errors.status?.message}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="EXPIRED">Expired</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
              </TextField>
            )}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 4 }}>
        <Button onClick={onCancel} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
          {initialValues ? 'Save Changes' : 'Assign Membership'}
        </Button>
      </Box>
    </Box>
  );
};
