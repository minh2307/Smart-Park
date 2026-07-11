import React, { useState } from 'react';
import { Box, Typography, Container, Grid, TextField, Button, Paper, Stack, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import MapIcon from '@mui/icons-material/Map';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export const ContactSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
  };

  return (
    <Box sx={{ backgroundColor: 'rgba(15, 23, 42, 0.02)', py: 10 }}>
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          {/* Contact Details and Hours */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 800,
                    mb: 2,
                    background: 'linear-gradient(135deg, #0f172a 30%, #0d9488 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Liên Hệ & Giờ Mở Cửa
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Chúng tôi luôn sẵn sàng lắng nghe ý kiến và hỗ trợ hành trình vui chơi của bạn trọn vẹn từng khoảnh khắc.
                </Typography>
              </Box>

              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <AccessTimeIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Thời gian mở cửa hoạt động
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Thứ Hai - Chủ Nhật | 08:00 AM - 10:00 PM (Kể cả ngày Lễ)
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <MapIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Địa chỉ công viên
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đại lộ Smart Park, Khu Đô thị Công nghệ cao, Quận 9, TP. Hồ Chí Minh
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <PhoneInTalkIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Đường dây nóng hỗ trợ
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        1900 6868 (Phím 1 cho Vé cá nhân, Phím 2 cho Sự kiện đoàn thể)
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>

              {/* Newsletter Signup inside Contact Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  backgroundColor: 'primary.main',
                  color: '#ffffff',
                }}
              >
                <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 1 }}>
                  Đăng Ký Nhận Bản Tin Ưu Đãi
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                  Nhập email để nhận ngay voucher giảm giá 10% cho lần mua vé kế tiếp và cập nhật sự kiện lễ hội sớm nhất.
                </Typography>

                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <Box
                      component={motion.form}
                      onSubmit={handleSubmit}
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      sx={{ display: 'flex', gap: 1.5 }}
                    >
                      <TextField
                        type="email"
                        placeholder="Địa chỉ email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { border: 'none' },
                          },
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          px: 3,
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: '#1e293b',
                          },
                        }}
                      >
                        Đăng Ký
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      component={motion.div}
                      key="success"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}
                    >
                      <CheckCircleOutlineIcon sx={{ fontSize: '2rem', color: '#fbbf24' }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Đăng ký thành công! Hãy kiểm tra hộp thư email của bạn.
                      </Typography>
                    </Box>
                  )}
                </AnimatePresence>
              </Paper>
            </Stack>
          </Grid>

          {/* Interactive Map card */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={4}
              sx={{
                height: '100%',
                minHeight: 400,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(226, 232, 240, 0.8)',
              }}
            >
              {/* Simulated Map Canvas */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px), radial-gradient(#e2e8f0 1.5px, #f8fafc 1.5px)',
                  backgroundSize: '30px 30px',
                  backgroundPosition: '0 0, 15px 15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                {/* Visual Park Map Emblem */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Box
                    sx={{
                      width: 140,
                      height: 140,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 30px rgba(13, 148, 136, 0.3)',
                      mb: 3,
                    }}
                  >
                    <MapIcon sx={{ fontSize: '4.5rem' }} />
                  </Box>
                </motion.div>

                <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, mb: 1.5 }}>
                  Bản Đồ Công Viên Smart Park
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 350, mb: 3 }}>
                  Bản đồ vệ tinh số hóa giúp bạn định vị chính xác vị trí trò chơi, nhà hàng, cổng soát vé và tủ locker thông minh.
                </Typography>

                <Button variant="contained" color="primary" sx={{ fontWeight: 'bold', px: 4, py: 1.2 }}>
                  Mở Bản Đồ Số Tương Tác
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
