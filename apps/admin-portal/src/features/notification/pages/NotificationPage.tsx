import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Alert,
  Slide,
} from '@mui/material';
import { MdClose, MdAdd } from 'react-icons/md';
import {
  useGetNotificationStatsQuery,
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
} from '../services/notificationApi';
import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from '../../announcement/services/announcementApi';
import {
  useGetEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
} from '../../email-template/services/emailTemplateApi';
import {
  useGetSMSTemplatesQuery,
  useCreateSMSTemplateMutation,
  useUpdateSMSTemplateMutation,
} from '../../sms-template/services/smsTemplateApi';
import {
  useGetPushNotificationsQuery,
  useSendPushNotificationMutation,
} from '../../push/services/pushApi';

import { NotificationDashboard } from '../components/NotificationDashboard';
import { NotificationTable } from '../components/NotificationTable';
import { NotificationForm } from '../components/NotificationForm';
import { NotificationPreview } from '../components/NotificationPreview';
import { AnnouncementCard } from '../../announcement/components/AnnouncementCard';
import { AnnouncementForm } from '../../announcement/components/AnnouncementForm';
import { EmailTemplateEditor } from '../../email-template/components/EmailTemplateEditor';
import { SMSTemplateEditor } from '../../sms-template/components/SMSTemplateEditor';
import { PushNotificationBuilder } from '../../push/components/PushNotificationBuilder';
import { NotificationItem, NotificationFilters } from '../types';
import { Announcement } from '../../announcement/types';

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Mock fallback lists for Venues & Rides targeting selection
const mockVenues = [
  { id: 1, venueName: 'Khu ẩm thực Phố Cổ' },
  { id: 2, venueName: 'Công viên nước Wave Cave' },
  { id: 3, venueName: 'Bãi đỗ xe thông minh A' },
];

const mockRides = [
  { id: 1, rideName: 'Tàu lượn siêu tốc Rồng Bay' },
  { id: 2, rideName: 'Vòng quay mặt trời Sun Wheel' },
  { id: 3, rideName: 'Tháp rơi tự do Free Fall' },
];

