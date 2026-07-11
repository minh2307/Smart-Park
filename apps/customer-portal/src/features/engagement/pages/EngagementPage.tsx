import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Stack, Grid, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

import {
  useGetNotificationsQuery,
  useGetIncidentsQuery,
  useGetFAQsQuery,
  useGetContactInfoQuery,
} from '../services/engagementApi';
import { markRead, markAllRead, deleteNotification } from '../store/engagementSlice';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';

import { NotificationList } from '../components/NotificationList';
import { FAQAccordion } from '../components/FAQAccordion';
import { FeedbackForm } from '../components/FeedbackForm';
import { ContactCard } from '../components/ContactCard';
import { SupportRequestForm } from '../components/SupportRequestForm';
import { SupportTicketCard } from '../components/SupportTicketCard';
import { TicketTimeline } from '../components/TicketTimeline';
import { SkeletonLoading } from '../components/SkeletonLoading';
import { EmptyState } from '../components/EmptyState';

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  {
    key: 'notifications',
    icon: NotificationsActiveIcon,
    label: 'Thông báo',
    description: 'Tin tức & cập nhật',
  },
  {
    key: 'support',
    icon: SupportAgentIcon,
    label: 'Hỗ trợ',
    description: 'Gửi yêu cầu',
  },
  {
    key: 'faq',
    icon: HelpOutlineIcon,
    label: 'FAQ',
    description: 'Câu hỏi thường gặp',
  },
  {
    key: 'feedback',
    icon: FeedbackIcon,
    label: 'Phản hồi',
    description: 'Đánh giá dịch vụ',
  },
  {
    key: 'contact',
    icon: ContactSupportIcon,
    label: 'Liên hệ',
    description: 'Thông tin liên lạc',
  },
];

const TAB_MAP: Record<string, number> = TABS.reduce(
  (acc, tab, idx) => ({ ...acc, [tab.key]: idx }),
  {}
);

const tabVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Component ────────────────────────────────────────────────────────────────
export const EngagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = TAB_MAP[searchParams.get('tab') || ''] ?? 0;
  const [activeTab, setActiveTab] = useState(initialTab);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const customerId = user?.id || 0;
  const { localReadIds, localDeletedIds } = useAppSelector((state) => state.engagement);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && TAB_MAP[tab] !== undefined) setActiveTab(TAB_MAP[tab]);
  }, [searchParams]);

  const { data: notificationsData, isLoading: notifLoading } = useGetNotificationsQuery(
    { page: 0, size: 50 },
    { skip: !customerId }
  );
  const { data: incidentsData, isLoading: incidentsLoading } = useGetIncidentsQuery(
    { page: 0, size: 50 },
    { skip: !customerId }
  );
  const { data: faqs, isLoading: faqLoading } = useGetFAQsQuery();
  const { data: contactInfo } = useGetContactInfoQuery();

  const notifications = notificationsData?.content ?? [];
  const incidents = incidentsData?.content ?? [];

  // Unread badge count for notification tab chip
  const unreadCount = notifications.filter(
    (n) => !localDeletedIds.includes(n.id) && n.status !== 'READ' && !localReadIds.includes(n.id)
  ).length;

  const handleMarkRead = useCallback((id: number) => dispatch(markRead(id)), [dispatch]);
  const handleMarkAllRead = useCallback((ids: number[]) => dispatch(markAllRead(ids)), [dispatch]);
  const handleDelete = useCallback((id: number) => dispatch(deleteNotification(id)), [dispatch]);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: '#0b1221',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background blobs */}
      <Box
        sx={{
          position: 'fixed',
          top: '-15%',
          right: '-10%',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '-20%',
          left: '-12%',
          width: '45vw',
          height: '45vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* ─── Page Header: Asymmetric left-aligned ─── */}
        <Box
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            pt: { xs: 5, md: 7 },
            pb: 0,
          }}
        >
          <Container maxWidth="lg">
            <motion.div variants={stagger} initial="initial" animate="animate">
              {/* Left-aligned headline block - NOT centered (anti-AI default) */}
              <Box sx={{ mb: 5, maxWidth: { md: '55%' } }}>
                <motion.div variants={fadeUp}>
                  <Typography
                    component="h1"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 900,
                      fontSize: { xs: '2rem', md: '2.6rem' },
                      color: '#ffffff',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.15,
                      mb: 1.5,
                    }}
                  >
                    Trung tam
                    <Box
                      component="span"
                      sx={{
                        color: '#2dd4bf',
                        ml: 1.5,
                      }}
                    >
                      Khach hang
                    </Box>
                  </Typography>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '1rem',
                      lineHeight: 1.6,
                      maxWidth: '42ch',
                    }}
                  >
                    Quan ly thong bao, gui phan hoi, dat ticket ho tro, tra cuu FAQ va lien he voi Smart Park.
                  </Typography>
                </motion.div>
              </Box>

              {/* ─── Custom Tab Bar: pill tabs instead of MUI default ─── */}
              <motion.div variants={fadeUp}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    overflowX: 'auto',
                    pb: 0,
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  {TABS.map((tab, idx) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === idx;
                    return (
                      <Box
                        key={tab.key}
                        component="button"
                        onClick={() => setActiveTab(idx)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.2,
                          px: 2.5,
                          py: 1.5,
                          border: 'none',
                          borderRadius: '12px 12px 0 0',
                          cursor: 'pointer',
                          bgcolor: isActive ? 'rgba(45,212,191,0.08)' : 'transparent',
                          color: isActive ? '#2dd4bf' : 'rgba(255,255,255,0.45)',
                          borderBottom: isActive ? '2px solid #2dd4bf' : '2px solid transparent',
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: isActive ? 800 : 600,
                          fontSize: '0.92rem',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                          flexShrink: 0,
                          '&:hover': {
                            color: isActive ? '#2dd4bf' : 'rgba(255,255,255,0.75)',
                            bgcolor: isActive ? 'rgba(45,212,191,0.08)' : 'rgba(255,255,255,0.04)',
                          },
                          '&:active': { transform: 'scale(0.98)' },
                        }}
                      >
                        <Icon sx={{ fontSize: 18 }} />
                        {tab.label}
                        {idx === 0 && unreadCount > 0 && (
                          <Chip
                            label={unreadCount}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              bgcolor: '#ef4444',
                              color: '#ffffff',
                              '& .MuiChip-label': { px: 0.8 },
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </motion.div>
            </motion.div>
          </Container>
        </Box>

        {/* ─── Tab Content ─── */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <AnimatePresence mode="wait">
            {/* 0: NOTIFICATIONS */}
            {activeTab === 0 && (
              <motion.div key="notif" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                {notifLoading ? (
                  <SkeletonLoading count={5} type="list" />
                ) : (
                  <NotificationList
                    notifications={notifications}
                    localReadIds={localReadIds}
                    localDeletedIds={localDeletedIds}
                    onMarkRead={handleMarkRead}
                    onMarkAllRead={handleMarkAllRead}
                    onDelete={handleDelete}
                  />
                )}
              </motion.div>
            )}

            {/* 1: SUPPORT */}
            {activeTab === 1 && (
              <motion.div key="support" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <Grid container spacing={{ xs: 3, lg: 5 }}>
                  <Grid item xs={12} lg={5}>
                    <SupportRequestForm />
                  </Grid>

                  <Grid item xs={12} lg={7}>
                    {/* Ticket history header - minimal, no eyebrow */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 800,
                          color: '#ffffff',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        Lich su yeu cau ho tro
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>
                        Toan bo yeu cau ban da gui den Smart Park
                      </Typography>
                    </Box>

                    {incidentsLoading ? (
                      <SkeletonLoading count={3} type="card" />
                    ) : incidents.length === 0 ? (
                      <EmptyState
                        icon={SupportAgentIcon}
                        title="Chua co ticket nao"
                        description="Ban chua gui yeu cau ho tro nao. Su dung form ben trai de tao ticket dau tien."
                      />
                    ) : (
                      <Stack spacing={3}>
                        {incidents.map((incident, idx) => (
                          <motion.div
                            key={incident.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.07, ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
                          >
                            <SupportTicketCard incident={incident} />
                            <Box
                              sx={{
                                ml: 2,
                                mt: 2.5,
                                pl: 3,
                                borderLeft: '1px solid rgba(45,212,191,0.15)',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, mb: 2, display: 'block', letterSpacing: '0.08em' }}
                              >
                                TIEN TRINH XU LY
                              </Typography>
                              <TicketTimeline incident={incident} />
                            </Box>
                          </motion.div>
                        ))}
                      </Stack>
                    )}
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {/* 2: FAQ */}
            {activeTab === 2 && (
              <motion.div key="faq" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                {faqLoading ? (
                  <SkeletonLoading count={6} type="faq" />
                ) : (
                  <FAQAccordion faqs={faqs ?? []} />
                )}
              </motion.div>
            )}

            {/* 3: FEEDBACK */}
            {activeTab === 3 && (
              <motion.div key="feedback" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <Grid container spacing={{ xs: 3, md: 5 }} alignItems="flex-start">
                  <Grid item xs={12} md={7}>
                    <FeedbackForm />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Box
                      sx={{
                        p: { xs: 3, md: 4 },
                        bgcolor: 'rgba(30,41,59,0.3)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 4,
                        position: 'sticky',
                        top: 24,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 800,
                          color: '#ffffff',
                          fontSize: '1.1rem',
                          letterSpacing: '-0.02em',
                          mb: 1.5,
                        }}
                      >
                        Tai sao phan hoi cua ban quan trong?
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, mb: 3 }}>
                        Moi y kien dong gop tu khach hang deu giup Smart Park cai thien chat luong dich vu, nang cap trai nghiem va dam bao an toan.
                      </Typography>

                      {/* Commitment list - NO decorative dots (taste-skill banned) */}
                      <Stack
                        sx={{
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          pt: 2.5,
                          gap: 2,
                        }}
                      >
                        {[
                          { time: '24h', text: 'Phan hoi duoc xem xet trong vong 24 gio lam viec' },
                          { time: '100%', text: 'Moi danh gia deu duoc Hoi dong CSKH doc va phan tich' },
                          { time: 'Quy', text: 'Ket qua cai tien duoc cong bo cong khai hang quy' },
                        ].map((item) => (
                          <Stack key={item.time} direction="row" spacing={2.5} alignItems="flex-start">
                            <Typography
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 900,
                                fontSize: '1.4rem',
                                color: '#2dd4bf',
                                lineHeight: 1,
                                minWidth: 48,
                                letterSpacing: '-0.03em',
                              }}
                            >
                              {item.time}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                              {item.text}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {/* 4: CONTACT */}
            {activeTab === 4 && (
              <motion.div key="contact" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                {contactInfo ? (
                  <ContactCard contact={contactInfo} />
                ) : (
                  <SkeletonLoading count={4} type="card" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Box>
    </Box>
  );
};
