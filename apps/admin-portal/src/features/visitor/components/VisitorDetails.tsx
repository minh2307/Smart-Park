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
import { StatusChip } from '../../../shared/components/StatusChip';
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

  const getGenderLabel = (g: string) => {
    switch (g) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      case 'OTHER': return 'Khác';
      default: return g;
    }
  };

  const getRelationshipLabel = (r: string) => {
    switch (r) {
      case 'SELF': return 'Bản thân';
      case 'SPOUSE': return 'Vợ/Chồng';
      case 'CHILD': return 'Con cái';
      case 'PARENT': return 'Cha mẹ';
      case 'FRIEND': return 'Bạn bè';
      case 'OTHER': return 'Khác';
      default: return r;
    }
  };

  // Mock scan history check-ins for the visitor
  const mockVisitHistory = [
    { id: 1, location: 'Cổng A Công viên nước', time: '2026-07-01T10:15:30Z', gate: 'Cổng 02' },
    { id: 2, location: 'Phân khu phía Đông Công viên chủ đề', time: '2026-06-15T09:40:00Z', gate: 'Cổng 05' },
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
                  <MdPerson /> Chi tiết hồ sơ
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Họ và tên</Typography>
                    <Typography variant="body1" fontWeight={600}>{visitor.fullName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Tuổi</Typography>
                    <Typography variant="body2">{visitor.age} tuổi</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Giới tính</Typography>
                    <Typography variant="body2">{getGenderLabel(visitor.gender)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Quốc tịch</Typography>
                    <Typography variant="body2">{visitor.nationality}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Giấy tờ tùy thân / Hộ chiếu</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {visitor.identificationNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Mối quan hệ với chủ tài khoản</Typography>
                    <Box mt={0.5}>
                      <Chip label={getRelationshipLabel(visitor.relationship)} size="small" color="primary" />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Tài khoản quản lý</Typography>
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
                  <MdContactPhone /> Liên hệ khẩn cấp
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Tên người liên hệ</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {visitor.emergencyContactName || 'Không có'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Số điện thoại liên hệ</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {visitor.emergencyContactPhone || 'Không có'}
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
                  <MdLocalHospital /> Lưu ý y tế & Chế độ ăn uống
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
                    {visitor.medicalNotes || 'Không có báo cáo về cảnh báo y tế đặc biệt, dị ứng hoặc hạn chế thể chất.'}
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
                  <MdConfirmationNumber /> Vé điện tử đã gán
                </Typography>
                {!visitor.assignedTickets || visitor.assignedTickets.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                    Chưa có vé nào được gán cho hồ sơ khách tham quan này.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Mã vé</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Loại vé</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Ngày hiệu lực</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {visitor.assignedTickets.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                              {t.ticketCode}
                            </TableCell>
                            <TableCell>{t.ticketType?.name || 'Vào cổng'}</TableCell>
                            <TableCell>{t.validDate}</TableCell>
                            <TableCell>
                              <StatusChip
                                status={t.status}
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
                  <MdHistory /> Nhật ký Check-in vật lý
                </Typography>
                {mockVisitHistory.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                    Chưa ghi nhận nhật ký check-in nào.
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
                                  Cổng kiểm soát: {log.gate}
                                </Typography>
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {new Date(log.time).toLocaleString('vi-VN')}
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
