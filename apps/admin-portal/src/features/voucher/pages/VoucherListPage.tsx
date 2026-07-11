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
      toast.success('Đã tạo voucher thành công!');
      setFormOpen(false);
    } catch (err) {
      toast.error('Lỗi khi tạo voucher.');
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedVoucher) return;
    try {
      await updateVoucher({ id: selectedVoucher.id, body: values }).unwrap();
      toast.success('Đã cập nhật voucher thành công!');
      setFormOpen(false);
      setSelectedVoucher(null);
    } catch (err) {
      toast.error('Lỗi khi cập nhật voucher.');
    }
  };

  const handleRedeem = async (v: Voucher) => {
    try {
      await redeemVoucher(v.id).unwrap();
      toast.success(`Đã sử dụng voucher ${v.code} thành công!`);
    } catch (err) {
      toast.error('Lỗi khi sử dụng voucher.');
    }
  };

  const handleBulkGenerate = async () => {
    if (!bulkExpiration) {
      toast.error('Vui lòng chọn ngày hết hạn cho phát hành hàng loạt.');
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
      toast.success(`Đã tạo thành công ${res.length} voucher hàng loạt!`);
      setActiveTab(0);
    } catch (err) {
      toast.error('Lỗi khi tạo hàng loạt.');
    }
  };

  const handleDelete = async () => {
    if (!voucherToDelete) return;
    try {
      await deleteVoucher(voucherToDelete.id).unwrap();
      toast.success('Đã xóa voucher thành công!');
      setDeleteConfirmOpen(false);
      setVoucherToDelete(null);
    } catch (err) {
      toast.error('Lỗi khi xóa voucher.');
    }
  };

  const vouchers = data?.content || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Quản lý Voucher (Voucher)
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
              Tạo Voucher Mới
            </Button>
          </PermissionWrapper>
        )}
      </Box>

      <Tabs value={activeTab} onChange={(_e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label="Danh sách Voucher" />
        <Tab label="Phát hành hàng loạt" />
      </Tabs>

      {activeTab === 0 && (
        <>
          {/* Filters */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              label="Tìm kiếm..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 260 }}
            />
            <TextField
              select
              label="Loại Voucher"
              variant="outlined"
              size="small"
              value={voucherType}
              onChange={(e) => setVoucherType(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Tất cả các loại</MenuItem>
              <MenuItem value="GIFT">Quà tặng</MenuItem>
              <MenuItem value="CASH">Tiền mặt</MenuItem>
              <MenuItem value="DISCOUNT">Giảm giá</MenuItem>
              <MenuItem value="MEMBERSHIP">Thành viên</MenuItem>
              <MenuItem value="BIRTHDAY">Sinh nhật</MenuItem>
              <MenuItem value="PROMOTION">Khuyến mãi</MenuItem>
              <MenuItem value="REFERRAL">Giới thiệu</MenuItem>
              <MenuItem value="COMPENSATION">Đền bù</MenuItem>
            </TextField>
            <TextField
              select
              label="Trạng thái"
              variant="outlined"
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Tất cả trạng thái</MenuItem>
              <MenuItem value="UNREDEEMED">Chưa sử dụng</MenuItem>
              <MenuItem value="REDEEMED">Đã sử dụng</MenuItem>
              <MenuItem value="EXPIRED">Hết hạn</MenuItem>
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
            Phát sinh hàng loạt các mã voucher ngẫu nhiên cho khách hàng.
          </Typography>
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Loại Voucher *"
                value={bulkType}
                onChange={(e) => setBulkType(e.target.value as any)}
                fullWidth
              >
                <MenuItem value="GIFT">Quà tặng (Gift)</MenuItem>
                <MenuItem value="CASH">Tiền mặt (Cash)</MenuItem>
                <MenuItem value="DISCOUNT">Giảm giá (Discount)</MenuItem>
                <MenuItem value="MEMBERSHIP">Thành viên (Membership)</MenuItem>
                <MenuItem value="BIRTHDAY">Sinh nhật (Birthday)</MenuItem>
                <MenuItem value="PROMOTION">Khuyến mãi (Promotion)</MenuItem>
                <MenuItem value="REFERRAL">Giới thiệu (Referral)</MenuItem>
                <MenuItem value="COMPENSATION">Đền bù (Compensation)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mệnh giá voucher (USD) *"
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(Number(e.target.value))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngày hết hạn *"
                type="date"
                value={bulkExpiration}
                onChange={(e) => setBulkExpiration(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tiền tố (Prefix)"
                value={bulkPrefix}
                onChange={(e) => setBulkPrefix(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Số lượng mã phát sinh hàng loạt *"
                type="number"
                value={bulkCount}
                onChange={(e) => setBulkCount(Number(e.target.value))}
                fullWidth
              />
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button onClick={() => setActiveTab(0)} variant="outlined" color="inherit">
              Hủy
            </Button>
            <Button onClick={handleBulkGenerate} variant="contained">
              Phát sinh voucher
            </Button>
          </Box>
        </Paper>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {selectedVoucher ? 'Cập nhật Voucher' : 'Tạo Voucher Mới'}
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
        title="Xác nhận xóa voucher"
        message={`Bạn có chắc chắn muốn xóa voucher "${voucherToDelete?.code}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
};
export default VoucherListPage;
