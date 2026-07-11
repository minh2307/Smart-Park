import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
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
import { RideTable } from '../components/RideTable';
import { RideDetails } from '../components/RideDetails';
import { RideForm } from '../components/RideForm';
import { RideStatisticsCard } from '../components/RideStatisticsCard';
import { RideFormInput } from '../schemas/rideSchema';
import {
  useGetRidesQuery,
  useCreateRideMutation,
  useUpdateRideMutation,
  useDeleteRideMutation,
  mockRides,
} from '../services/rideApi';
import { mockRideCategories } from '../../ride-category/services/rideCategoryApi';
import { Ride } from '../types';
import { MdAdd } from 'react-icons/md';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

export const RideListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | number>('');
  const [status, setStatus] = useState('');

  const { data, isLoading, isError, refetch } = useGetRidesQuery({
    search,
    rideCategoryId: categoryId || undefined,
    status: status || undefined,
  });

  const [createRide, { isLoading: isCreating }] = useCreateRideMutation();
  const [updateRide, { isLoading: isUpdating }] = useUpdateRideMutation();
  const [deleteRide] = useDeleteRideMutation();

  // Local offline database fallbacks
  const [localRides, setLocalRides] = useState<Ride[]>(mockRides);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRide, setEditingRide] = useState<Ride | null>(null);

  // Delete dialog controllers
  const [deleteTarget, setDeleteTarget] = useState<Ride | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleResetFilters = () => {
    setSearch('');
    setCategoryId('');
    setStatus('');
  };

  const handleFormSubmit = async (formData: RideFormInput) => {
    try {
      const selectedCategoryObj = mockRideCategories.find((c) => c.id === Number(formData.rideCategoryId));
      
      const rideBody: Partial<Ride> = {
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        capacity: formData.capacity,
        durationSeconds: formData.durationSeconds ? Number(formData.durationSeconds) : undefined,
        status: formData.status,
        venueId: formData.venueId,
        venueName: formData.venueId === 1 ? 'Smart Park East Wing' : 'Water World Pavilion',
        zoneId: formData.zoneId,
        zoneName: 'Assigned Zone',
        rideCategoryId: formData.rideCategoryId,
        categoryName: selectedCategoryObj?.name || 'Unassigned',
        queueTimeMinutes: formData.status === 'OPERATING' ? 10 : 0,
        popularityScore: 75,
        restrictions: {
          minHeight: formData.restrictions.minHeight ? Number(formData.restrictions.minHeight) : undefined,
          maxHeight: formData.restrictions.maxHeight ? Number(formData.restrictions.maxHeight) : undefined,
          minAge: formData.restrictions.minAge ? Number(formData.restrictions.minAge) : undefined,
          maxAge: formData.restrictions.maxAge ? Number(formData.restrictions.maxAge) : undefined,
          minWeight: formData.restrictions.minWeight ? Number(formData.restrictions.minWeight) : undefined,
          maxWeight: formData.restrictions.maxWeight ? Number(formData.restrictions.maxWeight) : undefined,
          healthWarning: formData.restrictions.healthWarning,
          pregnancyRestriction: formData.restrictions.pregnancyRestriction,
          accessibilityFriendly: formData.restrictions.accessibilityFriendly,
          safetyNotes: formData.restrictions.safetyNotes || undefined,
        },
        operatingHours: {
          open: formData.operatingHours.open,
          close: formData.operatingHours.close,
        },
        images: initialDataImages(editingRide),
        coverImage: initialDataCover(editingRide),
      };

      if (editingRide) {
        // Edit flow
        try {
          await updateRide({ id: editingRide.id, body: rideBody }).unwrap();
        } catch {
          // Offline update fallback
          const updated = localRides.map((r) => {
            if (r.id === editingRide.id) {
              return {
                ...r,
                ...rideBody,
                updatedAt: new Date().toISOString(),
              } as Ride;
            }
            return r;
          });
          setLocalRides(updated);
        }
      } else {
        // Create flow
        try {
          await createRide(rideBody).unwrap();
        } catch {
          // Offline create fallback
          const newMockId = Math.max(...localRides.map((r) => r.id), 0) + 1;
          const newRide: Ride = {
            id: newMockId,
            name: formData.name,
            code: formData.code,
            description: formData.description || undefined,
            capacity: formData.capacity,
            durationSeconds: formData.durationSeconds ? Number(formData.durationSeconds) : undefined,
            status: formData.status,
            venueId: formData.venueId,
            venueName: formData.venueId === 1 ? 'Smart Park East Wing' : 'Water World Pavilion',
            zoneId: formData.zoneId,
            zoneName: 'Assigned Zone',
            rideCategoryId: formData.rideCategoryId,
            categoryName: selectedCategoryObj?.name || 'Unassigned',
            queueTimeMinutes: formData.status === 'OPERATING' ? 10 : 0,
            popularityScore: 75,
            restrictions: {
              minHeight: formData.restrictions.minHeight ? Number(formData.restrictions.minHeight) : undefined,
              maxHeight: formData.restrictions.maxHeight ? Number(formData.restrictions.maxHeight) : undefined,
              minAge: formData.restrictions.minAge ? Number(formData.restrictions.minAge) : undefined,
              maxAge: formData.restrictions.maxAge ? Number(formData.restrictions.maxAge) : undefined,
              minWeight: formData.restrictions.minWeight ? Number(formData.restrictions.minWeight) : undefined,
              maxWeight: formData.restrictions.maxWeight ? Number(formData.restrictions.maxWeight) : undefined,
              healthWarning: formData.restrictions.healthWarning,
              pregnancyRestriction: formData.restrictions.pregnancyRestriction,
              accessibilityFriendly: formData.restrictions.accessibilityFriendly,
              safetyNotes: formData.restrictions.safetyNotes || undefined,
            },
            operatingHours: {
              open: formData.operatingHours.open,
              close: formData.operatingHours.close,
            },
            images: [
              'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80'
            ],
            coverImage: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setLocalRides([newRide, ...localRides]);
        }
      }
      setFormOpen(false);
      setEditingRide(null);
      refetch();
    } catch (err) {
      console.error('Failed to save ride', err);
    }
  };

  const initialDataImages = (initial: Ride | null) => {
    if (initial?.images) return initial.images;
    return [
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80'
    ];
  };

  const initialDataCover = (initial: Ride | null) => {
    if (initial?.coverImage) return initial.coverImage;
    return 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80';
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      try {
        await deleteRide(deleteTarget.id).unwrap();
      } catch {
        // Offline delete fallback
        setLocalRides(localRides.filter((r) => r.id !== deleteTarget.id));
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete ride', err);
    }
  };

  const filteredLocalRides = localRides.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !categoryId || r.rideCategoryId === Number(categoryId);
    const matchesStatus = !status || r.status === status;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const displayData = data?.content || (isLoading ? [] : filteredLocalRides);
  const displayTotal = data?.totalElements ?? filteredLocalRides.length;

  // Stats summaries
  const operatingCount = displayData.filter((r) => r.status === 'OPERATING').length;
  const closedCount = displayData.filter((r) => r.status === 'CLOSED' || r.status === 'TEMPORARILY_CLOSED').length;
  const maintenanceCount = displayData.filter((r) => r.status === 'MAINTENANCE').length;
  
  const activeQueues = displayData.filter((r) => r.status === 'OPERATING' && r.queueTimeMinutes > 0);
  const avgQueue = activeQueues.length > 0
    ? Math.round(activeQueues.reduce((acc, r) => acc + r.queueTimeMinutes, 0) / activeQueues.length)
    : 0;

  return (
    <PageContainer
      title="Ride Attraction Directory"
      toolbar={
        <PermissionWrapper requiredPermission="write:rides">
          <Button
            variant="contained"
            startIcon={<MdAdd />}
            onClick={() => {
              setEditingRide(null);
              setFormOpen(true);
            }}
          >
            Add Ride Specs
          </Button>
        </PermissionWrapper>
      }
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Metric summaries card */}
        <RideStatisticsCard
          total={displayTotal}
          operating={operatingCount}
          closed={closedCount}
          maintenance={maintenanceCount}
          avgQueueTime={avgQueue}
        />

        {/* Filter bar */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search Attractions"
                placeholder="Ride Name, Code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryId}
                  label="Category"
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <MenuItem value=""><em>All Categories</em></MenuItem>
                  {mockRideCategories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Operating Status</InputLabel>
                <Select
                  value={status}
                  label="Operating Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value=""><em>All Statuses</em></MenuItem>
                  <MenuItem value="OPERATING">Operating</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                  <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                  <MenuItem value="TEMPORARILY_CLOSED">Temporarily Closed</MenuItem>
                  <MenuItem value="EMERGENCY_STOP">Emergency Stop</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" onClick={handleResetFilters}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isError && (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            Failed to fetch active rides. Switched to offline database sync.
          </Alert>
        )}

        <RideTable
          data={displayData}
          loading={isLoading}
          onViewDetails={(ride) => {
            setSelectedRide(ride);
            setDetailsOpen(true);
          }}
          onEdit={(ride) => {
            setEditingRide(ride);
            setFormOpen(true);
          }}
          onDelete={(ride) => {
            setDeleteTarget(ride);
            setDeleteConfirmOpen(true);
          }}
        />

        {/* Details Dialog */}
        <Modal
          open={detailsOpen}
          onClose={() => setSelectedRide(null)}
          title="Attraction Profile Card"
          maxWidth="md"
        >
          {selectedRide && <RideDetails ride={selectedRide} />}
        </Modal>

        {/* Form Dialog */}
        <Modal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editingRide ? 'Update Ride Specifications' : 'Register New Attraction'}
          maxWidth="md"
        >
          <RideForm
            initialData={editingRide}
            onSubmit={handleFormSubmit}
            loading={isCreating || isUpdating}
          />
        </Modal>

        {/* Delete Confirmation */}
        <StatusDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          type="error"
          title="Remove Ride Specification"
          message={`Are you sure you want to delete the ride profile for "${deleteTarget?.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          confirmText="Yes, Delete Ride"
        />
      </Box>
    </PageContainer>
  );
};
