import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  MdPerson,
  MdContactPhone,
  MdHistory,
  MdPeople,
  MdBadge,
  MdShoppingBag,
} from 'react-icons/md';
import { Customer } from '../types';
import { RewardPointCard } from './RewardPointCard';
import { CustomerTimeline } from './CustomerTimeline';
import { mockCustomerActivities } from '../services/customerApi';
import { mockVisitors } from '../../visitor/services/visitorApi';

interface CustomerDetailsProps {
  customer: Customer;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Filter visitors associated with this customer
  const associatedVisitors = mockVisitors.filter((v) => v.customerId === customer.id);

  // Mock booking history records for detail view
  const mockCustomerBookings = [
    { id: 1, bookingCode: 'BK-0912', date: '2026-07-01', amount: 165.00, status: 'PAID', tickets: 3 },
    { id: 2, bookingCode: 'BK-0782', date: '2026-06-15', amount: 95.00, status: 'PAID', tickets: 1 },
    { id: 3, bookingCode: 'BK-0520', date: '2026-05-10', amount: 120.00, status: 'PAID', tickets: 2 },
  ];

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      {/* Top Header Card */}
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3, bgcolor: 'action.hover' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '1.75rem',
              fontWeight: 'bold',
            }}
          >
            {getInitials(customer.fullName)}
          </Avatar>
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="h5" fontWeight="bold">
                {customer.fullName}
              </Typography>
              <Chip
                label={customer.status}
                size="small"
                color={customer.status === 'ACTIVE' ? 'success' : 'error'}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customer Code: CUST-{String(customer.id).padStart(4, '0')}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Registered on: {new Date(customer.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<MdPerson />} iconPosition="start" label="Profile Info" />
        <Tab icon={<MdPeople />} iconPosition="start" label={`Visitors (${associatedVisitors.length})`} />
        <Tab icon={<MdShoppingBag />} iconPosition="start" label="Bookings & Sales" />
        <Tab icon={<MdHistory />} iconPosition="start" label="Activity Log" />
      </Tabs>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
                  <MdContactPhone /> Personal Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Email Address</Typography>
                    <Typography variant="body2" fontWeight={500}>{customer.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                    <Typography variant="body2" fontWeight={500}>{customer.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Birth Date</Typography>
                    <Typography variant="body2" fontWeight={500}>{customer.birthDate || 'Not Provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Gender</Typography>
                    <Typography variant="body2" fontWeight={500}>{customer.gender || 'Not Provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Address</Typography>
                    <Typography variant="body2" fontWeight={500}>{customer.address || 'Not Provided'}</Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                  Account Audit Info
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Created Date</Typography>
                    <Typography variant="body2">{new Date(customer.createdAt).toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body2">{new Date(customer.updatedAt).toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <RewardPointCard membership={customer.membership} totalSpending={customer.stats?.totalSpending || 0} />
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
              <MdPeople /> Linked Visitors / Family Members
            </Typography>
            {associatedVisitors.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No visitors registered for this customer.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Visitor Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Relationship</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Age / Gender</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nationality</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID Number</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {associatedVisitors.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{v.fullName}</TableCell>
                        <TableCell>
                          <Chip label={v.relationship} size="small" variant="outlined" color="primary" />
                        </TableCell>
                        <TableCell>{v.age} yrs / {v.gender}</TableCell>
                        <TableCell>{v.nationality}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{v.identificationNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
              <MdShoppingBag /> Sales & Booking Records
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Booking ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Visit Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tickets Issued</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Spending</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockCustomerBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {b.bookingCode}
                      </TableCell>
                      <TableCell>{b.date}</TableCell>
                      <TableCell>{b.tickets} tickets</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        ${b.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip label={b.status} size="small" color="success" sx={{ fontWeight: 'bold' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'action.selected' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Accumulated Total</TableCell>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.05rem' }}>
                      ${(customer.stats?.totalSpending || 380).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={3}>
              <MdBadge /> CRM Action Audit Logs
            </Typography>
            <CustomerTimeline activities={mockCustomerActivities[customer.id] || []} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
