import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Stack,
  Button,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import SettingsIcon from '@mui/icons-material/Settings';
import type { UserPreferences } from '../types/profile.types';

interface PreferenceCardProps {
  preferences: UserPreferences;
  onSave: (preferences: Partial<UserPreferences>) => void;
}

export const PreferenceCard: React.FC<PreferenceCardProps> = ({ preferences, onSave }) => {
  const [lang, setLang] = React.useState(preferences.language);
  const [themeVal, setThemeVal] = React.useState(preferences.theme);
  const [park, setPark] = React.useState(preferences.preferredPark);
  const [comm, setComm] = React.useState(preferences.preferredCommunication);

  const handleSave = () => {
    onSave({
      language: lang,
      theme: themeVal,
      preferredPark: park,
      preferredCommunication: comm,
    });
  };

  return (
    <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
          Tùy Chọn Tài Khoản
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Ngôn ngữ hiển thị"
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.02)' } }}
            >
              <MenuItem value="vi">Tiếng Việt</MenuItem>
              <MenuItem value="en">English (Mỹ)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Giao diện hiển thị"
              value={themeVal}
              onChange={(e) => setThemeVal(e.target.value as any)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.02)' } }}
            >
              <MenuItem value="dark">Chế độ tối (Dark Mode)</MenuItem>
              <MenuItem value="light">Chế độ sáng (Light Mode)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Công viên yêu thích"
              value={park}
              onChange={(e) => setPark(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.02)' } }}
            >
              <MenuItem value="Smart Park Grand">Smart Park Grand (Hà Nội)</MenuItem>
              <MenuItem value="Smart Park Safari">Smart Park Safari (Phú Quốc)</MenuItem>
              <MenuItem value="Smart Park Ocean">Smart Park Ocean (Nha Trang)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Kênh liên hệ ưu tiên"
              value={comm}
              onChange={(e) => setComm(e.target.value as any)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.02)' } }}
            >
              <MenuItem value="EMAIL">Thư điện tử (Email)</MenuItem>
              <MenuItem value="SMS">Tin nhắn di động (SMS)</MenuItem>
              <MenuItem value="PUSH">Thông báo đẩy (Push notification)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              startIcon={<SettingsIcon />}
              sx={{
                bgcolor: '#2dd4bf',
                color: '#0f172a',
                fontWeight: 'bold',
                px: 4,
                py: 1.2,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#14b8a6',
                },
              }}
            >
              Lưu cấu hình
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default PreferenceCard;
