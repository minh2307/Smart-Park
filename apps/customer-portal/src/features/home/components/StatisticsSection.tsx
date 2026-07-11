import React from 'react';
import { Box, Typography, Container, Grid, Paper, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AttractionsIcon from '@mui/icons-material/Attractions';
import StarRateIcon from '@mui/icons-material/StarRate';

interface StatItem {
  id: number;
  value: string;
  label: string;
  icon: React.ReactNode;
}

const STATS: StatItem[] = [
  {
    id: 1,
    value: '5M+',
    label: 'Lượt Khách Ghé Thăm',
    icon: <EmojiPeopleIcon sx={{ fontSize: '2.5rem', color: '#0d9488' }} />,
  },
  {
    id: 2,
    value: '100K+',
    label: 'Gia Đình Hạnh Phúc',
    icon: <FamilyRestroomIcon sx={{ fontSize: '2.5rem', color: '#0d9488' }} />,
  },
  {
    id: 3,
    value: '50+',
    label: 'Trò Chơi Quốc Tế',
    icon: <AttractionsIcon sx={{ fontSize: '2.5rem', color: '#0d9488' }} />,
  },
  {
    id: 4,
    value: '4.9/5',
    label: 'Đánh Giá Hài Lòng',
    icon: <StarRateIcon sx={{ fontSize: '2.5rem', color: '#0d9488' }} />,
  },
];

export const StatisticsSection: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
        color: '#ffffff',
        py: 10,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          {STATS.map((stat, idx) => (
            <Grid item xs={6} md={3} key={stat.id}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    color: '#ffffff',
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 800,
                        color: '#ffffff',
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {stat.label}
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
