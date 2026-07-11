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
} from '@mui/material';
import { MdAdd } from 'react-icons/md';
import {
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} from '../services/campaignApi';
import CampaignTable from '../components/CampaignTable';
import CampaignForm from '../components/CampaignForm';
import CampaignDetails from '../components/CampaignDetails';
import CampaignStatistics from '../components/CampaignStatistics';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import { toast } from 'react-toastify';
import { Campaign } from '../types';

export const CampaignListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data } = useGetCampaignsQuery({
    search,
    status,
    page: 0,
    size: 10,
  });

  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [deleteCampaign] = useDeleteCampaignMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  const handleCreate = async (values: any) => {
    try {
      await createCampaign(values).unwrap();
      toast.success('Da tao chien dich thanh cong!');
      setFormOpen(false);
    } catch (err) {
      toast.error('Loi khi tao chien dich.');
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedCampaign) return;
    try {
      await updateCampaign({ id: selectedCampaign.id, body: values }).unwrap();
      toast.success('Da cap nhat chien dich thanh cong!');
      setFormOpen(false);
      setSelectedCampaign(null);
    } catch (err) {
      toast.error('Loi khi cap nhat chien dich.');
    }
  };

  const handleDelete = async () => {
    if (!campaignToDelete) return;
    try {
      await deleteCampaign(campaignToDelete.id).unwrap();
      toast.success('Da xoa chien dich thanh cong!');
      setDeleteConfirmOpen(false);
      setCampaignToDelete(null);
    } catch (err) {
      toast.error('Loi khi xoa chien dich.');
    }
  };

  const campaigns = data?.content || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Quan Ly Chien Dich (Campaigns)
        </Typography>
        <PermissionWrapper requiredPermission="write:promotions">
          <Button
            variant="contained"
            startIcon={<MdAdd />}
            onClick={() => {
              setSelectedCampaign(null);
              setFormOpen(true);
            }}
          >
            Tao Chien Dich Moi
          </Button>
        </PermissionWrapper>
      </Box>

      {/* Statistics */}
      <CampaignStatistics campaigns={campaigns} />

      {/* Filter panel */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
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
          label="Trang thai"
          variant="outlined"
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Tat ca</MenuItem>
          <MenuItem value="DRAFT">Nhao</MenuItem>
          <MenuItem value="ACTIVE">Hoat dong</MenuItem>
          <MenuItem value="PAUSED">Tam dung</MenuItem>
          <MenuItem value="COMPLETED">Da hoan thanh</MenuItem>
        </TextField>
      </Box>

      {/* Main Table */}
      <CampaignTable
        campaigns={campaigns}
        onView={(c) => {
          setSelectedCampaign(c);
          setDetailsOpen(true);
        }}
        onEdit={(c) => {
          setSelectedCampaign(c);
          setFormOpen(true);
        }}
        onDelete={(c) => {
          setCampaignToDelete(c);
          setDeleteConfirmOpen(true);
        }}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {selectedCampaign ? 'Cap nhat Chien dich' : 'Tao Chien dich Moi'}
        </DialogTitle>
        <DialogContent>
          <CampaignForm
            initialValues={selectedCampaign || undefined}
            onSubmit={selectedCampaign ? handleUpdate : handleCreate}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Drawer */}
      <Drawer anchor="right" open={detailsOpen} onClose={() => setDetailsOpen(false)}>
        <Box sx={{ width: { xs: '100vw', sm: 500, md: 600 }, p: 3 }}>
          {selectedCampaign && <CampaignDetails campaign={selectedCampaign} />}
        </Box>
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Xac nhan xoa chien dich"
        message={`Ban co chac muon xoa chien dich "${campaignToDelete?.name}"? Hanh dong nay khong the hoan tac.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
};
export default CampaignListPage;
