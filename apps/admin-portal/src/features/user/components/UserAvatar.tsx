import React from 'react';
import { Avatar } from '@mui/material';

interface UserAvatarProps {
  username: string;
  fullName: string;
  avatarUrl?: string;
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  fullName,
  avatarUrl,
  size = 40,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const stringToColor = (string: string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  if (avatarUrl) {
    return <Avatar src={avatarUrl} sx={{ width: size, height: size }} />;
  }

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: stringToColor(username),
        fontSize: size * 0.4,
        fontWeight: 'bold',
      }}
    >
      {getInitials(fullName)}
    </Avatar>
  );
};
