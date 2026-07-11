import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  MdPerson,
  MdContactPhone,
  MdLocalHospital,
  MdConfirmationNumber,
  MdHistory,
} from 'react-icons/md';
import { Visitor } from '../types';
import { mockCustomers } from '../../customer/services/customerApi';

interface VisitorDetailsProps {
  visitor: Visitor;
}

export const VisitorDetails: React.FC<VisitorDetailsProps> = ({ visitor }) => {
  const getOwnerName = (customerId: number) => {
    const cust = mockCustomers.find((c) => c.id === customerId);
    return cust ? cust.fullName : `CUST-${String(customerId).padStart(4, '0')}`;
  };

  // Mock scan history check-ins for the visitor
  const mockVisitHistory = [
    { id: 1, location: 'Water World Gate A', time: '2026-07-01T10:15:30Z', gate: 'Gate 02' },
    { id: 2, location: 'Theme Park East Wing', time: '2026-06-15T09:40:00Z', gate: 'Gate 05' },
  ];

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <Grid container spacing={3}>
        {/* Left Column: Personal info, Emergency, Medical */}
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* General Info */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
                  <MdPerson /> Profile Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1" fontWeight={600}>{visitor.fullName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Age</Typography>
                    <Typography variant="body2">{visitor.age} years old</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Gender</Typography>
                    <Typography variant="body2">{visitor.gender}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Nationality</Typography>
                    <Typography variant="body2">{visitor.nationality}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Identity / Passport</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {visitor.identificationNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Relationship to Owner</Typography>
                    <Box mt={0.5}>
                      <Chip label={visitor.relationship} size="small" color="primary" />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Account Custodian</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {getOwnerName(visitor.customerId)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Emergency Info */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
                  <MdContactPhone /> Emergency Contacts
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Contact Name</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {visitor.emergencyContactName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Contact Phone</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {visitor.emergencyContactPhone || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Medical Info */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: visitor.medicalNotes ? 'warning.light' : 'divider',
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
                  <MdLocalHospital /> Dietary & Medical Notes
                </Typography>
                <Box
                  p={1.5}
                  bgcolor={visitor.medicalNotes ? 'warning.light' : 'action.hover'}
                  sx={{
                    borderRadius: 2,
                    color: visitor.medicalNotes ? 'warning.contrastText' : 'text.secondary',
                  }}
                >
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {visitor.medicalNotes || 'No special medical alerts, allergies, or physical restrictions reported.'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Right Column: Tickets and Visit Logs */}
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Tickets */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
                  <MdConfirmationNumber /> Assigned Digital Tickets
                </Typography>
                {!visitor.assignedTickets || visitor.assignedTickets.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                    No tickets assigned to this visitor profile.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Ticket Code</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Valid Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {visitor.assignedTickets.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                              {t.ticketCode}
                            </TableCell>
                            <TableCell>{t.ticketType?.name || 'Admission'}</TableCell>
                            <TableCell>{t.validDate}</TableCell>
                            <TableCell>
                              <Chip
                                label={t.status}
                                size="small"
                                color={t.status === 'UNUSED' ? 'success' : 'default'}
                                variant="outlined"
                                sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            {/* Visit History */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
                  <MdHistory /> Physical Check-in Logs
                </Typography>
                {mockVisitHistory.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                    No check-in logs recorded.
                  </Typography>
                ) : (
                  <List sx={{ p: 0 }}>
                    {mockVisitHistory.map((log, i) => (
                      <React.Fragment key={log.id}>
                        {i > 0 && <Divider component="li" />}
                        <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                          <ListItemText
                            primary={log.location}
                            secondary={
                              <>
                                <Typography component="span" variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                                  Gate Terminal: {log.gate}
                                </Typography>
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {new Date(log.time).toLocaleString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
