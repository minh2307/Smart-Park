import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { MdAdd } from 'react-icons/md';
import {
  useGetArticlesQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} from '../../knowledge-base/services/knowledgeBaseApi';
import {
  useGetIncidentsQuery as useGetIncidentsRealQuery,
  useGetIncidentStatsQuery as useGetIncidentStatsRealQuery,
  useCreateIncidentMutation as useCreateIncidentRealMutation,
  useUpdateIncidentStatusMutation as useUpdateIncidentStatusRealMutation,
  useResolveIncidentMutation as useResolveIncidentRealMutation,
  useDeleteIncidentMutation as useDeleteIncidentRealMutation,
} from '../services/incidentApi';

import { IncidentTable } from '../components/IncidentTable';
import { KBTable } from '../../knowledge-base/components/KnowledgeBaseTable';
import { IncidentSeverity, IncidentImpact, IncidentType } from '../types';

export const IncidentPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Incidents State
  const [incPage, setIncPage] = useState(0);
  const [incSize, setIncSize] = useState(10);
  const { data: statsData, refetch: refetchStats } = useGetIncidentStatsRealQuery();
  const { data: incidentsData, refetch: refetchIncidents } = useGetIncidentsRealQuery({
    page: incPage,
    size: incSize,
  });
  const [createIncident] = useCreateIncidentRealMutation();
  const [updateIncidentStatus] = useUpdateIncidentStatusRealMutation();
  const [resolveIncident] = useResolveIncidentRealMutation();
  const [deleteIncident] = useDeleteIncidentRealMutation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<IncidentType>('OTHER');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('LOW');
  const [newImpact, setNewImpact] = useState<IncidentImpact>('INDIVIDUAL');
  const [newLocation, setNewLocation] = useState('');
  const [newReporter, setNewReporter] = useState('');
  const [newReporterContact, setNewReporterContact] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Knowledge Base State
  const [kbPage, setKbPage] = useState(0);
  const [kbSize, setKbSize] = useState(10);
  const { data: kbData, refetch: refetchKb } = useGetArticlesQuery({
    page: kbPage,
    size: kbSize,
  });
  const [createArticle] = useCreateArticleMutation();
  const [updateArticle] = useUpdateArticleMutation();
  const [deleteArticle] = useDeleteArticleMutation();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateIncidentSubmit = async () => {
    if (!newTitle.trim() || !newLocation.trim()) return;

    await createIncident({
      title: newTitle,
      type: newType,
      severity: newSeverity,
      impact: newImpact,
      location: newLocation,
      reporterName: newReporter,
      reporterContact: newReporterContact,
      description: newDesc,
    }).unwrap();

    setCreateDialogOpen(false);
    // Reset values
    setNewTitle('');
    setNewType('OTHER');
    setNewSeverity('LOW');
    setNewImpact('INDIVIDUAL');
    setNewLocation('');
    setNewReporter('');
    setNewReporterContact('');
    setNewDesc('');

    refetchIncidents();
    refetchStats();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Trung Tâm Vận Hành An Toàn & Sự Cố (HSE)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Báo cáo sự cố thiết bị/trò chơi, ghi chép nhật trình cứu trợ y tế, và quản lý kho tri thức nội bộ.
          </Typography>
        </Box>
        {tabValue === 0 && (
          <Button variant="contained" color="error" startIcon={<MdAdd />} onClick={() => setCreateDialogOpen(true)}>
            Khai Báo Sự Cố Mới
          </Button>
        )}
      </Box>

      {/* Incident stats banner */}
      {tabValue === 0 && statsData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #ef4444' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Tổng sự vụ đã nhận</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>{statsData.totalIncidents}</Typography>
                <Typography variant="caption" color="text.secondary">Ghi nhận trong tháng</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Sự cố đang xử lý</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>{statsData.activeIncidents}</Typography>
                <Typography variant="caption" color="warning.main">Cần khắc phục khẩn cấp</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Đã khắc phục xong</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>{statsData.resolvedIncidents}</Typography>
                <Typography variant="caption" color="success.main">Tỷ lệ đóng vụ việc cao</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #3b82f6' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Thời gian xử lý TB</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>{statsData.averageResolutionTimeMinutes} phút</Typography>
                <Typography variant="caption" color="text.secondary">Đội ứng phó cơ động</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tab label="Nhật Trình Khắc Phục Sự Cố" />
        <Tab label="Cẩm Nang Hướng Dẫn & FAQ (Knowledge Base)" />
      </Tabs>

      {/* TABS */}
      {tabValue === 0 && incidentsData && (
        <IncidentTable
          incidents={incidentsData.content}
          totalElements={incidentsData.totalElements}
          page={incPage}
          size={incSize}
          onPageChange={setIncPage}
          onSizeChange={setIncSize}
          onUpdateStatus={async (id, status, notes) => {
            await updateIncidentStatus({ id, status, notes, updatedBy: 'Admin' }).unwrap();
            refetchIncidents();
            refetchStats();
          }}
          onResolve={async (id, cause, corr, prev) => {
            await resolveIncident({ id, rootCause: cause, correctiveAction: corr, preventiveAction: prev }).unwrap();
            refetchIncidents();
            refetchStats();
          }}
          onDelete={async (id) => {
            if (window.confirm('Bạn muốn xóa báo cáo sự cố này?')) {
              await deleteIncident(id).unwrap();
              refetchIncidents();
              refetchStats();
            }
          }}
        />
      )}

      {tabValue === 1 && kbData && (
        <KBTable
          articles={kbData.content}
          totalElements={kbData.totalElements}
          page={kbPage}
          size={kbSize}
          onPageChange={setKbPage}
          onSizeChange={setKbSize}
          onCreate={async (values) => {
            await createArticle(values).unwrap();
            refetchKb();
          }}
          onUpdate={async (id, data) => {
            await updateArticle({ id, data }).unwrap();
            refetchKb();
          }}
          onDelete={async (id) => {
            if (window.confirm('Bạn chắc chắn muốn xóa bài hướng dẫn này?')) {
              await deleteArticle(id).unwrap();
              refetchKb();
            }
          }}
        />
      )}

      {/* Create Incident Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Khai báo sự vụ khẩn cấp</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Tiêu đề sự cố"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Loại sự cố</InputLabel>
                <Select
                  value={newType}
                  label="Loại sự cố"
                  onChange={(e) => setNewType(e.target.value as IncidentType)}
                >
                  <MenuItem value="RIDE_BREAKDOWN">Hỏng hóc thiết bị trò chơi</MenuItem>
                  <MenuItem value="POWER_FAILURE">Mất điện nguồn / Trạm biến áp</MenuItem>
                  <MenuItem value="MEDICAL_EMERGENCY">Hỗ trợ sơ cứu y tế</MenuItem>
                  <MenuItem value="LOST_CHILD">Tìm trẻ lạc</MenuItem>
                  <MenuItem value="LOST_PROPERTY">Mất mát / Thất lạc đồ đạc</MenuItem>
                  <MenuItem value="SECURITY">Gây rối an ninh trật tự</MenuItem>
                  <MenuItem value="WEATHER">Thời tiết xấu / Bão lụt</MenuItem>
                  <MenuItem value="OTHER">Sự cố vận hành khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Mức độ nghiêm trọng</InputLabel>
                <Select
                  value={newSeverity}
                  label="Mức độ nghiêm trọng"
                  onChange={(e) => setNewSeverity(e.target.value as IncidentSeverity)}
                >
                  <MenuItem value="LOW">Thấp (Low)</MenuItem>
                  <MenuItem value="MEDIUM">Trung bình (Medium)</MenuItem>
                  <MenuItem value="HIGH">Cao (High)</MenuItem>
                  <MenuItem value="CRITICAL">Nguy kịch (Critical)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Phạm vi ảnh hưởng</InputLabel>
                <Select
                  value={newImpact}
                  label="Phạm vi ảnh hưởng"
                  onChange={(e) => setNewImpact(e.target.value as IncidentImpact)}
                >
                  <MenuItem value="INDIVIDUAL">Cá nhân một vài khách</MenuItem>
                  <MenuItem value="VENUE">Toàn bộ một phân khu</MenuItem>
                  <MenuItem value="PARK_WIDE">Toàn bộ đại công viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Địa điểm xảy ra sự cố chi tiết"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                fullWidth
                required
                placeholder="e.g. Lối xếp hàng đu quay cảm giác mạnh khu B"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Tên người báo cáo"
                value={newReporter}
                onChange={(e) => setNewReporter(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="SĐT / Cách thức liên hệ"
                value={newReporterContact}
                onChange={(e) => setNewReporterContact(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Mô tả sự việc chi tiết"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                multiline
                rows={4}
                fullWidth
                placeholder="Nêu rõ diễn biến sự việc, số lượng người gặp nạn, tình trạng hiện tại..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Hủy Bỏ</Button>
          <Button
            onClick={handleCreateIncidentSubmit}
            variant="contained"
            color="error"
            disabled={!newTitle.trim() || !newLocation.trim()}
          >
            Báo Cáo Sự Cố
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default IncidentPage;