export const NotificationPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Notifications State
  const [notifFilters, setNotifFilters] = useState<NotificationFilters>({ page: 0, size: 10 });
  const { data: statsData, refetch: refetchStats } = useGetNotificationStatsQuery();
  const { data: notifsData, refetch: refetchNotifs } = useGetNotificationsQuery(notifFilters);
  const [createNotif] = useCreateNotificationMutation();
  const [deleteNotif] = useDeleteNotificationMutation();

  const [isNotifFormOpen, setIsNotifFormOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [notifFormInitial, setNotifFormInitial] = useState<Partial<NotificationItem> | undefined>(undefined);

  // Announcements State
  const { data: annsData, refetch: refetchAnns } = useGetAnnouncementsQuery({});
  const [createAnn] = useCreateAnnouncementMutation();
  const [updateAnn] = useUpdateAnnouncementMutation();
  const [deleteAnn] = useDeleteAnnouncementMutation();

  const [isAnnFormOpen, setIsAnnFormOpen] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);

  // Templates State
  const { data: emailTemplatesData, refetch: refetchEmails } = useGetEmailTemplatesQuery({});
  const [createEmail] = useCreateEmailTemplateMutation();
  const [updateEmail] = useUpdateEmailTemplateMutation();

  const { data: smsTemplatesData, refetch: refetchSMS } = useGetSMSTemplatesQuery({});
  const [createSMS] = useCreateSMSTemplateMutation();
  const [updateSMS] = useUpdateSMSTemplateMutation();

  // Push notifications State
  const { data: pushData, refetch: refetchPush } = useGetPushNotificationsQuery({});
  const [sendPush] = useSendPushNotificationMutation();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Notification Handlers
  const handleNotifSubmit = async (values: Partial<NotificationItem>) => {
    await createNotif(values).unwrap();
    setIsNotifFormOpen(false);
    setNotifFormInitial(undefined);
    refetchNotifs();
    refetchStats();
  };

  const handleNotifDuplicate = (item: NotificationItem) => {
    setNotifFormInitial({
      title: `${item.title} (Bản sao)`,
      message: item.message,
      channel: item.channel,
      priority: item.priority,
      recipientType: item.recipientType,
      deepLink: item.deepLink,
      actionButtonText: item.actionButtonText,
    });
    setIsNotifFormOpen(true);
  };

  const handleNotifDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      await deleteNotif(id).unwrap();
      refetchNotifs();
      refetchStats();
    }
  };

  // Announcement Handlers
  const handleAnnSubmit = async (values: Partial<Announcement>) => {
    if (selectedAnn) {
      await updateAnn({ id: selectedAnn.id, data: values }).unwrap();
    } else {
      await createAnn(values).unwrap();
    }
    setIsAnnFormOpen(false);
    setSelectedAnn(null);
    refetchAnns();
  };

  const handleAnnTogglePublish = async (item: Announcement) => {
    const nextStatus = item.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED';
    await updateAnn({ id: item.id, data: { status: nextStatus } }).unwrap();
    refetchAnns();
  };

  const handleAnnDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản tin này?')) {
      await deleteAnn(id).unwrap();
      refetchAnns();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Hệ Thống Truyền Thông & Cảnh Báo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cấu hình thông báo đẩy In-App, SMS Gateway, Email Marketing và Bảng tin khẩn cấp.
          </Typography>
        </Box>
        {tabValue === 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdAdd />}
            onClick={() => {
              setNotifFormInitial(undefined);
              setIsNotifFormOpen(true);
            }}
          >
            Tạo Thông Báo Mới
          </Button>
        )}
        {tabValue === 1 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdAdd />}
            onClick={() => {
              setSelectedAnn(null);
              setIsAnnFormOpen(true);
            }}
          >
            Viết Bản Tin Mới
          </Button>
        )}
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tab label="Trung Tâm Thông Báo (In-App)" />
        <Tab label="Bảng Tin & Sự Kiện" />
        <Tab label="Push Notification (FCM)" />
        <Tab label="Mẫu Email SMTP" />
        <Tab label="Mẫu SMS Gateway" />
      </Tabs>

      {/* TAB 0: NOTIFICATION CENTER */}
      {tabValue === 0 && (
        <Box>
          {statsData && <NotificationDashboard stats={statsData} />}
          {notifsData && (
            <NotificationTable
              notifications={notifsData.content}
              totalElements={notifsData.totalElements}
              page={notifFilters.page || 0}
              size={notifFilters.size || 10}
              onPageChange={(p) => setNotifFilters({ ...notifFilters, page: p })}
              onSizeChange={(s) => setNotifFilters({ ...notifFilters, size: s })}
              onViewDetails={setSelectedNotif}
              onDuplicate={handleNotifDuplicate}
              onDelete={handleNotifDelete}
            />
          )}
        </Box>
      )}

      {/* TAB 1: ANNOUNCEMENTS */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {annsData?.content.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">Không tìm thấy bản tin nào đang hiển thị. Hãy tạo mới bản tin đầu tiên.</Alert>
            </Grid>
          ) : (
            annsData?.content.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <AnnouncementCard
                  item={item}
                  onEdit={(a) => {
                    setSelectedAnn(a);
                    setIsAnnFormOpen(true);
                  }}
                  onDelete={handleAnnDelete}
                  onTogglePublish={handleAnnTogglePublish}
                />
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* TAB 2: PUSH (FCM) */}
      {tabValue === 2 && pushData && (
        <PushNotificationBuilder
          configs={pushData.content}
          onSend={async (values) => {
            await sendPush(values).unwrap();
            refetchPush();
          }}
        />
      )}

      {/* TAB 3: EMAIL TEMPLATES */}
      {tabValue === 3 && emailTemplatesData && (
        <EmailTemplateEditor
          templates={emailTemplatesData.content}
          onCreate={async (values) => {
            await createEmail(values).unwrap();
            refetchEmails();
          }}
          onUpdate={async (id, data) => {
            await updateEmail({ id, data }).unwrap();
            refetchEmails();
          }}
        />
      )}

      {/* TAB 4: SMS TEMPLATES */}
      {tabValue === 4 && smsTemplatesData && (
        <SMSTemplateEditor
          templates={smsTemplatesData.content}
          onCreate={async (values) => {
            await createSMS(values).unwrap();
            refetchSMS();
          }}
          onUpdate={async (id, data) => {
            await updateSMS({ id, data }).unwrap();
            refetchSMS();
          }}
        />
      )}

      {/* Notification Compose Form Modal */}
      <Dialog
        open={isNotifFormOpen}
        onClose={() => setIsNotifFormOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {notifFormInitial ? 'Nhân Bản / Tạo Thông Báo' : 'Soạn Thảo Chiến Dịch Gửi Tin'}
          </Typography>
          <IconButton onClick={() => setIsNotifFormOpen(false)} size="small">
            <MdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <NotificationForm
            initialValues={notifFormInitial}
            onSubmit={handleNotifSubmit}
            onCancel={() => setIsNotifFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Announcement Compose Form Modal */}
      <Dialog
        open={isAnnFormOpen}
        onClose={() => setIsAnnFormOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedAnn ? 'Chỉnh Sửa Bản Tin' : 'Soạn Thảo Bản Tin & Sự Kiện'}
          </Typography>
          <IconButton onClick={() => setIsAnnFormOpen(false)} size="small">
            <MdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <AnnouncementForm
            initialValues={selectedAnn || undefined}
            onSubmit={handleAnnSubmit}
            onCancel={() => setIsAnnFormOpen(false)}
            venues={mockVenues}
            rides={mockRides}
          />
        </DialogContent>
      </Dialog>

      {/* Notification Detail Preview Drawer Modal */}
      <Dialog open={!!selectedNotif} onClose={() => setSelectedNotif(null)} maxWidth="sm" fullWidth>
        <DialogContent>
          {selectedNotif && (
            <NotificationPreview item={selectedNotif} onClose={() => setSelectedNotif(null)} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default NotificationPage;
