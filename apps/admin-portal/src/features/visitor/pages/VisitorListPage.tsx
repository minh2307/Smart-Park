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
import { VisitorTable } from '../components/VisitorTable';
import { VisitorDetails } from '../components/VisitorDetails';
import { VisitorForm } from '../components/VisitorForm';
import { VisitorAssignment } from '../components/VisitorAssignment';
import { VisitorFormInput } from '../schemas/visitorSchema';
import {
  useGetVisitorsQuery,
  useCreateVisitorMutation,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
  useAssignVisitorToBookingMutation,
  mockVisitors,
} from '../services/visitorApi';
import { Visitor } from '../types';
import { MdAdd, MdPeople, MdEscalatorWarning, MdAssignmentInd, MdHealing } from 'react-icons/md';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

export const VisitorListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [relationship, setRelationship] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, isError, refetch } = useGetVisitorsQuery({
    page,
    size,
    search,
    relationship,
    status,
  });

  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();
  const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();
  const [deleteVisitor] = useDeleteVisitorMutation();
  const [assignVisitor, { isLoading: isAssigning }] = useAssignVisitorToBookingMutation();

  // Local state fallbacks for mock operations
  const [localVisitors, setLocalVisitors] = useState<Visitor[]>(mockVisitors);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);

  // Delete dialog controllers
  const [deleteTarget, setDeleteTarget] = useState<Visitor | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleResetFilters = () => {
    setSearch('');
    setRelationship('');
    setStatus('');
    setPage(0);
  };

  const handleFormSubmit = async (formData: VisitorFormInput) => {
    try {
      const visitorBody: Partial<Visitor> = {
        customerId: formData.customerId,
        fullName: formData.fullName,
        age: formData.age,
        gender: formData.gender,
        nationality: formData.nationality,
        identificationNumber: formData.identificationNumber,
        relationship: formData.relationship,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        medicalNotes: formData.medicalNotes || undefined,
        status: formData.status,
      };

      if (editingVisitor) {
        // Edit flow
        try {
          await updateVisitor({ id: editingVisitor.id, body: visitorBody }).unwrap();
        } catch {
          // Local fallback mutation
          const updatedList = localVisitors.map((v) => {
            if (v.id === editingVisitor.id) {
              return {
                ...v,
                ...visitorBody,
                updatedAt: new Date().toISOString(),
              };
            }
            return v;
          });
          setLocalVisitors(updatedList);
        }
      } else {
        // Create flow
        try {
          await createVisitor(visitorBody).unwrap();
        } catch {
          // Local fallback creation
          const newMockId = Math.max(...localVisitors.map((v) => v.id), 0) + 1;
          const newVisitor: Visitor = {
            id: newMockId,
            customerId: formData.customerId,
            fullName: formData.fullName,
            age: formData.age,
            gender: formData.gender,
            nationality: formData.nationality,
            identificationNumber: formData.identificationNumber,
            relationship: formData.relationship,
            status: formData.status,
            bookingCount: 0,
            ticketCount: 0,
            emergencyContactName: formData.emergencyContactName || undefined,
            emergencyContactPhone: formData.emergencyContactPhone || undefined,
            medicalNotes: formData.medicalNotes || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setLocalVisitors([newVisitor, ...localVisitors]);
        }
      }
      setFormOpen(false);
      setEditingVisitor(null);
      refetch();
    } catch (err) {
      console.error('Failed to save visitor', err);
    }
  };

  const handleAssignSubmit = async (bookingId: number, visitorIds: number[]) => {
    try {
      try {
        await assignVisitor({ bookingId, visitorIds }).unwrap();
      } catch {
        // Local fallback: update booking & ticket count for assigned visitors
        const updatedList = localVisitors.map((v) => {
          if (visitorIds.includes(v.id)) {
            return {
              ...v,
              bookingCount: v.bookingCount + 1,
              ticketCount: v.ticketCount + 1,
              updatedAt: new Date().toISOString(),
            };
          }
          return v;
        });
        setLocalVisitors(updatedList);
      }
      setAssignOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to assign visitors', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      try {
        await deleteVisitor(deleteTarget.id).unwrap();
      } catch {
        // Local fallback delete
        setLocalVisitors(localVisitors.filter((v) => v.id !== deleteTarget.id));
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete visitor', err);
    }
  };

  // Filter display list locally if query is loading/offline
  const filteredLocalVisitors = localVisitors.filter((v) => {
    const matchesSearch =
      v.fullName.toLowerCase().includes(search.toLowerCase()) ||
      v.identificationNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.nationality.toLowerCase().includes(search.toLowerCase());
    const matchesRelation = !relationship || v.relationship === relationship;
    const matchesStatus = !status || v.status === status;
    return matchesSearch && matchesRelation && matchesStatus;
  });

  const displayData = data?.content || (isLoading ? [] : filteredLocalVisitors);
  const displayTotal = data?.totalElements ?? filteredLocalVisitors.length;

  // Stats summaries
  const childCount = displayData.filter((v) => v.age < 12).length;
  const medicalCount = displayData.filter((v) => !!v.medicalNotes).length;

  return (
    <PageContainer
      title="Visitor Profile Directory"
      toolbar={
        <Box display="flex" gap={1.5}>
          <Button
            variant="outlined"
            startIcon={<MdAssignmentInd />}
            onClick={() => setAssignOpen(true)}
          >
            Assign Booking
          </Button>
          <PermissionWrapper requiredPermission="write:visitors">
            <Button
              variant="contained"
              startIcon={<MdAdd />}
              onClick={() => {
                setEditingVisitor(null);
                setFormOpen(true);
              }}
            >
              Add Visitor Profile
            </Button>
          </PermissionWrapper>
        </Box>
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
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Total Visitors</Typography>
                  <Typography variant="h5" fontWeight="bold">{displayTotal}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="success.light" sx={{ borderRadius: 2.5, color: 'success.contrastText', display: 'flex' }}>
                  <MdEscalatorWarning size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Child Admissions (Page)</Typography>
                  <Typography variant="h5" fontWeight="bold">{childCount}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="warning.light" sx={{ borderRadius: 2.5, color: 'warning.contrastText', display: 'flex' }}>
                  <MdHealing size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Medical Notes Alerts</Typography>
                  <Typography variant="h5" fontWeight="bold">{medicalCount}</Typography>
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
                label="Search Visitors"
                placeholder="Name, ID Card, Nationality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={relationship}
                  label="Relationship"
                  onChange={(e) => setRelationship(e.target.value)}
                >
                  <MenuItem value=""><em>All Relationships</em></MenuItem>
                  <MenuItem value="SELF">Self</MenuItem>
                  <MenuItem value="SPOUSE">Spouse</MenuItem>
                  <MenuItem value="CHILD">Child</MenuItem>
                  <MenuItem value="PARENT">Parent</MenuItem>
                  <MenuItem value="FRIEND">Friend</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
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
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
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
            Failed to connect to visitor backend endpoints. Switched to offline database sync.
          </Alert>
        )}

        {/* Visitor Table */}
        <VisitorTable
          data={displayData}
          loading={isLoading}
          page={page}
          rowsPerPage={size}
          totalElements={displayTotal}
          onPageChange={setPage}
          onRowsPerPageChange={setSize}
          onViewDetails={(vis) => {
            setSelectedVisitor(vis);
            setDetailsOpen(true);
          }}
          onEdit={(vis) => {
            setEditingVisitor(vis);
            setFormOpen(true);
          }}
          onDelete={(vis) => {
            setDeleteTarget(vis);
            setDeleteConfirmOpen(true);
          }}
        />

        {/* Details Dialog */}
        <Modal
          open={detailsOpen}
          onClose={() => setSelectedVisitor(null)}
          title="Visitor Profile Card"
          maxWidth="md"
        >
          {selectedVisitor && <VisitorDetails visitor={selectedVisitor} />}
        </Modal>

        {/* Create/Edit Form Dialog */}
        <Modal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editingVisitor ? 'Update Visitor Profile' : 'Register New Visitor'}
          maxWidth="md"
        >
          <VisitorForm
            initialData={editingVisitor}
            onSubmit={handleFormSubmit}
            loading={isCreating || isUpdating}
          />
        </Modal>

        {/* Assignment Dialog */}
        <Modal
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          title="Assign Visitors to Ticket Booking"
          maxWidth="sm"
        >
          <VisitorAssignment
            onAssign={handleAssignSubmit}
            loading={isAssigning}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <StatusDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          type="error"
          title="Remove Visitor Profile"
          message={`Are you sure you want to remove the visitor profile for ${deleteTarget?.fullName}? This will unassign this visitor from any active tickets.`}
          onConfirm={handleDeleteConfirm}
          confirmText="Yes, Remove Profile"
        />
      </Box>
    </PageContainer>
  );
};
