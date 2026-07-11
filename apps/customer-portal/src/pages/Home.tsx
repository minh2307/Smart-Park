import React from 'react';
import { Box } from '@mui/material';
import {
  HeroSection,
  FeaturedAttractions,
  TicketSection,
  PromotionSection,
  AIRecommendation,
  MembershipSection,
  StatisticsSection,
  GallerySection,
  TestimonialSection,
  FAQSection,
  ContactSection,
  EnterpriseFooter,
} from '../features/home';

export const HomePage: React.FC = () => {
  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <HeroSection />
      <FeaturedAttractions />
      <TicketSection />
      <PromotionSection />
      <AIRecommendation />
      <MembershipSection />
      <StatisticsSection />
      <GallerySection />
      <TestimonialSection />
      <FAQSection />
      <ContactSection />
      <EnterpriseFooter />
    </Box>
  );
};
