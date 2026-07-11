import React, { useState } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  Divider,
} from '@mui/material';
import { MdAdd, MdClose } from 'react-icons/md';
import {
  useGetMembershipTiersQuery,
  useCreateMembershipTierMutation,
  useUpdateMembershipTierMutation,
  useGetMembershipsQuery,
  useCreateMembershipMutation,
  useUpdateMembershipMutation,
  useDeleteMembershipMutation,
} from '../services/membershipApi';
import { Membership, MembershipTier } from '../types';
import { MembershipTable } from '../components/MembershipTable';
import { MembershipForm, MembershipTierForm } from '../components/MembershipForm';
import { MembershipCard } from '../components/MembershipCard';
import { MembershipStatistics } from '../components/MembershipStatistics';
import { MembershipDetails } from '../components/MembershipDetails';
import { SearchPanel } from '../../../shared/components/SearchPanel';
import { Toolbar } from '../../../shared/components/Toolbar';
import { DeleteDialog } from '../../../shared/components/DeleteDialog';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

export const MembershipListPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Search & Filter states for Memberships
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minPoints, setMinPoints] = useState<number | ''>('');
  const page = 0;

  // Modal / Drawer open states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedMem, setSelectedMem] = useState<Membership | null>(null);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memToDelete, setMemToDelete] = useState<Membership | null>(null);

  // Queries & Mutations
  const { data: tiers = [] } = useGetMembershipTiersQuery();
  const { data: membershipData, isLoading: membershipsLoading } = useGetMembershipsQuery({
    page,
    size: 10,
    search,
    tier: tierFilter,
    status: statusFilter,
    minPoints: minPoints || undefined,
  });

  const [createMembership] = useCreateMembershipMutation();
  const [updateMembership] = useUpdateMembershipMutation();
  const [deleteMembership] = useDeleteMembershipMutation();

  const [createTier] = useCreateMembershipTierMutation();
  const [updateTier] = useUpdateMembershipTierMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAssignSubmit = async (values: any) => {
    try {
      if (selectedMem) {
        await updateMembership({ id: selectedMem.id, body: values }).unwrap();
      } else {
        await createMembership(values).unwrap();
      }
      setAssignModalOpen(false);
      setSelectedMem(null);
    } catch (err) {
      console.error('Failed to submit membership:', err);
    }
  };

  const handleTierSubmit = async (values: any) => {
    try {
      if (selectedTier) {
        await updateTier({ id: selectedTier.id, body: values }).unwrap();
      } else {
        await createTier(values).unwrap();
      }
      setTierModalOpen(false);
      setSelectedTier(null);
    } catch (err) {
      console.error('Failed to submit tier:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (memToDelete) {
      try {
        await deleteMembership(memToDelete.id).unwrap();
        setDeleteDialogOpen(false);
        setMemToDelete(null);
      } catch (err) {
        console.error('Failed to delete membership:', err);
      }
    }
  };

  // Calculations for stats card
  const totalMembers = tiers.reduce((acc, t) => acc + t.activeMembers, 0);
  const totalPoints = (membershipData?.content || []).reduce((acc, m) => acc + m.points, 0);
  const averageDiscount = tiers.length > 0 ? tiers.reduce((acc, t) => acc + t.discountPercentage, 0) / tiers.length : 0;

  return (
    <Box sx={{ p: 4 }}>
      <Toolbar
        title="Quản lý Thành viên & Điểm thưởng"
        subtitle="Cấu hình phân hạng khách hàng, đặc quyền, quy tắc tích điểm và tài khoản thành viên"
        action={
          <PermissionWrapper requiredPermission="write:memberships">
            {tabValue === 0 ? (
              <Button
                variant="contained"
                startIcon={<MdAdd />}
                onClick={() => {
                  setSelectedMem(null);
                  setAssignModalOpen(true);
                }}
                sx={{ borderRadius: 2 }}
              >
                Cấp thẻ thành viên
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<MdAdd />}
                onClick={() => {
                  setSelectedTier(null);
                  setTierModalOpen(true);
                }}
                sx={{ borderRadius: 2 }}
              >
                Tạo hạng thẻ
              </Button>
            )}
          </PermissionWrapper>
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Tài khoản Thành viên" id="membership-tab-0" />
          <Tab label="Hạng thẻ & Quy tắc" id="membership-tab-1" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <MembershipStatistics
            totalMembers={totalMembers}
            activeTiersCount={tiers.filter((t) => t.status === 'ACTIVE').length}
            totalPoints={totalPoints}
            averageDiscount={averageDiscount}
          />

          <Box sx={{ mt: 4 }}>
            <SearchPanel
              search={search}
              onSearchChange={setSearch}
              placeholder="Tìm tên thành viên hoặc mã thẻ..."
              onClear={() => setSearch('')}
            >
              <TextField
                select
                label="Lọc hạng thẻ"
                size="small"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">Tất cả các hạng</MenuItem>
                {tiers.map((t) => (
                  <MenuItem key={t.id} value={t.name}>
                    {t.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Lọc trạng thái"
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                <MenuItem value="EXPIRED">Đã hết hạn</MenuItem>
                <MenuItem value="SUSPENDED">Tạm khóa</MenuItem>
                <MenuItem value="CANCELLED">Đã hủy</MenuItem>
              </TextField>

              <TextField
                type="number"
                label="Điểm tích lũy tối thiểu"
                size="small"
                value={minPoints}
                onChange={(e) => setMinPoints(e.target.value === '' ? '' : Number(e.target.value))}
                sx={{ minWidth: 120 }}
              />
            </SearchPanel>

            <MembershipTable
              data={membershipData?.content || []}
              loading={membershipsLoading}
              onViewDetails={(m) => {
                setSelectedMem(m);
                setDetailsOpen(true);
              }}
              onEdit={(m) => {
                setSelectedMem(m);
                setAssignModalOpen(true);
              }}
              onDelete={(m) => {
                setMemToDelete(m);
                setDeleteDialogOpen(true);
              }}
            />
          </Box>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Grid container spacing={3}>
            {tiers.map((tier) => (
              <Grid item xs={12} sm={6} md={3} key={tier.id}>
                <MembershipCard
                  tier={tier}
                  onEdit={(t) => {
                    setSelectedTier(t);
                    setTierModalOpen(true);
                  }}
                  onSelect={(t) => {
                    setSelectedTier(t);
                    setDetailsOpen(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Assign Membership Modal */}
      <Dialog
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight="bold">
          {selectedMem ? 'Chỉnh sửa cấp thẻ thành viên' : 'Cấp thẻ thành viên mới'}
        </DialogTitle>
        <DialogContent>
          <MembershipForm
            initialValues={selectedMem || undefined}
            tiers={tiers}
            onSubmit={handleAssignSubmit}
            onCancel={() => setAssignModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Tier Config Modal */}
      <Dialog
        open={tierModalOpen}
        onClose={() => setTierModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight="bold">
          {selectedTier ? `Cấu hình hạng thẻ: ${selectedTier.name}` : 'Tạo hạng thẻ thành viên'}
        </DialogTitle>
        <DialogContent>
          <MembershipTierForm
            initialValues={selectedTier || undefined}
            onSubmit={handleTierSubmit}
            onCancel={() => setTierModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Details View Modal */}
      <Dialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedMem(null);
          setSelectedTier(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {selectedMem ? 'Hồ sơ thành viên khách hàng' : `Chi tiết hạng thẻ thành viên`}
          </Typography>
          <IconButton
            onClick={() => {
              setDetailsOpen(false);
              setSelectedMem(null);
              setSelectedTier(null);
            }}
          >
            <MdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMem && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      THÔNG TIN KHÁCH HÀNG
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {selectedMem.customerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {selectedMem.customerEmail}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {selectedMem.customerPhone}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" gutterBottom>
                      <strong>Mã số thẻ:</strong> {selectedMem.membershipCode}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Điểm tích lũy:</strong> {selectedMem.points}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Trạng thái:</strong> {selectedMem.status === 'ACTIVE' ? 'Đang hoạt động' : selectedMem.status === 'EXPIRED' ? 'Đã hết hạn' : selectedMem.status === 'SUSPENDED' ? 'Tạm khóa' : 'Đã hủy'}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Ngày tham gia:</strong> {selectedMem.joinDate}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Ngày hết hạn:</strong> {selectedMem.expirationDate || 'Vô thời hạn'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                {(() => {
                  const matchingTier = tiers.find((t) => t.id === selectedMem.tierId || t.name === selectedMem.tierName);
                  return matchingTier ? (
                    <MembershipDetails tier={matchingTier} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Đang tải quy tắc cấu hình hạng thẻ...
                    </Typography>
                  );
                })()}
              </Grid>
            </Grid>
          )}

          {selectedTier && <MembershipDetails tier={selectedTier} />}
        </DialogContent>
      </Dialog>

      {/* Delete / Cancel warning Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        title="Thu hồi / Xóa thẻ thành viên"
        description={`Bạn có chắc chắn muốn hủy thẻ thành viên của ${memToDelete?.customerName}? Thao tác này sẽ hủy bỏ toàn bộ số điểm tích lũy (${memToDelete?.points}) và các đặc quyền đi kèm.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setMemToDelete(null);
        }}
      />
    </Box>
  );
};
