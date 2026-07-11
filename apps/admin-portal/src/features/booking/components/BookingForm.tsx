import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
  IconButton,
  Paper,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import { MdDelete, MdAdd, MdReceipt } from 'react-icons/md';
import { bookingSchema, BookingInput } from '../schemas/bookingSchema';
import { useGetVenuesQuery } from '../../venue/services/venueApi';
import { useGetVenueTicketTypesQuery } from '../services/bookingApi';
import { formatCurrency } from '../../analytics/utils/numberFormatters';

interface BookingFormProps {
  onSubmit: (data: BookingInput) => void;
  loading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [selectedVenueId, setSelectedVenueId] = useState<number | ''>('');

  const { data: venuesData } = useGetVenuesQuery({ page: 0, size: 100 });
  const { data: ticketTypesData, isError: ticketTypesError } = useGetVenueTicketTypesQuery(
    selectedVenueId as number,
    { skip: !selectedVenueId }
  );

  const mockCustomers = [
    { id: 1, fullName: 'John Doe', email: 'john.doe@gmail.com' },
    { id: 2, fullName: 'Jane Smith', email: 'jane.smith@yahoo.com' },
    { id: 3, fullName: 'Robert Johnson', email: 'robert.j@outlook.com' },
    { id: 4, fullName: 'Emily Davis', email: 'emily.d@gmail.com' },
  ];

  const mockTicketTypes = [
    { id: 1, name: 'Vé vào cổng phổ thông', price: 450000 },
    { id: 2, name: 'Vé VIP nhanh', price: 950000 },
    { id: 3, name: 'Vé Combo 2 ngày', price: 800000 },
    { id: 4, name: 'Thẻ Hội viên cả mùa', price: 1500000 },
  ];

  const ticketTypes = ticketTypesData || mockTicketTypes;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerId: '' as any,
      venueId: '' as any,
      visitDate: new Date().toISOString().split('T')[0],
      items: [{ ticketTypeId: '' as any, quantity: 1 }],
      visitors: [],
      paymentMethod: 'CHUYEN_KHOAN_QR',
      promotionCode: '',
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const watchVenueId = watch('venueId');
  const watchPromo = watch('promotionCode');

  useEffect(() => {
    if (watchVenueId) {
      setSelectedVenueId(watchVenueId);
    }
  }, [watchVenueId]);

  // Calculate order summary
  const subtotal = watchItems.reduce((sum, item) => {
    if (!item.ticketTypeId) return sum;
    const type = ticketTypes.find((t) => t.id === item.ticketTypeId);
    return sum + (type?.price || 0) * (item.quantity || 0);
  }, 0);

  const promoDiscount = watchPromo?.toUpperCase() === 'GATEOS10' ? subtotal * 0.1 : 0;
  const totalAmount = subtotal - promoDiscount;

  // Sync visitor form count based on ticket quantity
  const totalQuantity = watchItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  useEffect(() => {
    const currentVisitors = watch('visitors') || [];
    if (currentVisitors.length < totalQuantity) {
      const difference = totalQuantity - currentVisitors.length;
      const newVisitors = [...currentVisitors];
      for (let i = 0; i < difference; i++) {
        newVisitors.push({ fullName: '', phone: '', idCard: '' });
      }
      setValue('visitors', newVisitors);
    } else if (currentVisitors.length > totalQuantity) {
      setValue('visitors', currentVisitors.slice(0, totalQuantity));
    }
  }, [totalQuantity, setValue, watch]);

