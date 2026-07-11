import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import type { UserSession } from '../types/profile.types';

interface SessionListProps {
  sessions: UserSession[];
  onRevoke: (id: string) => void;
  onRevokeAllOthers: () => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  onRevoke,
  onRevokeAllOthers,
}) => {
  const getDeviceIcon = (type: UserSession['deviceType']) => {
    switch (type) {
      case 'Mobile':
        return <PhoneIphoneIcon sx={{ color: '#2dd4bf' }} />;
      case 'Tablet':
        return <TabletMacIcon sx={{ color: '#2dd4bf' }} />;
      case 'Desktop':
      default:
        return <LaptopMacIcon sx={{ color: '#2dd4bf' }} />;
    }
  };

  return (
    <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
            Quản Lý Phiên Hoạt Động
          </Typography>

          {sessions.length > 1 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={onRevokeAllOthers}
              sx={{ borderColor: 'rgba(211, 47, 47, 0.4)' }}
            >
              Đăng xuất các thiết bị khác
            </Button>
          )}
        </Stack>

        <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Thiết bị / Trình duyệt</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Vị trí</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Thời gian hoạt động</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {getDeviceIcon(session.deviceType)}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{session.deviceName}</Typography>
                        {session.current && (
                          <Chip label="Thiết bị này" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem', mt: 0.5, bgcolor: '#2dd4bf', color: '#0f172a', fontWeight: 'bold' }} />
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{session.location}</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>{session.lastActive}</TableCell>
                  <TableCell align="right">
                    {!session.current && (
                      <IconButton onClick={() => onRevoke(session.id)} color="error" title="Đăng xuất thiết bị">
                        <DeleteIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
export default SessionList;
