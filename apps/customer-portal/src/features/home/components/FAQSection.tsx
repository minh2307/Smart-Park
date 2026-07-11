import React from 'react';
import { Box, Typography, Container, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 1,
    question: 'Tôi có thể mua vé trực tiếp tại quầy bán vé của công viên không?',
    answer: 'Có, bạn vẫn có thể mua tại quầy. Tuy nhiên, chúng tôi khuyến khích đặt vé trực tuyến trên cổng thông tin này để hưởng ưu đãi chiết khấu 10-20% và nhận mã QR soát vé đi thẳng vào cổng không cần xếp hàng chờ đợi.',
  },
  {
    id: 2,
    question: 'Mã vé điện tử QR hoạt động như thế nào?',
    answer: 'Sau khi thanh toán thành công, mã vé QR sẽ được lưu trực tiếp trong phần "Ví vé" của bạn và gửi qua email đăng ký. Khi đến cổng công viên, bạn chỉ cần mở mã QR này trên điện thoại và quét qua đầu đọc tự động tại làn Gate để vào cổng ngay.',
  },
  {
    id: 3,
    question: 'Quy định hoàn/hủy vé hoặc đổi ngày tham quan như thế nào?',
    answer: 'Đối với vé Standard và Combo, bạn có thể tự do đổi ngày tham quan miễn phí trước 24 giờ so với ngày đã đăng ký. Các yêu cầu hoàn trả vé sẽ chịu mức phí 10% và cần được thực hiện trước ngày tham quan ít nhất 48 giờ.',
  },
  {
    id: 4,
    question: 'Lối đi VIP Express Pass giúp ích gì cho trải nghiệm của tôi?',
    answer: 'VIP Express Pass cho phép bạn đi bằng làn soát vé riêng cực nhanh tại toàn bộ hơn 40 trò chơi, bỏ qua hàng xếp hàng chờ thông thường (thời gian chờ có thể lên đến 30-60 phút vào ngày cao điểm). Bạn cũng được tặng quyền truy cập VIP Lounge và hàng ghế trung tâm show diễn.',
  },
];

export const FAQSection: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
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
          Câu Hỏi Thường Gặp
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Giải đáp nhanh các thắc mắc phổ biến nhất của du khách để chuẩn bị cho một ngày vui chơi trọn vẹn.
        </Typography>
      </Box>

      {/* Accordions */}
      <Box>
        {FAQS.map((faq) => (
          <Accordion
            key={faq.id}
            sx={{
              mb: 2,
              borderRadius: '12px !important',
              boxShadow: 'none',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              '&::before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
              sx={{
                p: 2.5,
                backgroundColor: 'rgba(13, 148, 136, 0.01)',
                '&.Mui-expanded': {
                  backgroundColor: 'rgba(13, 148, 136, 0.04)',
                },
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'text.primary' }}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, backgroundColor: '#ffffff', borderTop: '1px solid rgba(226, 232, 240, 0.5)' }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
};
