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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
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
        title="Loyalty & Memberships"
        subtitle="Configure guest tiers, privileges, points rules, and customer memberships"
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
                Assign Membership
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
                Create Tier
              </Button>
            )}
          </PermissionWrapper>
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Customer Memberships" id="membership-tab-0" />
          <Tab label="Membership Tiers & Rules" id="membership-tab-1" />
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
              placeholder="Search member name or card code..."
              onClear={() => setSearch('')}
            >
              <TextField
                select
                label="Filter Tier"
                size="small"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All Tiers</MenuItem>
                {tiers.map((t) => (
                  <MenuItem key={t.id} value={t.name}>
                    {t.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Filter Status"
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="EXPIRED">Expired</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>

              <TextField
                type="number"
                label="Min Points"
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
                setDetailsModalOpen(true);
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
                    setDetailsModalOpen(true);
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
          {selectedMem ? 'Edit Membership Assignment' : 'Assign New Membership'}
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
          {selectedTier ? `Configure Tier: ${selectedTier.name}` : 'Create Membership Tier'}
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
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedMem(null);
          setSelectedTier(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {selectedMem ? 'Customer Membership Profile' : `Membership Tier Details`}
          </Typography>
          <IconButton
            onClick={() => {
              setDetailsModalOpen(false);
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
                      CUSTOMER PROFILE
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
                      <strong>Card Code:</strong> {selectedMem.membershipCode}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Points:</strong> {selectedMem.points}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Status:</strong> {selectedMem.status}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Join Date:</strong> {selectedMem.joinDate}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Expiration Date:</strong> {selectedMem.expirationDate || 'Lifetime'}
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
                      Loading Tier configuration rules...
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
        title="Revoke / Delete Membership"
        description={`Are you sure you want to cancel the membership for ${memToDelete?.customerName}? This will forfeit all earned loyalty points (${memToDelete?.points}) and benefits.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setMemToDelete(null);
        }}
      />
    </Box>
  );
};