  const visitorsFields = watch('visitors') || [];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={3}>
      <Grid container spacing={3}>
        {/* Left Form side */}
        <Grid item xs={12} md={7} display="flex" flexDirection="column" gap={3}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Thông tin cơ bản đơn đặt vé
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.customerId}>
                      <InputLabel id="booking-customer-label">Khách hàng liên hệ</InputLabel>
                      <Select
                        labelId="booking-customer-label"
                        id="booking-customer"
                        {...field}
                        label="Khách hàng liên hệ"
                      >
                        {mockCustomers.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.fullName} ({c.email})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.customerId && <Typography variant="caption" color="error">{errors.customerId.message}</Typography>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="venueId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.venueId}>
                      <InputLabel id="booking-venue-label">Khu vui chơi/Địa điểm</InputLabel>
                      <Select
                        labelId="booking-venue-label"
                        id="booking-venue"
                        {...field}
                        label="Khu vui chơi/Địa điểm"
                        onChange={(e) => {
                          field.onChange(e);
                          setValue('items', [{ ticketTypeId: '' as any, quantity: 1 }]);
                        }}
                      >
                        {venuesData?.content.map((v) => (
                          <MenuItem key={v.id} value={v.id}>
                            {v.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.venueId && <Typography variant="caption" color="error">{errors.venueId.message}</Typography>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="visitDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Ngày tham quan dự kiến"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.visitDate}
                      helperText={errors.visitDate?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Ticket Items selection */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Lựa chọn Vé
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<MdAdd />}
                disabled={!selectedVenueId}
                onClick={() => appendItem({ ticketTypeId: '' as any, quantity: 1 })}
              >
                Thêm vé
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {!selectedVenueId && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Vui lòng chọn địa điểm bên trên để xem và thêm giá vé khả dụng.
              </Alert>
            )}

            {ticketTypesError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Không thể lấy danh sách loại vé cho địa điểm này. Đang hiển thị các tùy chọn chung.
              </Alert>
            )}

            <Stack spacing={2}>
              {itemFields.map((field, idx) => (
                <Box key={field.id} display="flex" gap={2} alignItems="center">
                  <Controller
                    name={`items.${idx}.ticketTypeId`}
                    control={control}
                    render={({ field: itemField }) => (
                      <FormControl size="small" sx={{ flexGrow: 1 }} error={!!errors.items?.[idx]?.ticketTypeId}>
                        <InputLabel id={`item-ticket-label-${idx}`}>Loại vé</InputLabel>
                        <Select
                          labelId={`item-ticket-label-${idx}`}
                          id={`item-ticket-${idx}`}
                          {...itemField}
                          label="Loại vé"
                        >
                          {ticketTypes.map((t) => (
                            <MenuItem key={t.id} value={t.id}>
                              {t.name} ({formatCurrency(t.price)})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />

                  <Controller
                    name={`items.${idx}.quantity`}
                    control={control}
                    render={({ field: qtyField }) => (
                      <TextField
                        {...qtyField}
                        onChange={(e) => qtyField.onChange(parseInt(e.target.value, 10) || 1)}
                        size="small"
                        label="Số lượng"
                        type="number"
                        sx={{ width: 80 }}
                      />
                    )}
                  />

                  <IconButton onClick={() => removeItem(idx)} disabled={itemFields.length === 1} color="error">
                    <MdDelete size={20} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Visitor forms */}
          {visitorsFields.length > 0 && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Thông tin chi tiết thẻ khách tham quan
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2.5}>
                {visitorsFields.map((_, idx) => (
                  <Box key={idx} p={2} sx={{ bgcolor: 'action.hover', borderRadius: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
                      Khách tham quan #{idx + 1}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`visitors.${idx}.fullName`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              label="Họ và tên"
                              error={!!errors.visitors?.[idx]?.fullName}
                              helperText={errors.visitors?.[idx]?.fullName?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`visitors.${idx}.phone`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              label="Số điện thoại (Tùy chọn)"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`visitors.${idx}.idCard`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              label="CCCD / Hộ chiếu (Tùy chọn)"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}
        </Grid>

        {/* Right Pricing Summary side */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 24 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
              <MdReceipt /> Tóm tắt đơn hàng
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              {watchItems.map((item, idx) => {
                if (!item.ticketTypeId) return null;
                const type = ticketTypes.find((t) => t.id === item.ticketTypeId);
                if (!type) return null;
                return (
                  <Box key={idx} display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {type.name} x {item.quantity}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(type.price * (item.quantity || 0))}
                    </Typography>
                  </Box>
                );
              })}

              <Divider />

              <Controller
                name="promotionCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Mã khuyến mãi (Ví dụ: GATEOS10)"
                    placeholder="Nhập mã..."
                  />
                )}
              />

              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel id="payment-method-label">Phương thức thanh toán</InputLabel>
                    <Select
                      labelId="payment-method-label"
                      id="payment-method"
                      {...field}
                      label="Phương thức thanh toán"
                    >
                      <MenuItem value="CHUYEN_KHOAN_QR">Chuyển khoản ngân hàng qua QR</MenuItem>
                      <MenuItem value="TIEN_MAT">Tiền mặt tại quầy</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight="bold">Tạm tính</Typography>
                <Typography variant="body1" fontWeight="bold">{formatCurrency(subtotal)}</Typography>
              </Box>
              
              {promoDiscount > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="success.main">Khuyến mãi giảm giá 10%</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">-{formatCurrency(promoDiscount)}</Typography>
                </Box>
              )}

              <Box display="flex" justifyContent="space-between" pt={1}>
                <Typography variant="h6" fontWeight="bold">Tổng tiền</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {formatCurrency(totalAmount)}
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || subtotal === 0}
                sx={{ mt: 2 }}
              >
                {loading ? 'Đang tạo đơn đặt vé...' : 'Tạo đơn bán hàng'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
