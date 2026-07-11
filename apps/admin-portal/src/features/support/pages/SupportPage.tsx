import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import {
  useGetSupportStatsQuery,
  useGetSupportTicketsQuery,
  useAddSupportMessageMutation,
  useResolveSupportTicketMutation,
  useDeleteSupportTicketMutation,
  useAssignSupportTicketMutation,
} from '../services/supportApi';
import {
  useGetFeedbacksQuery,
  useReplyToFeedbackMutation,
  useResolveFeedbackMutation,
  useDeleteFeedbackMutation,
} from '../../feedback/services/feedbackApi';
import {
  useGetComplaintsQuery,
  useResolveComplaintMutation,
  useDeleteComplaintMutation,
} from '../../complaint/services/complaintApi';

import { SupportTicketTable } from '../components/SupportTicketTable';
import { Timeline } from '../components/Timeline';
import { CommentPanel } from '../components/CommentPanel';
import { FeedbackTable } from '../../feedback/components/FeedbackTable';
import { ComplaintTable } from '../../complaint/components/ComplaintTable';
import { SupportTicket } from '../types';

export const SupportPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Tickets State
  const [ticketPage, setTicketPage] = useState(0);
  const [ticketSize, setTicketSize] = useState(10);
  const { data: statsData, refetch: refetchStats } = useGetSupportStatsQuery();
  const { data: ticketsData, refetch: refetchTickets } = useGetSupportTicketsQuery({
    page: ticketPage,
    size: ticketSize,
  });
  const [addMessage] = useAddSupportMessageMutation();
  const [resolveTicket] = useResolveSupportTicketMutation();
  const [assignTicket] = useAssignSupportTicketMutation();
  const [deleteTicket] = useDeleteSupportTicketMutation();

  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);

  // Feedbacks State
  const [fbPage, setFbPage] = useState(0);
  const [fbSize, setFbSize] = useState(10);
  const { data: feedbacksData, refetch: refetchFeedbacks } = useGetFeedbacksQuery({
    page: fbPage,
    size: fbSize,
  });
  const [replyFeedback] = useReplyToFeedbackMutation();
  const [resolveFeedback] = useResolveFeedbackMutation();
  const [deleteFeedback] = useDeleteFeedbackMutation();

  // Complaints State
  const [compPage, setCompPage] = useState(0);
  const [compSize, setCompSize] = useState(10);
  const { data: complaintsData, refetch: refetchComplaints } = useGetComplaintsQuery({
    page: compPage,
    size: compSize,
  });
  const [resolveComplaint] = useResolveComplaintMutation();
  const [deleteComplaint] = useDeleteComplaintMutation();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Ticket Message Sender Handler
  const handleSendTicketMessage = async (text: string, isInternal: boolean) => {
    if (!activeTicket) return;
    const role = isInternal ? 'SYSTEM' : 'STAFF';
    const sender = isInternal ? 'Hệ thống (Ghi chú nội bộ)' : 'Nguyễn Văn Minh (CSKH)';
    const updated = await addMessage({
      id: activeTicket.id,
      messageText: text,
      senderName: sender,
      senderRole: role,
    }).unwrap();

    setActiveTicket(updated);
    refetchTickets();
  };

  const handleResolveTicket = async () => {
    if (!activeTicket) return;
    const updated = await resolveTicket(activeTicket.id).unwrap();
    setActiveTicket(updated);
    refetchTickets();
    refetchStats();
  };

  const handleAssignTicket = async () => {
    if (!activeTicket) return;
    const updated = await assignTicket({ id: activeTicket.id, assigneeName: 'Nguyễn Văn Minh' }).unwrap();
    setActiveTicket(updated);
    refetchTickets();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Hệ Thống Chăm Sóc Khách Hàng (CRM & Helpdesk)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý phản hồi trực tuyến, xử lý sự vụ khiếu nại thực địa và điều phối nhân viên giải quyết.
        </Typography>
      </Box>

      {/* Stats row (only for tickets page) */}
      {tabValue === 0 && statsData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #ef4444' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Chờ giải quyết</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>{statsData.openTickets}</Typography>
                <Typography variant="caption" color="text.secondary">Trên tổng {statsData.totalTickets} tickets</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Tỷ lệ đáp ứng SLA</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>{statsData.slaComplianceRate}%</Typography>
                <Typography variant="caption" color="success.main">Tiêu chuẩn phục vụ 4h/24h</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #3b82f6' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Độ hài lòng (CSAT)</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>{statsData.customerSatisfactionScore} / 5</Typography>
                <Typography variant="caption" color="info.main">Dựa trên khảo sát xếp hạng</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #8b5cf6' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Phản hồi trung bình</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>{statsData.averageResponseTimeMinutes} phút</Typography>
                <Typography variant="caption" color="text.secondary">Xử lý nhanh hàng đầu</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tab label="Yêu Cầu Hỗ Trợ (Tickets)" />
        <Tab label="Khảo Sát Ý Kiến (Feedback)" />
        <Tab label="Vụ Việc Khiếu Nại (Complaints)" />
      </Tabs>

      {/* TABS CONTENT */}
      {tabValue === 0 && ticketsData && (
        <SupportTicketTable
          tickets={ticketsData.content}
          totalElements={ticketsData.totalElements}
          page={ticketPage}
          size={ticketSize}
          onPageChange={setTicketPage}
          onSizeChange={setTicketSize}
          onSelectTicket={setActiveTicket}
          onDeleteTicket={async (id) => {
            if (window.confirm('Bạn chắc chắn muốn xóa ticket này?')) {
              await deleteTicket(id).unwrap();
              refetchTickets();
              refetchStats();
            }
          }}
        />
      )}

      {tabValue === 1 && feedbacksData && (
        <FeedbackTable
          feedbacks={feedbacksData.content}
          totalElements={feedbacksData.totalElements}
          page={fbPage}
          size={fbSize}
          onPageChange={setFbPage}
          onSizeChange={setFbSize}
          onReply={async (id, text) => {
            await replyFeedback({ id, replyContent: text, staffName: 'Nguyễn Văn Minh (CSKH)' }).unwrap();
            refetchFeedbacks();
          }}
          onResolve={async (id) => {
            await resolveFeedback(id).unwrap();
            refetchFeedbacks();
          }}
          onDelete={async (id) => {
            if (window.confirm('Bạn có muốn xóa phản hồi này?')) {
              await deleteFeedback(id).unwrap();
              refetchFeedbacks();
            }
          }}
        />
      )}

      {tabValue === 2 && complaintsData && (
        <ComplaintTable
          complaints={complaintsData.content}
          totalElements={complaintsData.totalElements}
          page={compPage}
          size={compSize}
          onPageChange={setCompPage}
          onSizeChange={setCompSize}
          onEscalate={() => {}}
          onResolve={async (id, text) => {
            await resolveComplaint({ id, resolutionText: text }).unwrap();
            refetchComplaints();
          }}
          onDelete={async (id) => {
            if (window.confirm('Bạn có chắc chắn muốn xóa khiếu nại này?')) {
              await deleteComplaint(id).unwrap();
              refetchComplaints();
            }
          }}
        />
      )}

      {/* Ticket Details Chat Dialog */}
      <Dialog
        open={!!activeTicket}
        onClose={() => setActiveTicket(null)}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '80vh', display: 'flex', flexDirection: 'column' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Hội thoại {activeTicket?.ticketCode} - {activeTicket?.subject}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Khách hàng: {activeTicket?.customerName} • Độ ưu tiên: {activeTicket?.priority}
            </Typography>
          </Box>
          <IconButton onClick={() => setActiveTicket(null)} size="small">
            <MdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ flexGrow: 1, p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
          {activeTicket && (
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Chi tiết mô tả:</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {activeTicket.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                  {!activeTicket.assigneeName ? (
                    <Button size="small" variant="outlined" onClick={handleAssignTicket}>
                      Nhận giải quyết ticket này
                    </Button>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Nhân viên xử lý: <strong>{activeTicket.assigneeName}</strong>
                    </Typography>
                  )}

                  {activeTicket.status !== 'RESOLVED' && (
                    <Button size="small" variant="contained" color="success" onClick={handleResolveTicket}>
                      Xác nhận đã xử lý (Resolve)
                    </Button>
                  )}
                </Box>
              </Box>

              <Timeline messages={activeTicket.messages} />
            </Box>
          )}

          {activeTicket?.status !== 'RESOLVED' && (
            <CommentPanel onSendMessage={handleSendTicketMessage} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default SupportPage;
