import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Drawer,
  Typography,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
} from '@mui/material';
import { MdAdd, MdFormatListBulleted, MdGridView } from 'react-icons/md';
import {
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} from '../services/promotionApi';
import { useGetCampaignsQuery } from '../../campaign/services/campaignApi';
import PromotionTable from '../components/PromotionTable';
import PromotionCard from '../components/PromotionCard';
import PromotionForm from '../components/PromotionForm';
import PromotionDetails from '../components/PromotionDetails';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import { toast } from 'react-toastify';
import { Promotion } from '../types';

export const PromotionListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [search, setSearch] = useState('');
  const [campaignId, setCampaignId] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const { data } = useGetPromotionsQuery({
    search,
    campaignId: campaignId ? Number(campaignId) : undefined,
    status: status || undefined,
    page: 0,
    size: 10,
  });

  const { data: campaignList } = useGetCampaignsQuery({});
  const campaigns = campaignList?.content || [];

  const [createPromotion] = useCreatePromotionMutation();
  const [updatePromotion] = useUpdatePromotionMutation();
  const [deletePromotion] = useDeletePromotionMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);

  const handleCreate = async (values: any) => {
    try {
      // Find campaign name
      const camp = campaigns.find((c) => c.id === values.campaignId);
      const payload = {
        ...values,
        campaignName: camp ? camp.name : 'General Promotions',
      };
      await createPromotion(payload).unwrap();
      toast.success('Da tao khuyen mai thanh cong!');
      setFormOpen(false);
    } catch (err) {
      toast.error('Loi khi tao khuyen mai.');
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedPromotion) return;
    try {
      const camp = campaigns.find((c) => c.id === values.campaignId);
      const payload = {
        ...values,
        campaignName: camp ? camp.name : 'General Promotions',
      };
      await updatePromotion({ id: selectedPromotion.id, body: payload }).unwrap();
      toast.success('Da cap nhat khuyen mai thanh cong!');
      setFormOpen(false);
      setSelectedPromotion(null);
    } catch (err) {
      toast.error('Loi khi cap nhat khuyen mai.');
    }
  };

  const handleStatusChange = async (p: Promotion, newStatus: Promotion['status']) => {
    try {
      await updatePromotion({ id: p.id, body: { status: newStatus } }).unwrap();
      toast.success(`Da cap nhat trang thai thanh ${newStatus}`);
    } catch (err) {
      toast.error('Loi khi cap nhat trang thai.');
    }
  };

  const handleDelete = async () => {
    if (!promotionToDelete) return;
    try {
      await deletePromotion(promotionToDelete.id).unwrap();
      toast.success('Da xoa khuyen mai thanh cong!');
      setDeleteConfirmOpen(false);
      setPromotionToDelete(null);
    } catch (err) {
      toast.error('Loi khi xoa khuyen mai.');
    }
  };

  const promotions = data?.content || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Quan Ly Khuyen Mai (Promotions)
        </Typography>
        {activeTab === 0 && (
          <PermissionWrapper requiredPermission="write:promotions">
            <Button
              variant="contained"
              startIcon={<MdAdd />}
              onClick={() => {
                setSelectedPromotion(null);
                setFormOpen(true);
              }}
            >
              Tao Khuyen Mai Moi
            </Button>
          </PermissionWrapper>
        )}
      </Box>

      <Tabs value={activeTab} onChange={(_e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label="Danh sach khuyen mai" />
        <Tab label="Phan tich so lieu (Analytics)" />
      </Tabs>

      {activeTab === 0 && (
        <>
          {/* Filters & Toggles */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                label="Tim kiem..."
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 260 }}
              />
              <TextField
                select
                label="Chien dich"
                variant="outlined"
                size="small"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">Tat ca chien dich</MenuItem>
                {campaigns.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Trang thai"
                variant="outlined"
                size="small"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="">Tat ca trang thai</MenuItem>
                <MenuItem value="DRAFT">Nhao</MenuItem>
                <MenuItem value="SCHEDULED">Da len lich</MenuItem>
                <MenuItem value="ACTIVE">Hoat dong</MenuItem>
                <MenuItem value="PAUSED">Tam dung</MenuItem>
                <MenuItem value="EXPIRED">Het han</MenuItem>
                <MenuItem value="ARCHIVED">Luu tru</MenuItem>
                <MenuItem value="CANCELLED">Huy</MenuItem>
              </TextField>
            </Box>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_e, val) => val && setViewMode(val)}
              size="small"
            >
              <ToggleButton value="table">
                <MdFormatListBulleted />
              </ToggleButton>
              <ToggleButton value="grid">
                <MdGridView />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* List Content */}
          {viewMode === 'table' ? (
            <PromotionTable
              promotions={promotions}
              onView={(p) => {
                setSelectedPromotion(p);
                setDetailsOpen(true);
              }}
              onEdit={(p) => {
                setSelectedPromotion(p);
                setFormOpen(true);
              }}
              onStatusChange={handleStatusChange}
              onDelete={(p) => {
                setPromotionToDelete(p);
                setDeleteConfirmOpen(true);
              }}
            />
          ) : (
            <Grid container spacing={3}>
              {promotions.map((p) => (
                <Grid item xs={12} sm={6} md={4} key={p.id}>
                  <PromotionCard
                    promotion={p}
                    onViewDetails={(p) => {
                      setSelectedPromotion(p);
                      setDetailsOpen(true);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 1 && <AnalyticsDashboard />}

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {selectedPromotion ? 'Cap nhat Khuyen mai' : 'Tao Khuyen mai Moi'}
        </DialogTitle>
        <DialogContent>
          <PromotionForm
            initialValues={selectedPromotion || undefined}
            onSubmit={selectedPromotion ? handleUpdate : handleCreate}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Details Drawer */}
      <Drawer anchor="right" open={detailsOpen} onClose={() => setDetailsOpen(false)}>
        <Box sx={{ width: { xs: '100vw', sm: 500, md: 600 }, p: 3 }}>
          {selectedPromotion && <PromotionDetails promotion={selectedPromotion} />}
        </Box>
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Xac nhan xoa khuyen mai"
        message={`Ban co chac muon xoa khuyen mai "${promotionToDelete?.name}"? Hanh dong nay khong the hoan tac.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
};
export default PromotionListPage;
