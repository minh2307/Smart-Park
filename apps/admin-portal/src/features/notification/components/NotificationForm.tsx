import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { NotificationItem, NotificationChannel, NotificationPriority, RecipientType, NotificationStatus } from '../types';

interface NotificationFormProps {
  initialValues?: Partial<NotificationItem>;
  onSubmit: (values: Partial<NotificationItem>) => void;
  onCancel: () => void;
}

export const NotificationForm: React.FC<NotificationFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialValues.title || '');
  const [message, setMessage] = useState(initialValues.message || '');
  const [channel, setChannel] = useState<NotificationChannel>(initialValues.channel || 'IN_APP');
  const [priority, setPriority] = useState<NotificationPriority>(initialValues.priority || 'NORMAL');
  const [recipientType, setRecipientType] = useState<RecipientType>(initialValues.recipientType || 'ALL_USERS');
  const [deepLink, setDeepLink] = useState(initialValues.deepLink || '');
  const [actionButtonText, setActionButtonText] = useState(initialValues.actionButtonText || '');
  const [scheduled, setScheduled] = useState(!!initialValues.scheduledTime);
  const [scheduledTime, setScheduledTime] = useState(
    initialValues.scheduledTime
      ? new Date(initialValues.scheduledTime).toISOString().slice(0, 16)
      : new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề thông báo.';
    if (!message.trim()) newErrors.message = 'Vui lòng nhập nội dung thông báo.';
    if (scheduled && !scheduledTime) newErrors.scheduledTime = 'Vui lòng chọn thời gian gửi.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const status: NotificationStatus = scheduled ? 'SCHEDULED' : 'SENT';

    onSubmit({
      title,
      message,
      channel,
      priority,
      recipientType,
      status,
      scheduledTime: scheduled ? new Date(scheduledTime).toISOString() : undefined,
      deepLink: deepLink || undefined,
      actionButtonText: actionButtonText || undefined,
    });
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ p: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Tiêu đề thông báo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            error={!!errors.title}
            helperText={errors.title}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Nội dung thông báo"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            multiline
            rows={4}
            error={!!errors.message}
            helperText={errors.message}
            required
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Kênh phân phối</InputLabel>
            <Select
              value={channel}
              label="Kênh phân phối"
              onChange={(e) => setChannel(e.target.value as NotificationChannel)}
            >
              <MenuItem value="IN_APP">In-App Notification</MenuItem>
              <MenuItem value="EMAIL">Email SMTP</MenuItem>
              <MenuItem value="SMS">SMS Gateway</MenuItem>
              <MenuItem value="PUSH">Push (Firebase FCM)</MenuItem>
              <MenuItem value="WEB">Web Browser Push</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Mức độ ưu tiên</InputLabel>
            <Select
              value={priority}
              label="Mức độ ưu tiên"
              onChange={(e) => setPriority(e.target.value as NotificationPriority)}
            >
              <MenuItem value="LOW">Low (Thấp)</MenuItem>
              <MenuItem value="NORMAL">Normal (Bình thường)</MenuItem>
              <MenuItem value="HIGH">High (Cao)</MenuItem>
              <MenuItem value="CRITICAL">Critical (Khẩn cấp)</MenuItem>
              <MenuItem value="EMERGENCY">Emergency (Nhiệm vụ đặc biệt)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Đối tượng nhận tin</InputLabel>
            <Select
              value={recipientType}
              label="Đối tượng nhận tin"
              onChange={(e) => setRecipientType(e.target.value as RecipientType)}
            >
              <MenuItem value="ALL_USERS">Tất cả người dùng</MenuItem>
              <MenuItem value="CUSTOMERS">Khách mua vé</MenuItem>
              <MenuItem value="MEMBERS">Hội viên thường</MenuItem>
              <MenuItem value="VIP_MEMBERS">Hội viên VIP (Gold/Diamond)</MenuItem>
              <MenuItem value="VISITORS">Khách du lịch vãng lai</MenuItem>
              <MenuItem value="STAFF">Nhân viên vận hành</MenuItem>
              <MenuItem value="OPERATORS">Điều hành thiết bị</MenuItem>
              <MenuItem value="MANAGERS">Quản lý khu vực</MenuItem>
              <MenuItem value="ADMINS">Ban Quản Trị</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Đường dẫn sâu (Deep Link URL)"
            value={deepLink}
            onChange={(e) => setDeepLink(e.target.value)}
            fullWidth
            placeholder="e.g. /promotions/waterpark-50"
            helperText="Đường dẫn điều hướng khách hàng khi click vào thông báo."
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Nhãn nút hành động (Action Button)"
            value={actionButtonText}
            onChange={(e) => setActionButtonText(e.target.value)}
            fullWidth
            placeholder="e.g. Xem ngay"
            helperText="Hiển thị nhãn trên nút bấm đi kèm của thông báo."
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={scheduled}
                onChange={(e) => setScheduled(e.target.checked)}
                color="primary"
              />
            }
            label="Lập lịch gửi tự động (Scheduled Delivery)"
          />
        </Grid>

        {scheduled && (
          <Grid item xs={12} sm={6}>
            <TextField
              label="Thời gian phát hành thông báo"
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.scheduledTime}
              helperText={errors.scheduledTime}
              required
            />
          </Grid>
        )}

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {scheduled ? 'Lập Lịch Gửi' : 'Gửi Ngay'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
