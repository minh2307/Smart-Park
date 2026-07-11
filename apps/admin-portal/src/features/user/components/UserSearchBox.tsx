import React from 'react';
import { SearchInput } from '../../../components/common/Form';

interface UserSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const UserSearchBox: React.FC<UserSearchBoxProps> = ({
  value,
  onChange,
  placeholder = 'Search users...',
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
