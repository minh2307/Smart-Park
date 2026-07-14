import React, { useState } from 'react';
import { Box, Typography, Button, Container, Paper, Grid, TextField, MenuItem, Stack } from '@mui/material';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ExploreIcon from '@mui/icons-material/Explore';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [ticketDate, setTicketDate] = useState('');
  const [ticketType, setTicketType] = useState('single');
  const [quantity, setQuantity] = useState(1);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '90vh', md: '85vh' },
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(rgba(12, 18, 34, 0.4), rgba(12, 18, 34, 0.9)), url('https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        overflow: 'hidden',
        py: 8,
      }}
    >
      {/* Background Animated Orb */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          pointerEvents: 'none',
          filter: 'blur(40px)',
          zIndex: 1,
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(13, 148, 136, 0.4) 0%, rgba(13, 148, 136, 0) 70%)',
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ zIndex: 2 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants}>
                <Typography
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.2rem' },
                    lineHeight: 1.1,
                    mb: 2,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #ffffff 40%, #2dd4bf 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Khám Phá Kỷ Nguyên Giải Trí Mới
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 4,
                    lineHeight: 1.6,
                    maxWidth: 550,
                  }}
                >
                  Trải nghiệm những trò chơi cảm giác mạnh đỉnh cao, show diễn ánh sáng mãn nhãn và dịch vụ thông minh đẳng cấp tại Smart Park.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<ConfirmationNumberIcon />}
                      onClick={() => navigate('/booking')}
                      sx={{
                        px: 4,
                        py: 1.8,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        width: '100%',
                      }}
                    >
                      Mua Vé Ngay
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<ExploreIcon />}
                      onClick={() => navigate('/tickets')}
                      sx={{
                        color: '#ffffff',
                        borderColor: '#ffffff',
                        px: 4,
                        py: 1.8,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        width: '100%',
                        '&:hover': {
                          borderColor: '#ffffff',
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        },
                      }}
                    >
                      Khám Phá Trò Chơi
                    </Button>
                  </motion.div>
                </Stack>
              </motion.div>
            </motion.div>
          </Grid>

          {/* Quick Ticket Search Box */}
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            >
              <Paper
                elevation={24}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    mb: 3,
                    color: '#ffffff',
                  }}
                >
                  Tìm Kiếm Vé Nhanh
                </Typography>

                <Stack spacing={3}>
                  <TextField
                    select
                    label="Loại vé"
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value)}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ color: 'primary.light', mr: 1 }} />
                      ),
                    }}
                    sx={{
                      '& label': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover fieldset': { borderColor: '#2dd4bf' },
                      },
                    }}
                  >
                    <MenuItem value="single">Vé Cổng Standard</MenuItem>
                    <MenuItem value="vip">Vé VIP Express</MenuItem>
                    <MenuItem value="family">Combo Gia Đình</MenuItem>
                    <MenuItem value="membership">Vé Năm Unlimited</MenuItem>
                  </TextField>

                  <TextField
                    type="date"
                    label="Ngày tham quan"
                    value={ticketDate}
                    onChange={(e) => setTicketDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <EventIcon sx={{ color: 'primary.light', mr: 1 }} />
                      ),
                    }}
                    sx={{
                      '& label': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover fieldset': { borderColor: '#2dd4bf' },
                      },
                    }}
                  />

                  <TextField
                    type="number"
                    label="Số lượng"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      inputProps: { min: 1 },
                      startAdornment: (
                        <PeopleIcon sx={{ color: 'primary.light', mr: 1 }} />
                      ),
                    }}
                    sx={{
                      '& label': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover fieldset': { borderColor: '#2dd4bf' },
                      },
                    }}
                  />

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      fullWidth
                      onClick={() => navigate('/booking')}
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#0f172a',
                      }}
                    >
                      Kiểm tra chỗ trống
                    </Button>
                  </motion.div>
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
