import React, { useState } from 'react';
import { Box, Typography, Container, Grid, Dialog, DialogContent, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

interface GalleryImage {
  id: number;
  url: string;
  title: string;
}

const IMAGES: GalleryImage[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1200&q=80',
    title: 'Dragon Coaster Peak Speed',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=1200&q=80',
    title: 'Mystic Castle Castle View',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=1200&q=80',
    title: 'Splash Canyon Wave Splash',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    title: 'Carousel Night Lights',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=80',
    title: 'Kids Dino Expedition Room',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1200&q=80',
    title: 'Magic Castle Sunset Glow',
  },
];

export const GallerySection: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleOpen = (url: string) => {
    setSelectedImage(url);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      {/* Title */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
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
          Kho Khoảnh Khắc Smart Park
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Ghi lại những nụ cười tỏa nắng và khoảnh khắc tuyệt diệu của hàng triệu du khách ghé thăm mỗi năm.
        </Typography>
      </Box>

      {/* Masonry-like Grid */}
      <Grid container spacing={2}>
        {IMAGES.map((img, idx) => (
          <Grid item xs={12} sm={6} md={4} key={img.id}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleOpen(img.url)}
              sx={{
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'pointer',
                height: 250,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(15, 23, 42, 0.4)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover::after': {
                  opacity: 1,
                },
              }}
            >
              <Box
                component="img"
                src={img.url}
                alt={img.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Lightbox Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
          },
        }}
      >
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: '#ffffff',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              sx={{
                width: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};
