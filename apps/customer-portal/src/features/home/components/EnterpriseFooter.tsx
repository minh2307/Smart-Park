import React from 'react';
import { Box, Typography, Container, Grid, Stack, IconButton, Link, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';

export const EnterpriseFooter: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: '#0f172a', color: '#94a3b8', pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Logo & Intro */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                Smart Park
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                Hệ thống quản lý và vận hành công viên giải trí thông minh hàng đầu Việt Nam. Mang lại trải nghiệm số hóa trọn vẹn cho mọi du khách tham quan.
              </Typography>
              {/* Social links */}
              <Stack direction="row" spacing={1}>
                {[<FacebookIcon />, <InstagramIcon />, <YouTubeIcon />, <TwitterIcon />].map((icon, idx) => (
                  <IconButton
                    key={idx}
                    sx={{
                      color: '#94a3b8',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '&:hover': {
                        color: '#ffffff',
                        backgroundColor: 'primary.main',
                      },
                    }}
                  >
                    {icon}
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Links Column 1 */}
          <Grid item xs={6} md={2.5}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                Khám Phá
              </Typography>
              {['Trò chơi & Attraction', 'Show diễn & Sự kiện', 'Ẩm thực Food Court', 'Bản đồ công viên'].map((link) => (
                <Link
                  key={link}
                  href="#"
                  underline="none"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                    '&:hover': { color: '#ffffff' },
                  }}
                >
                  {link}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Links Column 2 */}
          <Grid item xs={6} md={2.5}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                Dịch Vụ Khách Hàng
              </Typography>
              {['Mua vé trực tuyến', 'Đăng ký thành viên', 'Điều khoản hoàn vé', 'Hỗ trợ khách hàng'].map((link) => (
                <Link
                  key={link}
                  href="#"
                  underline="none"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                    '&:hover': { color: '#ffffff' },
                  }}
                >
                  {link}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Contact Summary info */}
          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                Liên Hệ & Hỗ Trợ
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                Hotline: 1900 6868
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                Email: support@smartpark.com.vn
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                Địa chỉ: Quận 9, TP. Hồ Chí Minh
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 4 }} />

        {/* Legal copyrights */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="caption">
            © {new Date().getFullYear()} Smart Park. Phát triển bởi Đội ngũ Công nghệ GateOS. All Rights Reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            {['Điều khoản sử dụng', 'Chính sách bảo mật', 'Quy chế hoạt động'].map((legal) => (
              <Link
                key={legal}
                href="#"
                underline="none"
                sx={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#ffffff' },
                }}
              >
                {legal}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
