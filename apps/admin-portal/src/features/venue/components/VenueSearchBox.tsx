import React from 'react';
import { SearchInput } from '../../../components/common/Form';

interface VenueSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const VenueSearchBox: React.FC<VenueSearchBoxProps> = ({
  value,
  onChange,
  placeholder = 'Search venues...',
}) => {
  return (
    <SearchInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      size="small"
    />
  );
};
