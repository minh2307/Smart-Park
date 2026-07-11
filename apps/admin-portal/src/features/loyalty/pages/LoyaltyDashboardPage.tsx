import React, { useState } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  Grid,
  TableContainer,
} from '@mui/material';
import { MdAdd, MdCheck, MdClose, MdStars, MdTune } from 'react-icons/md';
import {
  useGetLoyaltySummaryQuery,
  useGetTransactionsQuery,
  useGetRulesConfigQuery,
  useUpdateRulesConfigMutation,
  useGetAdjustmentRequestsQuery,
  useCreateAdjustmentRequestMutation,
  useApproveAdjustmentRequestMutation,
  useRejectAdjustmentRequestMutation,
} from '../services/loyaltyApi';
import { useGetCustomersQuery } from '../../customer/services/customerApi';
import { PointStatisticsCard } from '../components/PointStatisticsCard';
import { LoyaltyDashboard } from '../components/LoyaltyDashboard';
import { PointTransactionTable } from '../components/PointTransactionTable';
import { PointAdjustmentDialog } from '../components/PointAdjustmentDialog';
import { SearchPanel } from '../../../shared/components/SearchPanel';
import { Toolbar } from '../../../shared/components/Toolbar';
import { StatusChip } from '../../../shared/components/StatusChip';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

export const LoyaltyDashboardPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('');

  // Modals
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  // Queries
  const { data: summary } = useGetLoyaltySummaryQuery();
  const { data: transactions = [], isLoading: txsLoading } = useGetTransactionsQuery({
    search,
    type: txTypeFilter || undefined,
  });
  const { data: rules } = useGetRulesConfigQuery();
  const { data: adjustments = [] } = useGetAdjustmentRequestsQuery();
  const { data: customerData } = useGetCustomersQuery({});

  const customersList = customerData?.content || [];

  // Mutations
  const [updateRules] = useUpdateRulesConfigMutation();
  const [createAdjustment] = useCreateAdjustmentRequestMutation();
  const [approveAdjustment] = useApproveAdjustmentRequestMutation();
  const [rejectAdjustment] = useRejectAdjustmentRequestMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAdjustmentSubmit = async (values: any) => {
    try {
      const selectedCust = customersList.find((c) => c.id === values.customerId);
      await createAdjustment({
        ...values,
        customerName: selectedCust?.fullName || 'Khách hàng thân thiết',
        requestedBy: 'current_operator',
      }).unwrap();
      setAdjustModalOpen(false);
    } catch (err) {
      console.error('Failed to create adjustment request:', err);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveAdjustment({ id, approver: 'manager_admin' }).unwrap();
    } catch (err) {
      console.error('Failed to approve adjustment:', err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectAdjustment({ id, approver: 'manager_admin' }).unwrap();
    } catch (err) {
      console.error('Failed to reject adjustment:', err);
    }
  };

  const handleUpdateRules = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updated = {
      earnRate: Number(formData.get('earnRate')),
      redeemRate: Number(formData.get('redeemRate')),
      expirationMonths: Number(formData.get('expirationMonths')),
      firstPurchaseBonus: Number(formData.get('firstPurchaseBonus')),
      birthdayBonus: Number(formData.get('birthdayBonus')),
    };
    try {
      await updateRules(updated).unwrap();
    } catch (err) {
      console.error('Failed to update point rules:', err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Toolbar
        title="Điểm tích lũy & Giao dịch"
        subtitle="Quản lý tích lũy điểm thành viên, quy tắc đổi điểm, điều chỉnh số dư thủ công và sổ cái"
        action={
          <PermissionWrapper requiredPermission="write:memberships">
            <Button
              variant="contained"
              startIcon={<MdAdd />}
              onClick={() => setAdjustModalOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Điều chỉnh số dư điểm
            </Button>
          </PermissionWrapper>
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Phân tích & Hiệu suất" />
          <Tab label="Sổ cái tích lũy" />
          <Tab label="Yêu cầu điều chỉnh" />
          <Tab label="Quy tắc tích lũy" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box display="flex" flexDirection="column" gap={4}>
          {summary && <PointStatisticsCard summary={summary} />}
          <LoyaltyDashboard />
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <SearchPanel
            search={search}
            onSearchChange={setSearch}
            placeholder="Tìm kiếm giao dịch..."
            onClear={() => setSearch('')}
          >
            <TextField
              select
              label="Loại giao dịch"
              size="small"
              value={txTypeFilter}
              onChange={(e) => setTxTypeFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Tất cả các loại</MenuItem>
              <MenuItem value="EARNED">Tích lũy</MenuItem>
              <MenuItem value="REDEEMED">Quy đổi</MenuItem>
              <MenuItem value="EXPIRED">Hết hạn</MenuItem>
              <MenuItem value="ADJUSTED">Điều chỉnh số dư</MenuItem>
            </TextField>
          </SearchPanel>

          <PointTransactionTable data={transactions} loading={txsLoading} />
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Yêu cầu hiệu chỉnh số dư điểm
          </Typography>
          <TableContainer component={Card} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Lý do điều chỉnh</TableCell>
                  <TableCell>Người yêu cầu</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adjustments.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {req.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{req.type === 'ADD' ? 'Cộng (+)' : 'Trừ (-)'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <MdStars color="#eab308" />
                        <Typography variant="body2" fontWeight="bold">
                          {req.points} Điểm
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{req.reason}</TableCell>
                    <TableCell>{req.requestedBy}</TableCell>
                    <TableCell>
                      <StatusChip status={req.status} />
                    </TableCell>
                    <TableCell align="right">
                      {req.status === 'PENDING' ? (
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                          <PermissionWrapper requiredPermission="write:memberships">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<MdCheck />}
                              onClick={() => handleApprove(req.id)}
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<MdClose />}
                              onClick={() => handleReject(req.id)}
                            >
                              Từ chối
                            </Button>
                          </PermissionWrapper>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Người xử lý: {req.approvedBy}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {adjustments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Không có yêu cầu hiệu chỉnh nào đang chờ.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tabValue === 3 && (
        <Box maxWidth="md">
          {rules && (
            <Card variant="outlined" component="form" onSubmit={handleUpdateRules} sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Thiết lập tích lũy & Quy đổi điểm toàn cục
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="number"
                      name="earnRate"
                      label="Tỷ lệ tích lũy (Điểm trên mỗi 10.000đ chi tiêu)"
                      defaultValue={rules.earnRate}
                      inputProps={{ step: 0.1 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="number"
                      name="redeemRate"
                      label="Giá trị quy đổi (VND trên mỗi Điểm)"
                      defaultValue={rules.redeemRate}
                      inputProps={{ step: 100 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="number"
                      name="expirationMonths"
                      label="Thời hạn hết hạn (Tháng)"
                      defaultValue={rules.expirationMonths}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="number"
                      name="firstPurchaseBonus"
                      label="Điểm thưởng cho lần mua đầu tiên"
                      defaultValue={rules.firstPurchaseBonus}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      type="number"
                      name="birthdayBonus"
                      label="Điểm thưởng mừng sinh nhật"
                      defaultValue={rules.birthdayBonus}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <Box display="flex" justifyContent="flex-end" sx={{ mt: 4 }}>
                  <Button type="submit" variant="contained" startIcon={<MdTune />} sx={{ borderRadius: 2 }}>
                    Lưu cấu hình quy tắc điểm
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Manual Point Adjustment dialog */}
      <PointAdjustmentDialog
        open={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        onSubmit={handleAdjustmentSubmit}
        customers={customersList}
      />
    </Box>
  );
};
