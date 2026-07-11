import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import type { PrivacySettings as PrivacySettingsType } from '../types/profile.types';

interface PrivacySettingsProps {
  settings: PrivacySettingsType;
  onUpdate: (settings: Partial<PrivacySettingsType>) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ settings, onUpdate }) => {
  const handleVisibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ profileVisibility: e.target.value as any });
  };

  const handleToggle = (key: keyof PrivacySettingsType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ [key]: e.target.checked });
  };

  return (
    <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
          Cấu Hình Quyền Riêng Tư
        </Typography>

        <Stack spacing={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ color: '#2dd4bf', fontWeight: 'bold', mb: 1.5 }}>
              Chế độ hiển thị hồ sơ
            </FormLabel>
            <RadioGroup
              value={settings.profileVisibility}
              onChange={handleVisibilityChange}
            >
              <FormControlLabel
                value="PRIVATE"
                control={<Radio />}
                label="Chế độ riêng tư (Chỉ hệ thống và bạn nhìn thấy thông tin của mình)"
              />
              <FormControlLabel
                value="PUBLIC"
                control={<Radio />}
                label="Chế độ công khai (Cho phép hiển thị tên viết tắt trên bảng xếp hạng VIP)"
              />
            </RadioGroup>
          </FormControl>

          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ color: '#2dd4bf', fontWeight: 'bold' }}>
              Quyền chia sẻ dữ liệu
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shareVisitHistory}
                  onChange={handleToggle('shareVisitHistory')}
                  color="primary"
                />
              }
              label="Đồng ý lưu trữ lịch sử ra vào và tham quan các địa điểm để tối ưu hóa gợi ý trò chơi"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.receivePartnerOffers}
                  onChange={handleToggle('receivePartnerOffers')}
                  color="primary"
                />
              }
              label="Đồng ý nhận các chương trình ưu đãi liên kết từ đối tác của Smart Park"
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
export default PrivacySettings;
