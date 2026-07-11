import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface TierOption {
  id: number;
  name: string;
  points: string;
  colorGrad: string;
  textColor: string;
  benefits: string[];
}

const TIERS: TierOption[] = [
  {
    id: 1,
    name: 'Bronze Member',
    points: 'Tích lũy 1x Điểm',
    colorGrad: 'linear-gradient(135deg, #a77044 0%, #d49a6a 100%)',
    textColor: '#ffffff',
    benefits: ['Tích điểm đổi quà lưu niệm', 'Giảm 5% khi mua đồ ăn', 'Hỗ trợ check-in nhanh'],
  },
  {
    id: 2,
    name: 'Silver Member',
    points: 'Tích lũy 1.2x Điểm',
    colorGrad: 'linear-gradient(135deg, #708090 0%, #c0c0c0 100%)',
    textColor: '#1e293b',
    benefits: ['Tích điểm đổi vé miễn phí', 'Giảm 10% dịch vụ ẩm thực', 'Ưu tiên đặt vé sự kiện'],
  },
  {
    id: 3,
    name: 'Gold Member',
    points: 'Tích lũy 1.5x Điểm',
    colorGrad: 'linear-gradient(135deg, #c5a059 0%, #f1e5ac 100%)',
    textColor: '#0f172a',
    benefits: ['Tặng 1 vé cổng sinh nhật', 'Giảm 15% tất cả dịch vụ', 'Hỗ trợ làn check-in riêng'],
  },
  {
    id: 4,
    name: 'Platinum Pass',
    points: 'Tích lũy 2x Điểm',
    colorGrad: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    textColor: '#ffffff',
    benefits: ['Lối đi VIP Express miễn phí', 'Giảm 20% khi mua sắm', 'Tận hưởng VIP Lounge'],
  },
];

export const MembershipSection: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      {/* Title */}
      <Box sx={{ mb: 8, textAlign: 'center' }}>
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
          Hội Viên Smart Member
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Đăng ký hội viên để tích lũy điểm thưởng khi vui chơi và quy đổi thành vô số phần quà giá trị cùng ưu đãi độc quyền.
        </Typography>
      </Box>

      {/* Grid */}
      <Grid container spacing={4}>
        {TIERS.map((tier, idx) => (
          <Grid item xs={12} sm={6} md={3} key={tier.id}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              sx={{ height: '100%' }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                }}
              >
                {/* Visual Card Header mimicking loyalty card */}
                <Box
                  sx={{
                    background: tier.colorGrad,
                    color: tier.textColor,
                    p: 4,
                    minHeight: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  <StarBorderIcon sx={{ opacity: 0.2, fontSize: '4rem', position: 'absolute', right: 16, bottom: 16 }} />
                  <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>
                    {tier.name}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', opacity: 0.9 }}>
                    {tier.points}
                  </Typography>
                </Box>

                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <List sx={{ mb: 3, flexGrow: 1 }}>
                    {tier.benefits.map((benefit, bIdx) => (
                      <ListItem key={bIdx} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <StarBorderIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit} 
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <Box sx={{ p: 4, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: tier.id === 4 ? '#0f172a' : 'primary.main',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      py: 1.2,
                      '&:hover': {
                        backgroundColor: tier.id === 4 ? '#1e293b' : 'primary.dark',
                      },
                    }}
                  >
                    Đăng Ký Ngay
                  </Button>
                </Box>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
