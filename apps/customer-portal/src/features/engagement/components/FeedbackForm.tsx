import { logger } from '../../../services/logger';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  FormHelperText,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { RatingStars } from './RatingStars';
import { feedbackSchema, FeedbackFormValues } from '../schemas/engagement.schema';
import { useSubmitFeedbackMutation } from '../services/engagementApi';
import { useAppSelector } from '../../../store/hooks';
import { toast } from 'react-toastify';

export const FeedbackForm: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const customerId = user?.id || 0;

  const [submitFeedback, { isLoading, error }] = useSubmitFeedbackMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: 'RIDE',
      content: '',
      rating: 5,
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    if (!customerId) {
      toast.error('Vui lòng đăng nhập để gửi phản hồi.');
      return;
    }

    try {
      await submitFeedback({
        customer: { id: customerId },
        category: data.category,
        content: data.content,
        rating: data.rating,
      }).unwrap();

      toast.success('Gửi phản hồi thành công! Cảm ơn ý kiến đóng góp của bạn.');
      reset();
    } catch (err) {
      logger.error('Submit feedback failed:', err);
      toast.error('Gửi phản hồi thất bại. Vui lòng thử lại sau.');
    }
  };

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
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 800,
          color: '#ffffff',
          mb: 3,
        }}
      >
        Gửi ý kiến đóng góp & Đánh giá dịch vụ
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
          Đã xảy ra lỗi khi gửi phản hồi. Vui lòng kiểm tra lại kết nối.
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Rating Picker */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1, fontWeight: 700 }}
          >
            Đánh giá của bạn *
          </Typography>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <RatingStars value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.rating && (
            <FormHelperText error sx={{ mt: 0.5, fontWeight: 600 }}>
              {errors.rating.message}
            </FormHelperText>
          )}
        </Box>

        {/* Category Choice */}
        <TextField
          select
          label="Danh mục phản hồi *"
          {...register('category')}
          error={!!errors.category}
          helperText={errors.category?.message}
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
          <MenuItem value="RIDE">Trò chơi & Attraction</MenuItem>
          <MenuItem value="FOOD">Ẩm thực & Nhà hàng</MenuItem>
          <MenuItem value="STAFF">Thái độ phục vụ của nhân viên</MenuItem>
          <MenuItem value="FACILITY">Cơ sở vật chất & Vệ sinh</MenuItem>
          <MenuItem value="SAFETY">An toàn & Bảo mật</MenuItem>
          <MenuItem value="OTHER">Chủ đề khác</MenuItem>
        </TextField>

        {/* Content Field */}
        <TextField
          multiline
          rows={5}
          label="Nội dung phản hồi chi tiết *"
          placeholder="Chia sẻ trải nghiệm thực tế của bạn tại công viên..."
          {...register('content')}
          error={!!errors.content}
          helperText={errors.content?.message}
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

        {/* Submit button */}
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          startIcon={<SendIcon />}
          sx={{
            py: 1.5,
            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            color: '#0f172a',
            fontWeight: 800,
            textTransform: 'none',
            fontSize: '0.95rem',
            borderRadius: 2.5,
            boxShadow: '0 4px 14px rgba(45,212,191,0.2)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(45,212,191,0.35)',
              background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            },
            '&:active': { transform: 'scale(0.98)' },
            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {isLoading ? 'Dang gui...' : 'Gui danh gia'}
        </Button>
      </Stack>
    </Box>
  );
};
