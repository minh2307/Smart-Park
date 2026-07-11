import React from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';

interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
}

export const RememberMeCheckbox: React.FC<RememberMeCheckboxProps> = ({
  checked,
  onChange,
  label = 'Remember Me',
  disabled = false,
}) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={onChange}
          color="primary"
          disabled={disabled}
        />
      }
      label={label}
    />
  );
};
