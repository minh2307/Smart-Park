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
  Paper,
  Grid,
} from '@mui/material';
import { MdAdd } from 'react-icons/md';
import {
  useGetVouchersQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useGenerateVouchersBulkMutation,
  useRedeemVoucherMutation,
} from '../services/voucherApi';
import VoucherTable from '../components/VoucherTable';
import VoucherForm from '../components/VoucherForm';
import VoucherDetails from '../components/VoucherDetails';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import { toast } from 'react-toastify';
import { Voucher } from '../types';

export const VoucherListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const [search, setSearch] = useState('');
  const [voucherType, setVoucherType] = useState('');
  const [status, setStatus] = useState('');

  const { data } = useGetVouchersQuery({
    search,
    voucherType: voucherType || undefined,
    status: status || undefined,
    page: 0,
    size: 10,
  });

  const [createVoucher] = useCreateVoucherMutation();
  const [updateVoucher] = useUpdateVoucherMutation();
  const [deleteVoucher] = useDeleteVoucherMutation();
  const [generateVouchersBulk] = useGenerateVouchersBulkMutation();
  const [redeemVoucher] = useRedeemVoucherMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);

  // Bulk Generator states
  const [bulkType, setBulkType] = useState<Voucher['voucherType']>('GIFT');
  const [bulkValue, setBulkValue] = useState(10);
  const [bulkExpiration, setBulkExpiration] = useState('');
  const [bulkPrefix, setBulkPrefix] = useState('VOUCH-');
  const [bulkCount, setBulkCount] = useState(10);

  const handleCreate = async (values: any) => {
    try {
      await createVoucher(values).unwrap();
      toast.success('Da tao voucher thanh cong!');
      setFormOpen(false);
    } catch (err) {
      toast.error('Loi khi tao voucher.');
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedVoucher) return;
    try {
      await updateVoucher({ id: selectedVoucher.id, body: values }).unwrap();
      toast.success('Da cap nhat voucher thanh cong!');
      setFormOpen(false);
      setSelectedVoucher(null);
    } catch (err) {
      toast.error('Loi khi cap nhat voucher.');
    }
  };

  const handleRedeem = async (v: Voucher) => {
    try {
      await redeemVoucher(v.id).unwrap();
      toast.success(`Da su dung voucher ${v.code} thanh cong!`);
    } catch (err) {
      toast.error('Loi khi su dung voucher.');
    }
  };

  const handleBulkGenerate = async () => {
    if (!bulkExpiration) {
      toast.error('Vui long chon ngay het han cho phat hanh hang loat.');
      return;
    }
    try {
      const res = await generateVouchersBulk({
        voucherType: bulkType,
        voucherValue: bulkValue,
        expirationDate: bulkExpiration,
        prefix: bulkPrefix,
        count: bulkCount,
      }).unwrap();
      toast.success(`Da tao thanh cong ${res.length} voucher hang loat!`);
      setActiveTab(0);
    } catch (err) {
      toast.error('Loi khi tao hang loat.');
    }
  };

  const handleDelete = async () => {
    if (!voucherToDelete) return;
    try {
      await deleteVoucher(voucherToDelete.id).unwrap();
      toast.success('Da xoa voucher thanh cong!');
      setDeleteConfirmOpen(false);
      setVoucherToDelete(null);
    } catch (err) {
      toast.error('Loi khi xoa voucher.');
    }
  };

  const vouchers = data?.content || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Quan Ly Voucher (Vouchers)
        </Typography>
        {activeTab === 0 && (
          <PermissionWrapper requiredPermission="write:promotions">
            <Button
              variant="contained"
              startIcon={<MdAdd />}
              onClick={() => {
                setSelectedVoucher(null);
                setFormOpen(true);
              }}
            >
              Tao Voucher Moi
            </Button>
          </PermissionWrapper>
        )}
      </Box>

      <Tabs value={activeTab} onChange={(_e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label="Danh sach Voucher" />
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
              label="Loai Voucher"
              variant="outlined"
              size="small"
              value={voucherType}
              onChange={(e) => setVoucherType(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Tat ca loai</MenuItem>
              <MenuItem value="GIFT">Qua tang</MenuItem>
              <MenuItem value="CASH">Tien mat</MenuItem>
              <MenuItem value="DISCOUNT">Giam gia</MenuItem>
              <MenuItem value="MEMBERSHIP">Thanh vien</MenuItem>
              <MenuItem value="BIRTHDAY">Sinh nhat</MenuItem>
              <MenuItem value="PROMOTION">Khuyen mai</MenuItem>
              <MenuItem value="REFERRAL">Gioi thieu</MenuItem>
              <MenuItem value="COMPENSATION">Den bu</MenuItem>
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
              <MenuItem value="UNREDEEMED">Chua su dung</MenuItem>
              <MenuItem value="REDEEMED">Da su dung</MenuItem>
              <MenuItem value="EXPIRED">Het han</MenuItem>
            </TextField>
          </Box>

          <VoucherTable
            vouchers={vouchers}
            onView={(v) => {
              setSelectedVoucher(v);
              setDetailsOpen(true);
            }}
            onEdit={(v) => {
              setSelectedVoucher(v);
              setFormOpen(true);
            }}
            onRedeem={handleRedeem}
            onDelete={(v) => {
              setVoucherToDelete(v);
              setDeleteConfirmOpen(true);
            }}
          />
        </>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 4, borderRadius: '16px' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Phat sinh hang loat cac code voucher ngau nhien cho khach hang.
          </Typography>
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Loai Voucher *"
                value={bulkType}
                onChange={(e) => setBulkType(e.target.value as any)}
                fullWidth
              >
                <MenuItem value="GIFT">Qua tang (Gift)</MenuItem>
                <MenuItem value="CASH">Tien mat (Cash)</MenuItem>
                <MenuItem value="DISCOUNT">Giam gia (Discount)</MenuItem>
                <MenuItem value="MEMBERSHIP">Thanh vien (Membership)</MenuItem>
                <MenuItem value="BIRTHDAY">Sinh nhat (Birthday)</MenuItem>
                <MenuItem value="PROMOTION">Khuyen mai (Promotion)</MenuItem>
                <MenuItem value="REFERRAL">Gioi thieu (Referral)</MenuItem>
                <MenuItem value="COMPENSATION">Den bu (Compensation)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Menh gia voucher (USD) *"
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(Number(e.target.value))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngay het han *"
                type="date"
                value={bulkExpiration}
                onChange={(e) => setBulkExpiration(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tien to (Prefix)"
                value={bulkPrefix}
                onChange={(e) => setBulkPrefix(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="So luong code phat sinh hang loat *"
                type="number"
                value={bulkCount}
                onChange={(e) => setBulkCount(Number(e.target.value))}
                fullWidth
              />
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button onClick={() => setActiveTab(0)} variant="outlined" color="inherit">
              Huy
            </Button>
            <Button onClick={handleBulkGenerate} variant="contained">
              Phat sinh voucher
            </Button>
          </Box>
        </Paper>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {selectedVoucher ? 'Cap nhat Voucher' : 'Tao Voucher Moi'}
        </DialogTitle>
        <DialogContent>
          <VoucherForm
            initialValues={selectedVoucher || undefined}
            onSubmit={selectedVoucher ? handleUpdate : handleCreate}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Details Drawer */}
      <Drawer anchor="right" open={detailsOpen} onClose={() => setDetailsOpen(false)}>
        <Box sx={{ width: { xs: '100vw', sm: 500, md: 600 }, p: 3 }}>
          {selectedVoucher && <VoucherDetails voucher={selectedVoucher} />}
        </Box>
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Xac nhan xoa voucher"
        message={`Ban co chac muon xoa voucher "${voucherToDelete?.code}"? Hanh dong nay khong the hoan tac.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
};
export default VoucherListPage;
