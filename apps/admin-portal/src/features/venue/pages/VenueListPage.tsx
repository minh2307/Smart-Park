import React, { useState } from 'react';
import { Box, Paper, Alert, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PageContainer } from '../../../layouts/components/PageContainer';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Dialog';
import { VenueTable } from '../components/VenueTable';
import { VenueCard } from '../components/VenueCard';
import { VenueFilterPanel } from '../components/VenueFilterPanel';
import { VenueForm } from '../components/VenueForm';
import { DeleteVenueDialog } from '../components/DeleteVenueDialog';
import { useGetVenuesQuery, useCreateVenueMutation, useUpdateVenueMutation, useDeleteVenueMutation } from '../services/venueApi';
import { Venue } from '../types';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import { MdAdd, MdViewList, MdViewModule } from 'react-icons/md';

export const VenueListPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const { data, isLoading, isError, refetch } = useGetVenuesQuery({
    page,
    size,
    search,
    status,
    city,
    country,
  });

  const [createVenue, { isLoading: isCreating }] = useCreateVenueMutation();
  const [updateVenue, { isLoading: isUpdating }] = useUpdateVenueMutation();
  const [deleteVenue] = useDeleteVenueMutation();

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setCity('');
    setCountry('');
    setPage(0);
  };

  const handleCreateSubmit = async (formData: any) => {
    try {
      await createVenue(formData).unwrap();
      setFormOpen(false);
    } catch (err) {
      console.error('Failed to create venue', err);
    }
  };

  const handleUpdateSubmit = async (formData: any) => {
    if (!selectedVenue) return;
    try {
      await updateVenue({ id: selectedVenue.id, body: formData }).unwrap();
      setFormOpen(false);
      setSelectedVenue(null);
    } catch (err) {
      console.error('Failed to update venue', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVenue) return;
    try {
      await deleteVenue(selectedVenue.id).unwrap();
      setDeleteOpen(false);
      setSelectedVenue(null);
    } catch (err) {
      console.error('Failed to delete venue', err);
    }
  };

  const mockVenues: Venue[] = [
    {
      id: 1,
      name: 'Smart Park East Wing',
      venueCode: 'SPK-EAST',
      description: 'The main thematic playground containing fantasy rides and food courts.',
      address: '123 Paradise Road',
      city: 'Ho Chi Minh',
      provinceState: 'HCM',
      country: 'Vietnam',
      status: 'ACTIVE',
      openingTime: '08:00',
      closingTime: '22:00',
      manager: 'Tran Van A',
      coverImageUrl: 'https://images.unsplash.com/photo-1513889961551-6ad8762ebd57?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      name: 'Water World Pavilion',
      venueCode: 'SPK-WATER',
      description: 'Aquatic rollercoasters and premium swimming zones.',
      address: '456 Ocean Parkway',
      city: 'Ho Chi Minh',
      provinceState: 'HCM',
      country: 'Vietnam',
      status: 'ACTIVE',
      openingTime: '09:00',
      closingTime: '21:00',
      manager: 'Le Van B',
      coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    }
  ];

  const displayData = data?.content || (isLoading ? [] : mockVenues);
  const displayTotal = data?.totalElements ?? mockVenues.length;

  return (
    <PageContainer title="Quản lý địa điểm">
      <Box display="flex" flexDirection="column" gap={3}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <VenueFilterPanel
              status={status}
              city={city}
              country={country}
              onStatusChange={setStatus}
              onCityChange={setCity}
              onCountryChange={setCountry}
              onReset={handleResetFilters}
              onRefresh={refetch}
            />
            <Box display="flex" gap={2} alignItems="center">
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, val) => val && setViewMode(val)}
                size="small"
              >
                <ToggleButton value="grid" title="Chế độ lưới">
                  <MdViewModule size={20} />
                </ToggleButton>
                <ToggleButton value="table" title="Chế độ bảng">
                  <MdViewList size={20} />
                </ToggleButton>
              </ToggleButtonGroup>
              <PermissionWrapper requiredPermission="write:venues">
                <Button
                  variant="contained"
                  startIcon={<MdAdd />}
                  onClick={() => {
                    setSelectedVenue(null);
                    setFormOpen(true);
                  }}
                >
                  Thêm địa điểm
                </Button>
              </PermissionWrapper>
            </Box>
          </Box>
        </Paper>

        {isError && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Không thể kết nối với dịch vụ địa điểm ở máy chủ. Đang hiển thị danh sách cục bộ thay thế.
          </Alert>
        )}

        {viewMode === 'table' ? (
          <VenueTable
            data={displayData}
            loading={isLoading}
            page={page}
            rowsPerPage={size}
            totalElements={displayTotal}
            onPageChange={setPage}
            onRowsPerPageChange={setSize}
            onSearchChange={setSearch}
            onEdit={(venue) => {
              setSelectedVenue(venue);
              setFormOpen(true);
            }}
            onDelete={(venue) => {
              setSelectedVenue(venue);
              setDeleteOpen(true);
            }}
          />
        ) : (
          <Grid container spacing={3}>
            {displayData.map((venue) => (
              <Grid item xs={12} sm={6} md={4} key={venue.id}>
                <VenueCard venue={venue} />
              </Grid>
            ))}
          </Grid>
        )}

        <Modal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={selectedVenue ? 'Chỉnh sửa địa điểm' : 'Tạo địa điểm mới'}
        >
          <VenueForm
            initialData={selectedVenue || undefined}
            onSubmit={selectedVenue ? handleUpdateSubmit : handleCreateSubmit}
            loading={isCreating || isUpdating}
          />
        </Modal>

        <DeleteVenueDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          venueName={selectedVenue?.name || ''}
        />
      </Box>
    </PageContainer>
  );
};
