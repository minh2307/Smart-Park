import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import { BenefitConfig } from '../types';

interface MembershipBenefitTableProps {
  benefits: BenefitConfig;
}

export const MembershipBenefitTable: React.FC<MembershipBenefitTableProps> = ({ benefits }) => {
  const benefitRows = [
    { name: 'Ticket Purchase Discount', value: benefits.ticketDiscount > 0 ? `${benefits.ticketDiscount}% discount` : 'None', active: benefits.ticketDiscount > 0 },
    { name: 'Food & Beverage Discount', value: benefits.foodDiscount > 0 ? `${benefits.foodDiscount}% discount` : 'None', active: benefits.foodDiscount > 0 },
    { name: 'Retail / Gift Shop Discount', value: benefits.shopDiscount > 0 ? `${benefits.shopDiscount}% discount` : 'None', active: benefits.shopDiscount > 0 },
    { name: 'Parking Rate Discount', value: benefits.parkingDiscount > 0 ? `${benefits.parkingDiscount}% discount` : 'None', active: benefits.parkingDiscount > 0 },
    { name: 'Locker Rental Discount', value: benefits.lockerDiscount > 0 ? `${benefits.lockerDiscount}% discount` : 'None', active: benefits.lockerDiscount > 0 },
    { name: 'Priority Queue Access', value: benefits.priorityQueue ? 'Enabled' : 'Not Included', active: benefits.priorityQueue },
    { name: 'Fast Pass Privileges', value: benefits.fastPass ? 'Enabled' : 'Not Included', active: benefits.fastPass },
    { name: 'VIP Lounge Lounge Access', value: benefits.vipLoungeAccess ? 'Enabled' : 'Not Included', active: benefits.vipLoungeAccess },
    { name: 'Complimentary Parking', value: benefits.freeParking ? 'Free Parking Included' : 'Not Included', active: benefits.freeParking },
    { name: 'Complimentary Locker', value: benefits.freeLocker ? 'Free Locker Included' : 'Not Included', active: benefits.freeLocker },
    { name: 'Early Theme Park Entry', value: benefits.earlyParkEntry ? '30-min Early Admission' : 'Not Included', active: benefits.earlyParkEntry },
    { name: 'Birthday Special Gift', value: benefits.birthdayGift ? 'Annual Gift Voucher' : 'Not Included', active: benefits.birthdayGift },
  ];

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ py: 1.5, fontWeight: 'bold' }}>Benefit Privileges</TableCell>
            <TableCell sx={{ py: 1.5, fontWeight: 'bold' }}>Specification / Value</TableCell>
            <TableCell sx={{ py: 1.5, fontWeight: 'bold' }} align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {benefitRows.map((row, idx) => (
            <TableRow key={idx} hover>
              <TableCell sx={{ py: 1.2 }}>
                <Typography variant="body2" fontWeight={row.active ? 'bold' : 'normal'}>
                  {row.name}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.2 }}>
                <Typography variant="body2" color={row.active ? 'text.primary' : 'text.secondary'}>
                  {row.value}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.2 }} align="center">
                <Box display="flex" justifyContent="center">
                  {row.active ? (
                    <MdCheckCircle size={20} color="#2e7d32" />
                  ) : (
                    <MdCancel size={20} color="#757575" />
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
