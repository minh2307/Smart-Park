import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Divider,
  Autocomplete,
  Chip,
} from '@mui/material';
import { UseFormSetValue } from 'react-hook-form';

interface EligibilityRuleBuilderProps {
  setValue: UseFormSetValue<any>;
  initialVenues?: string[];
  initialTicketTypes?: string[];
  initialMemberships?: string[];
  initialCustomerGroups?: string[];
}

export const EligibilityRuleBuilder: React.FC<EligibilityRuleBuilderProps> = ({
  setValue,
  initialVenues = [],
  initialTicketTypes = [],
  initialMemberships = [],
  initialCustomerGroups = [],
}) => {
  // Mock options
  const venueOptions = ['Adventure Park', 'Fantasy Land', 'Water World', 'Science Discovery', 'VR Center'];
  const ticketTypeOptions = ['Standard Admission', 'VIP Pass', 'Annual Membership', 'Express Pass', 'Kids Pass'];
  const membershipOptions = ['Bronze Base', 'Silver Rewards', 'Gold Elite', 'Platinum Prestige', 'All Memberships'];
  const customerGroupOptions = ['General Visitors', 'VIP Guests', 'Local Residents', 'Online Buyers', 'Repeat Guests'];

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Cau hinh dieu kien ap dung (Eligibility Rules)
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            options={venueOptions}
            defaultValue={initialVenues}
            onChange={(_e, val) => setValue('applicableVenues', val)}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} size="small" />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Dia diem ap dung (Venues)" placeholder="Chon dia diem" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            options={ticketTypeOptions}
            defaultValue={initialTicketTypes}
            onChange={(_e, val) => setValue('applicableTicketTypes', val)}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} size="small" />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Loai ve ap dung (Ticket Types)" placeholder="Chon loai ve" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            options={membershipOptions}
            defaultValue={initialMemberships}
            onChange={(_e, val) => setValue('applicableMemberships', val)}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} size="small" />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Hang thanh vien (Memberships)" placeholder="Chon hang thanh vien" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            options={customerGroupOptions}
            defaultValue={initialCustomerGroups}
            onChange={(_e, val) => setValue('applicableCustomerGroups', val)}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} size="small" />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Nhom khach hang (Customer Groups)" placeholder="Chon nhom" />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
export default EligibilityRuleBuilder;
