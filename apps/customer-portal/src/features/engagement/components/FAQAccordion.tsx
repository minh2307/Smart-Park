import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import type { FAQ } from '../types/engagement.types';
import { EmptyState } from './EmptyState';

interface FAQAccordionProps {
  faqs: FAQ[];
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    faqs.forEach((faq) => cats.add(faq.category));
    return ['ALL', ...Array.from(cats)];
  }, [faqs]);

  // Filter FAQs based on query and category
  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === 'ALL' || faq.category === selectedCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, searchQuery, selectedCategory]);

  return (
    <Box>
      {/* Search and Category Filter */}
      <Stack spacing={2.5} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Tìm câu hỏi bạn quan tâm (e.g. đặt vé, hoàn tiền, an toàn...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#ffffff',
              bgcolor: 'rgba(30, 41, 59, 0.4)',
              borderRadius: 3,
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.08)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
            },
          }}
        />

        {/* Category Chips */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat === 'ALL' ? 'Tất cả chủ đề' : cat}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                fontWeight: 700,
                fontSize: '0.85rem',
                py: 2,
                px: 1.5,
                bgcolor: selectedCategory === cat ? '#2dd4bf' : 'rgba(30, 41, 59, 0.4)',
                color: selectedCategory === cat ? '#0f172a' : 'rgba(255, 255, 255, 0.7)',
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#2dd4bf' : 'rgba(255, 255, 255, 0.08)',
                '&:hover': {
                  bgcolor: selectedCategory === cat ? '#2dd4bf' : 'rgba(45, 212, 191, 0.1)',
                  color: selectedCategory === cat ? '#0f172a' : '#ffffff',
                },
                transition: 'all 0.2s',
              }}
            />
          ))}
        </Stack>
      </Stack>

      {/* Accordions */}
      {filteredFAQs.length === 0 ? (
        <EmptyState
          icon={HelpOutlineIcon}
          title="Không tìm thấy câu trả lời"
          description="Vui lòng thử lại bằng từ khóa khác hoặc gửi yêu cầu hỗ trợ (Tạo ticket) cho chúng tôi ở mục bên cạnh."
        />
      ) : (
        <Grid container spacing={2}>
          {filteredFAQs.map((faq) => (
            <Grid item xs={12} key={faq.id}>
              <Accordion
                disableGutters
                elevation={0}
                sx={{
                  bgcolor: 'rgba(30, 41, 59, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px !important',
                  overflow: 'hidden',
                  '&::before': { display: 'none' },
                  '&:hover': {
                    borderColor: 'rgba(45, 212, 191, 0.25)',
                    bgcolor: 'rgba(30, 41, 59, 0.4)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#2dd4bf' }} />}
                  sx={{
                    px: 3,
                    py: 1,
                    '&.Mui-expanded': {
                      bgcolor: 'rgba(45, 212, 191, 0.04)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <QuestionAnswerIcon sx={{ color: '#2dd4bf', fontSize: 20 }} />
                    <Typography
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700,
                        color: '#ffffff',
                        fontSize: '1.05rem',
                      }}
                    >
                      {faq.question}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, py: 2.5, bgcolor: 'rgba(15, 23, 42, 0.2)' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.7,
                      fontSize: '0.95rem',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
