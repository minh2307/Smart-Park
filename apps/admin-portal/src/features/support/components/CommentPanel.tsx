import React, { useState } from 'react';
import { Box, TextField, Button, FormControlLabel, Switch, IconButton, Typography } from '@mui/material';
import { MdSend, MdAttachFile, MdInfo } from 'react-icons/md';

interface CommentPanelProps {
  onSendMessage: (text: string, isInternal: boolean) => void;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText, isInternalNote);
    setInputText('');
    setIsInternalNote(false);
    setAttachmentName(null);
  };

  const handleMockAttachment = () => {
    const files = ['hoa_don_thanh_toan.pdf', 'bang_chung_hong_tu.png', 've_dien_tu_qr.jpg'];
    const randomFile = files[Math.floor(Math.random() * files.length)];
    setAttachmentName(randomFile);
  };

  return (
    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
              color="warning"
              size="small"
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 500, color: isInternalNote ? 'warning.main' : 'text.secondary' }}>
              Chế độ Ghi chú nội bộ (Internal Note)
            </Typography>
          }
        />
        {isInternalNote && (
          <Tooltip title="Ghi chú này sẽ chỉ hiển thị với các nhân viên trong hệ thống quản trị, khách hàng không thể nhìn thấy.">
            <IconButton size="small">
              <MdInfo size={16} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {attachmentName && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'action.hover', p: 1, borderRadius: 1, mb: 1, width: 'fit-content' }}>
          <MdAttachFile size={16} />
          <Typography variant="caption">{attachmentName}</Typography>
          <Button size="small" onClick={() => setAttachmentName(null)} color="error">
            Gỡ bỏ
          </Button>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isInternalNote ? 'Viết ghi chú nghiệp vụ chỉ bộ phận CSKH nhìn thấy...' : 'Nhập tin nhắn phản hồi chính thức cho khách hàng...'}
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          size="small"
        />
        <IconButton onClick={handleMockAttachment} color="primary" sx={{ p: 1 }}>
          <MdAttachFile />
        </IconButton>
        <Button
          variant="contained"
          color={isInternalNote ? 'warning' : 'primary'}
          endIcon={<MdSend />}
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          Gửi
        </Button>
      </Box>
    </Box>
  );
};

// Shorthand helper for tooltip wrapping
const Tooltip: React.FC<{ title: string; children: React.ReactElement }> = ({ title, children }) => {
  return (
    <span style={{ cursor: 'help' }} title={title}>
      {children}
    </span>
  );
};
