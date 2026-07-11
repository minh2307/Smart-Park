import React from 'react';
import { Box, Typography, Grid, Stack, Button } from '@mui/material';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LanguageIcon from '@mui/icons-material/Language';
import type { ContactInfo } from '../types/engagement.types';

interface ContactCardProps {
  contact: ContactInfo;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  return (
    <Grid container spacing={3.5}>
      {/* Contact Info Items */}
      <Grid item xs={12} md={5}>
        <Stack spacing={3}>
          {/* Hotline Card - Double Bezel */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              '&:hover': { borderColor: 'rgba(45, 212, 191, 0.3)' },
              transition: 'all 0.3s',
            }}
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'rgba(45, 212, 191, 0.1)',
                  border: '1px solid rgba(45, 212, 191, 0.2)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2dd4bf',
                }}
              >
                <PhoneInTalkIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  ĐƯỜNG DÂY NÓNG CSKH
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 900,
                    color: '#2dd4bf',
                    letterSpacing: 1.2,
                  }}
                >
                  {contact.hotline}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Email Card */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              '&:hover': { borderColor: 'rgba(45, 212, 191, 0.3)' },
              transition: 'all 0.3s',
            }}
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'rgba(14, 165, 233, 0.1)',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0ea5e9',
                }}
              >
                <EmailIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  EMAIL HỖ TRỢ KỸ THUẬT
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {contact.email}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Address Card */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              '&:hover': { borderColor: 'rgba(45, 212, 191, 0.3)' },
              transition: 'all 0.3s',
            }}
          >
            <Stack direction="row" spacing={2.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a855f7',
                  flexShrink: 0,
                }}
              >
                <LocationOnIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  ĐỊA CHỈ TRỤ SỞ
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: '#ffffff',
                    lineHeight: 1.5,
                  }}
                >
                  {contact.address}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Opening Hours */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              '&:hover': { borderColor: 'rgba(45, 212, 191, 0.3)' },
              transition: 'all 0.3s',
            }}
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b',
                }}
              >
                <AccessTimeFilledIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  GIỜ MỞ CỬA CÔNG VIÊN
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {contact.openingHours}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Grid>

      {/* Interactive Map Section */}
      <Grid item xs={12} md={7}>
        <Box
          sx={{
            height: '100%',
            minHeight: 320,
            bgcolor: 'rgba(30, 41, 59, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 5,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Mock Map Container */}
          <Box
            sx={{
              flexGrow: 1,
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              bgcolor: '#0d131f',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Map styling elements */}
            <Box
              sx={{
                position: 'absolute',
                width: '80%',
                height: '80%',
                opacity: 0.1,
                backgroundImage: 'radial-gradient(circle, #2dd4bf 2px, transparent 2px)',
                backgroundSize: '16px 16px',
              }}
            />
            {/* Pulsing Target Dot */}
            <Box
              sx={{
                position: 'relative',
                width: 24,
                height: 24,
                bgcolor: 'rgba(45, 212, 191, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: '200%',
                  height: '200%',
                  borderRadius: '50%',
                  border: '1px solid rgba(45, 212, 191, 0.4)',
                  animation: 'pulseMap 2s infinite',
                },
                '@keyframes pulseMap': {
                  '0%': { transform: 'scale(0.5)', opacity: 1 },
                  '100%': { transform: 'scale(1.5)', opacity: 0 },
                },
              }}
            >
              <LocationOnIcon sx={{ color: '#2dd4bf', zIndex: 2 }} />
            </Box>

            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                bgcolor: 'rgba(15, 23, 42, 0.8)',
                color: 'rgba(255,255,255,0.7)',
                py: 0.7,
                px: 1.5,
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                fontWeight: 600,
              }}
            >
              Vị trí Smart Park trên Bản đồ
            </Typography>
          </Box>

          {/* Social Channels buttons */}
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} justifyContent="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<FacebookIcon />}
              href={contact.socials.facebook}
              target="_blank"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.08)',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#1877f2',
                  bgcolor: 'rgba(24, 119, 242, 0.08)',
                  color: '#1877f2',
                },
              }}
            >
              Facebook
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<YouTubeIcon />}
              href={contact.socials.youtube}
              target="_blank"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.08)',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#ff0000',
                  bgcolor: 'rgba(255, 0, 0, 0.08)',
                  color: '#ff0000',
                },
              }}
            >
              Youtube
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LanguageIcon />}
              href={contact.socials.tiktok}
              target="_blank"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.08)',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#2dd4bf',
                  bgcolor: 'rgba(45, 212, 191, 0.08)',
                  color: '#2dd4bf',
                },
              }}
            >
              Tiktok
            </Button>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
};
