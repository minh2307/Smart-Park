import React, { useState, useRef } from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  FormControlLabel,
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  Radio as MuiRadio,
  RadioProps as MuiRadioProps,
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { MdVisibility, MdVisibilityOff, MdSearch, MdUpload } from 'react-icons/md';

// 1. TextField
export const TextField: React.FC<MuiTextFieldProps> = (props) => {
  return <MuiTextField fullWidth variant="outlined" {...props} />;
};

// 2. PasswordField
export const PasswordField: React.FC<MuiTextFieldProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <MuiTextField
      fullWidth
      variant="outlined"
      type={showPassword ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

// 3. NumberField
export const NumberField: React.FC<MuiTextFieldProps> = (props) => {
  return (
    <MuiTextField
      fullWidth
      variant="outlined"
      type="number"
      {...props}
    />
  );
};

// 4. Textarea
export const Textarea: React.FC<MuiTextFieldProps> = (props) => {
  return <MuiTextField fullWidth variant="outlined" multiline rows={4} {...props} />;
};

// 5. Select
interface Option {
  value: string | number;
  label: string;
}
interface SelectProps extends Omit<MuiSelectProps, 'options'> {
  label: string;
  options: Option[];
  error?: boolean;
  helperText?: string;
}
export const Select: React.FC<SelectProps> = ({ label, options, error, helperText, ...props }) => {
  const labelId = `${props.id || 'select'}-label`;
  return (
    <FormControl fullWidth error={error}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <MuiSelect labelId={labelId} label={label} {...props}>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <Typography variant="caption" color="error.main" sx={{ mt: 0.5 }}>{helperText}</Typography>}
    </FormControl>
  );
};

// 6. Checkbox
interface CheckboxProps extends MuiCheckboxProps {
  label: string;
}
export const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => {
  return <FormControlLabel control={<MuiCheckbox {...props} />} label={label} />;
};

// 7. Radio
interface RadioProps extends MuiRadioProps {
  label: string;
}
export const Radio: React.FC<RadioProps> = ({ label, ...props }) => {
  return <FormControlLabel control={<MuiRadio {...props} />} label={label} />;
};

// 8. Switch
interface SwitchProps extends MuiSwitchProps {
  label: string;
}
export const Switch: React.FC<SwitchProps> = ({ label, ...props }) => {
  return <FormControlLabel control={<MuiSwitch {...props} />} label={label} />;
};

// 9. SearchInput
export const SearchInput: React.FC<MuiTextFieldProps> = (props) => {
  return (
    <MuiTextField
      fullWidth
      variant="outlined"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <MdSearch size={20} />
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

// 10. OTPInput
interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}
export const OTPInput: React.FC<OTPInputProps> = ({ length = 6, value, onChange, disabled }) => {
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    const otp = value.split('');
    otp[index] = element.value;
    onChange(otp.join(''));
    if (element.nextSibling && element.value !== '') {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  return (
    <Box display="flex" gap={1} justifyContent="center">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          type="text"
          maxLength={1}
          disabled={disabled}
          value={value[idx] || ''}
          onChange={(e) => handleChange(e.target, idx)}
          onFocus={(e) => e.target.select()}
          style={{
            width: '40px',
            height: '45px',
            textAlign: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      ))}
    </Box>
  );
};

// 11. DatePicker, TimePicker, DateTimePicker
export const DatePicker: React.FC<MuiTextFieldProps> = (props) => {
  return <TextField type="date" InputLabelProps={{ shrink: true }} {...props} />;
};

export const TimePicker: React.FC<MuiTextFieldProps> = (props) => {
  return <TextField type="time" InputLabelProps={{ shrink: true }} {...props} />;
};

export const DateTimePicker: React.FC<MuiTextFieldProps> = (props) => {
  return <TextField type="datetime-local" InputLabelProps={{ shrink: true }} {...props} />;
};

// 12. FileUpload
interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}
export const FileUpload: React.FC<FileUploadProps> = ({ label, accept, onChange, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file ? file.name : '');
    onChange(file);
  };

  return (
    <Box>
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled}
      />
      <Box display="flex" gap={1.5} alignItems="center">
        <Button
          variant="outlined"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          startIcon={<MdUpload />}
        >
          {label}
        </Button>
        {fileName && (
          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
            {fileName}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
