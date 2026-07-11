import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
  Divider,
  Grid,
} from '@mui/material';
import type { NotificationPreferences } from '../types/profile.types';

interface NotificationSettingsProps {
  settings: NotificationPreferences;
  onUpdate: (settings: Partial<NotificationPreferences>) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ settings, onUpdate }) => {
  const handleChange = (key: keyof NotificationPreferences) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ [key]: e.target.checked });
  };

  return (
    <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
          Cấu Hình Nhận Thông Báo
        </Typography>

        <Grid container spacing={4}>
          {/* Channels */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#2dd4bf' }}>
              Kênh Nhận Tin
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleChange('emailNotifications')}
                    color="primary"
                  />
                }
                label="Thông báo qua thư điện tử (Email)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={handleChange('smsNotifications')}
                    color="primary"
                  />
                }
                label="Thông báo qua tin nhắn di động (SMS)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={handleChange('pushNotifications')}
                    color="primary"
                  />
                }
                label="Thông báo đẩy trên thiết bị di động (Push)"
              />
            </Stack>
          </Grid>

          {/* Categories */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#2dd4bf' }}>
              Nhóm Tin Cụ Thể
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.promotionalNotifications}
                    onChange={handleChange('promotionalNotifications')}
                    color="primary"
                  />
                }
                label="Chương trình ưu đãi, sự kiện & Voucher mới"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.membershipNotifications}
                    onChange={handleChange('membershipNotifications')}
                    color="primary"
                  />
                }
                label="Thông tin tài khoản hạng thẻ & Điểm thưởng"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.bookingNotifications}
                    onChange={handleChange('bookingNotifications')}
                    color="primary"
                  />
                }
                label="Xác nhận đặt vé, lịch trình tham quan & Hóa đơn"
              />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default NotificationSettings;
