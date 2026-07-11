import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { MdArrowBack } from 'react-icons/md';
import { PageContainer } from '../../../layouts/components/PageContainer';
import { VenueDetails } from '../components/VenueDetails';
import { Spinner, ErrorMessage } from '../../../components/common/Feedback';
import { useGetVenueByIdQuery } from '../services/venueApi';
import { Venue } from '../types';

export const VenueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const venueId = id ? parseInt(id, 10) : NaN;
  const { data: venue, isLoading, isError } = useGetVenueByIdQuery(venueId, {
    skip: isNaN(venueId),
  });

  const mockVenue: Venue = {
    id: 1,
    name: 'Smart Park East Wing',
    venueCode: 'SPK-EAST',
    description: 'The main thematic playground containing fantasy rides and food courts.',
    address: '123 Paradise Road',
    city: 'Ho Chi Minh',
    provinceState: 'HCM',
    country: 'Vietnam',
    status: 'ACTIVE',
    openingTime: '08:00',
    closingTime: '22:00',
    manager: 'Tran Van A',
    coverImageUrl: 'https://images.unsplash.com/photo-1513889961551-6ad8762ebd57?auto=format&fit=crop&w=800&q=80',
  };

  const handleBack = () => {
    navigate('/admin/venues');
  };

  const content = () => {
    if (isLoading) return <Spinner />;
    if (isError || !venue) {
      return (
        <Box display="flex" flexDirection="column" gap={2}>
          <ErrorMessage message="Could not fetch detailed venue info from backend. Displaying template details as fallback." />
          <VenueDetails venue={mockVenue} />
        </Box>
      );
    }
    return <VenueDetails venue={venue} />;
  };

  return (
    <PageContainer
      title="Venue Details"
      toolbar={
        <Button startIcon={<MdArrowBack />} onClick={handleBack} variant="outlined">
          Back to List
        </Button>
      }
    >
      {content()}
    </PageContainer>
  );
};
