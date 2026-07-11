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
import { RideCategoryTable } from '../components/RideCategoryTable';
import { RideCategoryDetails } from '../components/RideCategoryDetails';
import { RideCategoryForm } from '../components/RideCategoryForm';
import { RideCategoryFormInput } from '../schemas/rideCategorySchema';
import {
  useGetRideCategoriesQuery,
  useCreateRideCategoryMutation,
  useUpdateRideCategoryMutation,
  useDeleteRideCategoryMutation,
  mockRideCategories,
} from '../services/rideCategoryApi';
import { RideCategory } from '../types';
import { MdAdd, MdCategory, MdCheckCircle } from 'react-icons/md';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

export const RideCategoryListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  
  const { data, isLoading, isError, refetch } = useGetRideCategoriesQuery({
    search,
    status,
  });

  const [createCategory, { isLoading: isCreating }] = useCreateRideCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateRideCategoryMutation();
  const [deleteCategory] = useDeleteRideCategoryMutation();

  // Local offline fallbacks
  const [localCategories, setLocalCategories] = useState<RideCategory[]>(mockRideCategories);
  const [selectedCategory, setSelectedCategory] = useState<RideCategory | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RideCategory | null>(null);

  // Deletion modals
  const [deleteTarget, setDeleteTarget] = useState<RideCategory | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
  };

  const handleFormSubmit = async (formData: RideCategoryFormInput) => {
    try {
      const categoryBody = {
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        status: formData.status,
      };

      if (editingCategory) {
        // Edit flow
        try {
          await updateCategory({ id: editingCategory.id, body: categoryBody }).unwrap();
        } catch {
          // Offline update
          const updated = localCategories.map((c) => {
            if (c.id === editingCategory.id) {
              return {
                ...c,
                ...categoryBody,
                updatedAt: new Date().toISOString(),
              };
            }
            return c;
          });
          setLocalCategories(updated);
        }
      } else {
        // Create flow
        try {
          await createCategory(categoryBody).unwrap();
        } catch {
          // Offline create
          const newMockId = Math.max(...localCategories.map((c) => c.id), 0) + 1;
          const newCat: RideCategory = {
            id: newMockId,
            name: formData.name,
            code: formData.code,
            description: formData.description || undefined,
            status: formData.status,
            rideCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setLocalCategories([newCat, ...localCategories]);
        }
      }
      setFormOpen(false);
      setEditingCategory(null);
      refetch();
    } catch (err) {
      console.error('Failed to save category', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      try {
        await deleteCategory(deleteTarget.id).unwrap();
      } catch {
        // Offline delete
        setLocalCategories(localCategories.filter((c) => c.id !== deleteTarget.id));
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete category', err);
    }
  };

  const filteredLocalCategories = localCategories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || c.status === status;
    return matchesSearch && matchesStatus;
  });

  const displayData = data?.content || (isLoading ? [] : filteredLocalCategories);
  const displayTotal = data?.totalElements ?? filteredLocalCategories.length;

  const activeCount = displayData.filter((c) => c.status === 'ACTIVE').length;

  return (
    <PageContainer
      title="Ride Category Administration"
      toolbar={
        <PermissionWrapper requiredPermission="write:rides">
          <Button
            variant="contained"
            startIcon={<MdAdd />}
            onClick={() => {
              setEditingCategory(null);
              setFormOpen(true);
            }}
          >
            Add Category
          </Button>
        </PermissionWrapper>
      }
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Statistics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="primary.light" sx={{ borderRadius: 2.5, color: 'primary.contrastText', display: 'flex' }}>
                  <MdCategory size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Total Categories</Typography>
                  <Typography variant="h5" fontWeight="bold">{displayTotal}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="success.light" sx={{ borderRadius: 2.5, color: 'success.contrastText', display: 'flex' }}>
                  <MdCheckCircle size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Active Categories</Typography>
                  <Typography variant="h5" fontWeight="bold">{activeCount}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter bar */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Search Categories"
                placeholder="Category Name or Code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={2}>
              <Button fullWidth variant="outlined" onClick={handleResetFilters}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isError && (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            Failed to fetch ride categories. Switched to offline database sync.
          </Alert>
        )}

        <RideCategoryTable
          data={displayData}
          loading={isLoading}
          onViewDetails={(cat) => {
            setSelectedCategory(cat);
            setDetailsOpen(true);
          }}
          onEdit={(cat) => {
            setEditingCategory(cat);
            setFormOpen(true);
          }}
          onDelete={(cat) => {
            setDeleteTarget(cat);
            setDeleteConfirmOpen(true);
          }}
        />

        {/* Details Dialog */}
        <Modal
          open={detailsOpen}
          onClose={() => setSelectedCategory(null)}
          title="Category Specification Card"
          maxWidth="md"
        >
          {selectedCategory && <RideCategoryDetails category={selectedCategory} />}
        </Modal>

        {/* Form Dialog */}
        <Modal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editingCategory ? 'Update Ride Category' : 'Register New Ride Category'}
          maxWidth="sm"
        >
          <RideCategoryForm
            initialData={editingCategory}
            onSubmit={handleFormSubmit}
            loading={isCreating || isUpdating}
          />
        </Modal>

        {/* Delete Confirm */}
        <StatusDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          type="error"
          title="Remove Ride Category"
          message={`Are you sure you want to delete the category "${deleteTarget?.name}"? Make sure no active theme park rides are currently associated with it.`}
          onConfirm={handleDeleteConfirm}
          confirmText="Yes, Remove Category"
        />
      </Box>
    </PageContainer>
  );
};
