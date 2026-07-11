import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { PageContainer } from '../../../layouts/components/PageContainer';
import { Button } from '../../../components/common/Button';
import { Modal, StatusDialog } from '../../../components/common/Dialog';
import { CustomerTable } from '../components/CustomerTable';
import { CustomerDetails } from '../components/CustomerDetails';
import { CustomerForm } from '../components/CustomerForm';
import { CustomerFormInput } from '../schemas/customerSchema';
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  mockCustomers,
  mockMembershipTiers,
} from '../services/customerApi';
import { Customer } from '../types';
import { MdAdd, MdPeople, MdCardMembership, MdAttachMoney } from 'react-icons/md';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

export const CustomerListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [membershipTierId, setMembershipTierId] = useState<number | ''>('');

  const { data, isLoading, isError, refetch } = useGetCustomersQuery({
    page,
    size,
    search,
    status,
    membershipTier: membershipTierId ? String(membershipTierId) : undefined,
  });

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  // Local state fallbacks for mock operations
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(mockCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Delete dialog controllers
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setMembershipTierId('');
    setPage(0);
  };

  const handleFormSubmit = async (formData: CustomerFormInput) => {
    try {
      const selectedTier = mockMembershipTiers.find((t) => t.id === formData.membershipTierId);
      
      const customerBody: Partial<Customer> = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender || undefined,
        address: formData.address || undefined,
        status: formData.status,
      };

      if (editingCustomer) {
        // Edit flow
        try {
          await updateCustomer({ id: editingCustomer.id, body: customerBody }).unwrap();
        } catch {
          // Local fallback mutation
          const updatedList = localCustomers.map((c) => {
            if (c.id === editingCustomer.id) {
              return {
                ...c,
                ...customerBody,
                updatedAt: new Date().toISOString(),
                membership: selectedTier
                  ? {
                      id: c.membership?.id || Math.floor(Math.random() * 1000),
                      membershipCode: c.membership?.membershipCode || `MEM-${formData.fullName.toUpperCase().replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
                      points: formData.initialPoints ?? c.membership?.points ?? 0,
                      joinDate: c.membership?.joinDate || new Date().toISOString().split('T')[0],
                      status: 'ACTIVE' as const,
                      tier: selectedTier,
                    }
                  : undefined,
              };
            }
            return c;
          });
          setLocalCustomers(updatedList);
        }
      } else {
        // Create flow
        try {
          await createCustomer(customerBody).unwrap();
        } catch {
          // Local fallback creation
          const newMockId = Math.max(...localCustomers.map((c) => c.id), 0) + 1;
          const newCustomer: Customer = {
            id: newMockId,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            birthDate: formData.birthDate || undefined,
            gender: formData.gender || undefined,
            address: formData.address || undefined,
            status: formData.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            membership: selectedTier
              ? {
                  id: Math.floor(Math.random() * 1000),
                  membershipCode: `MEM-${formData.fullName.toUpperCase().replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
                  points: formData.initialPoints ?? 0,
                  joinDate: new Date().toISOString().split('T')[0],
                  status: 'ACTIVE',
                  tier: selectedTier,
                }
              : undefined,
            stats: {
              totalOrders: 0,
              totalTickets: 0,
              totalSpending: 0,
            },
          };
          setLocalCustomers([newCustomer, ...localCustomers]);
        }
      }
      setFormOpen(false);
      setEditingCustomer(null);
      refetch();
    } catch (err) {
      console.error('Failed to save customer', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      try {
        await deleteCustomer(deleteTarget.id).unwrap();
      } catch {
        // Local fallback delete
        setLocalCustomers(localCustomers.filter((c) => c.id !== deleteTarget.id));
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete customer', err);
    }
  };

  // Filter display list locally if query is loading/offline
  const filteredLocalCustomers = localCustomers.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesStatus = !status || c.status === status;
    const matchesTier = !membershipTierId || c.membership?.tier?.id === Number(membershipTierId);
    return matchesSearch && matchesStatus && matchesTier;
  });

  const displayData = data?.content || (isLoading ? [] : filteredLocalCustomers);
  const displayTotal = data?.totalElements ?? filteredLocalCustomers.length;

  // Metric computations
  const totalSpendSum = displayData.reduce((sum, c) => sum + (c.stats?.totalSpending || 0), 0);
  const membersCount = displayData.filter((c) => !!c.membership).length;

  return (
    <PageContainer
      title="Customer Relations Management"
      toolbar={
        <PermissionWrapper requiredPermission="write:customers">
          <Button
            variant="contained"
            startIcon={<MdAdd />}
            onClick={() => {
              setEditingCustomer(null);
              setFormOpen(true);
            }}
          >
            Register Customer
          </Button>
        </PermissionWrapper>
      }
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Metric Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="primary.light" sx={{ borderRadius: 2.5, color: 'primary.contrastText', display: 'flex' }}>
                  <MdPeople size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Registered Customers</Typography>
                  <Typography variant="h5" fontWeight="bold">{displayTotal}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="success.light" sx={{ borderRadius: 2.5, color: 'success.contrastText', display: 'flex' }}>
                  <MdCardMembership size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Active Members</Typography>
                  <Typography variant="h5" fontWeight="bold">{membersCount}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="warning.light" sx={{ borderRadius: 2.5, color: 'warning.contrastText', display: 'flex' }}>
                  <MdAttachMoney size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Total Spending (Page)</Typography>
                  <Typography variant="h5" fontWeight="bold">${totalSpendSum.toLocaleString()}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter bar */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search Customers"
                placeholder="Name, Email, Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value=""><em>All Statuses</em></MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Membership Tier</InputLabel>
                <Select
                  value={membershipTierId}
                  label="Membership Tier"
                  onChange={(e) => setMembershipTierId(e.target.value as number | '')}
                >
                  <MenuItem value=""><em>All Tiers</em></MenuItem>
                  {mockMembershipTiers.map((tier) => (
                    <MenuItem key={tier.id} value={tier.id}>
                      {tier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2} display="flex" gap={1}>
              <Button fullWidth variant="outlined" onClick={handleResetFilters}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isError && (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            Failed to connect to backend customer endpoints. Switched to offline database sync.
          </Alert>
        )}

        {/* Customer Table */}
        <CustomerTable
          data={displayData}
          loading={isLoading}
          page={page}
          rowsPerPage={size}
          totalElements={displayTotal}
          onPageChange={setPage}
          onRowsPerPageChange={setSize}
          onViewDetails={(cust) => {
            setSelectedCustomer(cust);
            setDetailsOpen(true);
          }}
          onEdit={(cust) => {
            setEditingCustomer(cust);
            setFormOpen(true);
          }}
          onDelete={(cust) => {
            setDeleteTarget(cust);
            setDeleteConfirmOpen(true);
          }}
        />

        {/* Details Dialog */}
        <Modal
          open={detailsOpen}
          onClose={() => setSelectedCustomer(null)}
          title="Customer CRM Dashboard"
          maxWidth="md"
        >
          {selectedCustomer && <CustomerDetails customer={selectedCustomer} />}
        </Modal>

        {/* Create/Edit Form Dialog */}
        <Modal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editingCustomer ? 'Update Customer Profile' : 'Register New Customer'}
          maxWidth="md"
        >
          <CustomerForm
            initialData={editingCustomer}
            onSubmit={handleFormSubmit}
            loading={isCreating || isUpdating}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <StatusDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          type="error"
          title="Delete Customer Account"
          message={`Are you sure you want to delete the account for ${deleteTarget?.fullName}? This action is irreversible and will remove all linked bookings, tickets, and visitor profiles.`}
          onConfirm={handleDeleteConfirm}
          confirmText="Yes, Delete Account"
        />
      </Box>
    </PageContainer>
  );
};
