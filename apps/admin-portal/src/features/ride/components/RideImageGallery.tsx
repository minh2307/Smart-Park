import React, { useState } from 'react';
import { Box, Grid, Card, CardMedia, Typography, IconButton } from '@mui/material';
import { MdDelete, MdStar, MdPhotoCamera, MdZoomIn } from 'react-icons/md';
import { Modal } from '../../../components/common/Dialog';

interface RideImageGalleryProps {
  images: string[];
  coverImage?: string;
  onSetCover?: (url: string) => void;
  onDeleteImage?: (url: string) => void;
  onUploadClick?: () => void;
  editable?: boolean;
}

export const RideImageGallery: React.FC<RideImageGalleryProps> = ({
  images = [],
  coverImage,
  onSetCover,
  onDeleteImage,
  onUploadClick,
  editable = false,
}) => {
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  return (
    <Box>
      <Grid container spacing={2}>
        {images.map((img, idx) => {
          const isCover = img === coverImage;
          return (
            <Grid item xs={6} sm={4} md={3} key={idx}>
              <Card
                variant="outlined"
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: isCover ? '2px solid' : '1px solid',
                  borderColor: isCover ? 'primary.main' : 'divider',
                  '&:hover .gallery-overlay': { opacity: 1 },
                }}
              >
                <CardMedia component="img" height="120" image={img} alt="Ride image" />

                {/* Overlay actions */}
                <Box
                  className="gallery-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0, 0, 0, 0.4)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <IconButton size="small" sx={{ color: 'white' }} onClick={() => setZoomUrl(img)}>
                    <MdZoomIn size={20} />
                  </IconButton>

                  {editable && onSetCover && !isCover && (
                    <IconButton
                      size="small"
                      sx={{ color: 'white' }}
                      onClick={() => onSetCover(img)}
                      title="Set as Cover"
                    >
                      <MdStar size={20} />
                    </IconButton>
                  )}

                  {editable && onDeleteImage && (
                    <IconButton
                      size="small"
                      sx={{ color: 'error.main' }}
                      onClick={() => onDeleteImage(img)}
                      title="Delete Image"
                    >
                      <MdDelete size={20} />
                    </IconButton>
                  )}
                </Box>

                {isCover && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      boxShadow: 2,
                    }}
                  >
                    COVER
                  </Box>
                )}
              </Card>
            </Grid>
          );
        })}

        {editable && onUploadClick && (
          <Grid item xs={6} sm={4} md={3}>
            <Box
              onClick={onUploadClick}
              sx={{
                height: 120,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: 'action.hover',
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <MdPhotoCamera size={26} color="primary" />
              <Typography variant="caption" sx={{ mt: 1, fontWeight: 'medium' }}>
                Upload Image
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Image Preview Zoom modal */}
      <Modal open={!!zoomUrl} onClose={() => setZoomUrl(null)} title="Image Preview" maxWidth="md">
        {zoomUrl && (
          <Box display="flex" justifyContent="center">
            <img
              src={zoomUrl}
              alt="Zoomed Ride"
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 12 }}
            />
          </Box>
        )}
      </Modal>
    </Box>
  );
};
