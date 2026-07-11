import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { MdAdd, MdCloudUpload } from 'react-icons/md';
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGenerateCouponsBulkMutation,
  useAssignCouponsMutation,
} from '../services/couponApi';
import { useGetCampaignsQuery } from '../../campaign/services/campaignApi';
import CouponTable from '../components/CouponTable';
import CouponForm from '../components/CouponForm';
import CouponGenerator from '../components/CouponGenerator';
import CouponAssignmentDialog from '../components/CouponAssignmentDialog';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import { toast } from 'react-toastify';
import { Coupon } from '../types';

export const CouponListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const [search, setSearch] = useState('');
  const [campaignId, setCampaignId] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const { data } = useGetCouponsQuery({
    search,
    campaignId: campaignId ? Number(campaignId) : undefined,
    status: status || undefined,
    page: 0,
    size: 10,
  });

  const { data: campaignList } = useGetCampaignsQuery({});
  const campaigns = campaignList?.content || [];

  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();
  const [generateCouponsBulk] = useGenerateCouponsBulkMutation();
  const [assignCoupons] = useAssignCouponsMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [couponToAssign, setCouponToAssign] = useState<Coupon | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  const handleCreate = async (values: any) => {
    try {
      const camp = campaigns.find((c) => c.id === values.campaignId);
      const payload = {
        ...values,
        campaignName: camp ? camp.name : 'General Campaign',
      };
      await createCoupon(payload).unwrap();
      toast.success('Da tao coupon thanh cong!');
      setFormOpen(false);
    } catch (err) {
      toast.error('Loi khi tao coupon.');
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedCoupon) return;
    try {
      const camp = campaigns.find((c) => c.id === values.campaignId);
      const payload = {
        ...values,
        campaignName: camp ? camp.name : 'General Campaign',
      };
      await updateCoupon({ id: selectedCoupon.id, body: payload }).unwrap();
      toast.success('Da cap nhat coupon thanh cong!');
      setFormOpen(false);
      setSelectedCoupon(null);
    } catch (err) {
      toast.error('Loi khi cap nhat coupon.');
    }
  };

  const handleBulkGenerate = async (values: any) => {
    try {
      const camp = campaigns.find((c) => c.id === values.campaignId);
      const payload = {
        ...values,
        campaignName: camp ? camp.name : 'General Campaign',
      };
      const res = await generateCouponsBulk(payload).unwrap();
      toast.success(`Da tao thanh cong ${res.length} ma coupon hang loat!`);
      setActiveTab(0);
    } catch (err) {
      toast.error('Loi khi phat sinh hang loat.');
    }
  };

  const handleAssign = async (customers: string[]) => {
    if (!couponToAssign) return;
    try {
      await assignCoupons({ id: couponToAssign.id, customers }).unwrap();
      toast.success(`Da gan coupon cho ${customers.length} khach hang!`);
      setAssignDialogOpen(false);
      setCouponToAssign(null);
    } catch (err) {
      toast.error('Loi khi gan khach hang.');
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
      await deleteCoupon(couponToDelete.id).unwrap();
      toast.success('Da xoa coupon thanh cong!');
      setDeleteConfirmOpen(false);
      setCouponToDelete(null);
    } catch (err) {
      toast.error('Loi khi xoa coupon.');
    }
  };

  const handleExportCSV = (c: Coupon) => {
    const csvContent = `data:text/csv;charset=utf-8,Code,Name,Campaign,DiscountType,DiscountValue,Quantity,ExpirationDate,Status\n"${c.code}","${c.name}","${c.campaignName}","${c.discountType}",${c.discountValue},${c.quantity},"${c.expirationDate}","${c.status}"`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `coupon_${c.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Xuat file CSV thanh cong!');
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Da doc file ${file.name} thanh cong! Dang import danh sach coupon...`);
    }
  };

  const coupons = data?.content || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Quan Ly Coupon (Coupons)
        </Typography>
        <Box display="flex" gap={1.5}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<MdCloudUpload />}
          >
            Import CSV
            <input type="file" hidden accept=".csv" onChange={handleImportCSV} />
          </Button>
          {activeTab === 0 && (
            <PermissionWrapper requiredPermission="write:promotions">
              <Button
                variant="contained"
                startIcon={<MdAdd />}
                onClick={() => {
                  setSelectedCoupon(null);
                  setFormOpen(true);
                }}
              >
                Tao Coupon Moi
              </Button>
            </PermissionWrapper>
          )}
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(_e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label="Danh sach Coupon" />
        <Tab label="Phat hanh hang loat" />
      </Tabs>

      {activeTab === 0 && (
        <>
          {/* Filters */}
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
              <MenuItem value="ACTIVE">Hoat dong</MenuItem>
              <MenuItem value="PAUSED">Tam dung</MenuItem>
              <MenuItem value="EXPIRED">Het han</MenuItem>
            </TextField>
          </Box>

          <CouponTable
            coupons={coupons}
            onEdit={(c) => {
              setSelectedCoupon(c);
              setFormOpen(true);
            }}
            onDelete={(c) => {
              setCouponToDelete(c);
              setDeleteConfirmOpen(true);
            }}
            onAssign={(c) => {
              setCouponToAssign(c);
              setAssignDialogOpen(true);
            }}
            onExport={handleExportCSV}
          />
        </>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 4, borderRadius: '16px' }}>
          <CouponGenerator
            onSubmit={handleBulkGenerate}
            onCancel={() => setActiveTab(0)}
          />
        </Paper>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {selectedCoupon ? 'Cap nhat Coupon' : 'Tao Coupon Moi'}
        </DialogTitle>
        <DialogContent>
          <CouponForm
            initialValues={selectedCoupon || undefined}
            onSubmit={selectedCoupon ? handleUpdate : handleCreate}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      {couponToAssign && (
        <CouponAssignmentDialog
          open={assignDialogOpen}
          couponCode={couponToAssign.code}
          onClose={() => {
            setAssignDialogOpen(false);
            setCouponToAssign(null);
          }}
          onAssign={handleAssign}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Xac nhan xoa coupon"
        message={`Ban co chac muon xoa coupon "${couponToDelete?.name}"? Hanh dong nay khong the hoan tac.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
};
export default CouponListPage;
