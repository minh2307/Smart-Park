import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';

interface DiscountRuleBuilderProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  watchPromotionType: string;
  watchDiscountType: string;
}

export const DiscountRuleBuilder: React.FC<DiscountRuleBuilderProps> = ({
  register,
  setValue,
  errors,
  watchPromotionType,
  watchDiscountType,
}) => {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Cau hinh quy tac giam gia
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            {...register('promotionType')}
            label="Loai khuyen mai *"
            fullWidth
            defaultValue="DISCOUNT"
            onChange={(e) => setValue('promotionType', e.target.value)}
            error={!!errors.promotionType}
            helperText={errors.promotionType?.message as string}
          >
            <MenuItem value="DISCOUNT">Giam gia truc tiep (Discount)</MenuItem>
            <MenuItem value="BOGO">Mua 1 Tang 1 (BOGO)</MenuItem>
            <MenuItem value="COMBO">Giam gia theo Combo (Combo)</MenuItem>
            <MenuItem value="FLASH_SALE">Giam gia chong mat (Flash Sale)</MenuItem>
            <MenuItem value="EARLY_BIRD">Giam gia dat som (Early Bird)</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            {...register('discountType')}
            label="Kieu giam gia *"
            fullWidth
            defaultValue="PERCENTAGE"
            onChange={(e) => setValue('discountType', e.target.value)}
            error={!!errors.discountType}
            helperText={errors.discountType?.message as string}
            disabled={watchPromotionType === 'BOGO'}
          >
            <MenuItem value="PERCENTAGE">Ti le phan tram (%)</MenuItem>
            <MenuItem value="FIXED_AMOUNT">So tien co dinh (USD)</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            {...register('discountValue', { valueAsNumber: true })}
            label={watchDiscountType === 'PERCENTAGE' ? 'Gia tri giam (%) *' : 'Gia tri giam (USD) *'}
            type="number"
            fullWidth
            error={!!errors.discountValue}
            helperText={errors.discountValue?.message as string}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            {...register('maxDiscount', { valueAsNumber: true })}
            label="Giam gia toi da (USD)"
            type="number"
            fullWidth
            placeholder="Khong gioi han"
            error={!!errors.maxDiscount}
            helperText={errors.maxDiscount?.message as string}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            {...register('minOrderAmount', { valueAsNumber: true })}
            label="Gia tri don hang toi thieu (USD)"
            type="number"
            fullWidth
            placeholder="Khong yeu cau"
            error={!!errors.minOrderAmount}
            helperText={errors.minOrderAmount?.message as string}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('maxUsage', { valueAsNumber: true })}
            label="Gioi han su dung toi da"
            type="number"
            fullWidth
            placeholder="Khong gioi han"
            error={!!errors.maxUsage}
            helperText={errors.maxUsage?.message as string}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('usagePerCustomer', { valueAsNumber: true })}
            label="Gioi han su dung tren moi khach hang"
            type="number"
            fullWidth
            placeholder="Khong gioi han"
            error={!!errors.usagePerCustomer}
            helperText={errors.usagePerCustomer?.message as string}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('priority', { valueAsNumber: true })}
            label="Do uu tien"
            type="number"
            fullWidth
            error={!!errors.priority}
            helperText={errors.priority?.message as string}
          />
        </Grid>
        <Grid item xs={12} sm={6} display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                {...register('stackable')}
                defaultChecked={false}
              />
            }
            label="Cho phep cong don giam gia"
          />
        </Grid>
      </Grid>
    </Box>
  );
};
export default DiscountRuleBuilder;
