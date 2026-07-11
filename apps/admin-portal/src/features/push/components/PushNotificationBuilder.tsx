import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { PushNotificationConfig } from '../types';

interface PushNotificationBuilderProps {
  configs: PushNotificationConfig[];
  onSend: (values: Partial<PushNotificationConfig>) => void;
}

export const PushNotificationBuilder: React.FC<PushNotificationBuilderProps> = ({
  configs,
  onSend,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [actionButtonText, setActionButtonText] = useState('');
  const [isSilent, setIsSilent] = useState(false);
  const [topic, setTopic] = useState('all-users');
  const [targetGroup, setTargetGroup] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!isSilent && !title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề thông báo.';
    if (!isSilent && !body.trim()) newErrors.body = 'Vui lòng nhập nội dung thông báo.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSend({
      title: isSilent ? 'Silent Sync' : title,
      body: isSilent ? 'Background packet data' : body,
      imageUrl: imageUrl || undefined,
      deepLink: deepLink || undefined,
      actionButtonText: actionButtonText || undefined,
      isSilent,
      topic: topic || undefined,
      targetGroup: targetGroup || undefined,
    });

    // Reset
    setTitle('');
    setBody('');
    setImageUrl('');
    setDeepLink('');
    setActionButtonText('');
    setIsSilent(false);
    setTopic('all-users');
    setTargetGroup('');
  };

  return (
    <Grid container spacing={3}>
      {/* Sender form */}
      <Grid item xs={12} md={7}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Thiết Kế Chiến Dịch Đẩy Tin Nhắn FCM (Firebase)
            </Typography>

            <Box component="form" onSubmit={handleSend}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isSilent}
                        onChange={(e) => setIsSilent(e.target.checked)}
                        color="warning"
                      />
                    }
                    label="Gửi dạng âm thầm (Silent Push / Background Sync)"
                  />
                </Grid>

                {!isSilent && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        label="Tiêu đề hiển thị (Push Title)"
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
                        label="Nội dung tóm tắt (Push Body)"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.body}
                        helperText={errors.body}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Đường dẫn ảnh đính kèm (Image URL)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        fullWidth
                        placeholder="e.g. https://picsum.photos/seed/promo/300/200"
                        helperText="Ảnh hiển thị thu nhỏ hoặc khi kéo rộng tin nhắn đẩy trên điện thoại."
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Đường dẫn sâu điều hướng (Deep Link)"
                        value={deepLink}
                        onChange={(e) => setDeepLink(e.target.value)}
                        fullWidth
                        placeholder="e.g. /promotions/waterpark-50"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Nhãn nút hành động (Button Label)"
                        value={actionButtonText}
                        onChange={(e) => setActionButtonText(e.target.value)}
                        fullWidth
                        placeholder="e.g. Nhận Ngay"
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Firebase Topic (Kênh đăng ký)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    fullWidth
                    placeholder="e.g. all-users, members"
                    disabled={!!targetGroup}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nhóm thiết bị mục tiêu (FCM Device Group)"
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    fullWidth
                    placeholder="e.g. staff-devices"
                    disabled={!!topic}
                  />
                </Grid>

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button type="submit" variant="contained" color="warning" size="large">
                    Phát Hàng Push Ngay
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Simulator view */}
      <Grid item xs={12} md={5}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, alignSelf: 'flex-start' }}>
            Mô Phỏng Tin Nhắn Trên Khóa Màn Hình
          </Typography>

          {/* iPhone style notification box */}
          <Box
            sx={{
              width: '280px',
              height: '460px',
              border: '12px solid #1e293b',
              borderRadius: '36px',
              backgroundImage: 'url(https://picsum.photos/seed/phonebg/300/600)',
              backgroundSize: 'cover',
              position: 'relative',
              boxShadow: 8,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 2,
            }}
          >
            {/* Clock */}
            <Box sx={{ alignSelf: 'center', color: '#fff', textAlign: 'center', mt: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 300 }}>09:41</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Thứ Năm, 9 tháng 7</Typography>
            </Box>

            {/* Notification Banner */}
            {!isSilent && (title || body) && (
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  p: 1.5,
                  boxShadow: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: '16px', height: '16px', borderRadius: '4px', bgcolor: 'warning.main' }} />
                  <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#475569' }}>GATEOS</Typography>
                  <Typography sx={{ fontSize: '9px', color: '#94a3b8', ml: 'auto' }}>bây giờ</Typography>
                </Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{title || 'Tiêu đề'}</Typography>
                <Typography sx={{ fontSize: '10px', color: '#475569', lineHeight: 1.3 }}>{body || 'Nội dung thông báo đẩy...'}</Typography>

                {imageUrl && (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt="attachment"
                    sx={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', mt: 1 }}
                  />
                )}
              </Box>
            )}

            {isSilent && (
              <Box
                sx={{
                  bgcolor: 'rgba(30, 41, 59, 0.85)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  p: 1.5,
                  boxShadow: 2,
                  color: '#fff',
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '10px', fontWeight: 600 }}>[Silent Synchronization Active]</Typography>
                <Typography sx={{ fontSize: '9px', opacity: 0.8 }}>Gói đồng bộ dữ liệu ngầm được gửi tới thiết bị ngoại vi.</Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Grid>

      {/* History table */}
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Nhật Ký Các Đợt Gửi Push Gần Nhất
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Mã</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tiêu Đề / Gói Dữ Liệu</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Kênh Nhận</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hình Thức</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Thiết Bị Đã Nhận</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tỷ Lệ Mở (Click-Rate)</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Thời Gian Gửi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configs.map((config) => {
                    const ctr = config.sentCount > 0 ? ((config.clickCount / config.sentCount) * 100).toFixed(1) : '0.0';
                    return (
                      <TableRow key={config.id} hover>
                        <TableCell>#{config.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {config.title}
                          </Typography>
                          {config.deepLink && (
                            <Typography variant="caption" color="primary">
                              Link: {config.deepLink}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{config.topic ? `Topic: ${config.topic}` : `Group: ${config.targetGroup}`}</TableCell>
                        <TableCell>
                          {config.isSilent ? (
                            <Chip label="Silent Push" size="small" color="warning" />
                          ) : (
                            <Chip label="Alert Notification" size="small" color="primary" />
                          )}
                        </TableCell>
                        <TableCell>{config.sentCount} thiết bị</TableCell>
                        <TableCell>
                          {config.isSilent ? (
                            'N/A'
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                              {ctr}% ({config.clickCount} clicks)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{new Date(config.sentAt || '').toLocaleString('vi-VN')}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
