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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Announcement, AnnouncementStatus } from '../types';
import { RecipientType } from '../../notification/types';

interface AnnouncementFormProps {
  initialValues?: Partial<Announcement>;
  onSubmit: (values: Partial<Announcement>) => void;
  onCancel: () => void;
  venues: { id: number; venueName: string }[];
  rides: { id: number; rideName: string }[];
}

export const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  venues,
  rides,
}) => {
  const [title, setTitle] = useState(initialValues.title || '');
  const [content, setContent] = useState(initialValues.content || '');
  const [status, setStatus] = useState<AnnouncementStatus>(initialValues.status || 'DRAFT');
  const [isPinned, setIsPinned] = useState(initialValues.isPinned || false);
  const [targetAudience, setTargetAudience] = useState<RecipientType>((initialValues.targetAudience as any) || 'ALL_USERS');
  const [venueId, setVenueId] = useState<number | ''>(initialValues.venueId || '');
  const [rideId, setRideId] = useState<number | ''>(initialValues.rideId || '');
  const [publishTime, setPublishTime] = useState(
    initialValues.publishTime
      ? new Date(initialValues.publishTime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [bannerImage, setBannerImage] = useState(initialValues.bannerImage || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề bảng tin.';
    if (!content.trim()) newErrors.content = 'Vui lòng nhập nội dung bảng tin.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedVenue = venues.find((v) => v.id === venueId);
    const selectedRide = rides.find((r) => r.id === rideId);

    onSubmit({
      title,
      content,
      status,
      isPinned,
      targetAudience,
      venueId: venueId || undefined,
      venueName: selectedVenue?.venueName,
      rideId: rideId || undefined,
      rideName: selectedRide?.rideName,
      publishTime: new Date(publishTime).toISOString(),
      bannerImage: bannerImage || undefined,
    });
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ p: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={8}>
          <TextField
            label="Tiêu đề bảng tin"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            error={!!errors.title}
            helperText={errors.title}
            required
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={status}
              label="Trạng thái"
              onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
            >
              <MenuItem value="DRAFT">Nháp (Draft)</MenuItem>
              <MenuItem value="PUBLISHED">Công bố (Published)</MenuItem>
              <MenuItem value="ARCHIVED">Lưu trữ (Archived)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Nội dung chi tiết bản tin"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={5}
            error={!!errors.content}
            helperText={errors.content}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Đối tượng xem chính</InputLabel>
            <Select
              value={targetAudience}
              label="Đối tượng xem chính"
              onChange={(e) => setTargetAudience(e.target.value as RecipientType)}
            >
              <MenuItem value="ALL_USERS">Tất cả khách tham quan</MenuItem>
              <MenuItem value="CUSTOMERS">Khách mua vé lẻ</MenuItem>
              <MenuItem value="MEMBERS">Hội viên GateOS</MenuItem>
              <MenuItem value="VIP_MEMBERS">Hội viên VIP</MenuItem>
              <MenuItem value="STAFF">Nhân viên vận hành</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Thời gian công bố tin"
            type="datetime-local"
            value={publishTime}
            onChange={(e) => setPublishTime(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Liên kết Khu Vực (Venues)</InputLabel>
            <Select
              value={venueId}
              label="Liên kết Khu Vực (Venues)"
              onChange={(e) => setVenueId(e.target.value as number)}
            >
              <MenuItem value="">Không liên kết</MenuItem>
              {venues.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.venueName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Liên kết Trò Chơi (Rides)</InputLabel>
            <Select
              value={rideId}
              label="Liên kết Trò Chơi (Rides)"
              onChange={(e) => setRideId(e.target.value as number)}
            >
              <MenuItem value="">Không liên kết</MenuItem>
              {rides.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.rideName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Đường dẫn ảnh biểu ngữ (Banner URL)"
            value={bannerImage}
            onChange={(e) => setBannerImage(e.target.value)}
            fullWidth
            placeholder="e.g. https://picsum.photos/seed/ann/1200/400"
            helperText="Ảnh hiển thị phía trên của bảng tin."
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                color="primary"
              />
            }
            label="Ghim tin nhắn lên đầu trang (Pin to Top)"
          />
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Lưu Tin Nhắn
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
