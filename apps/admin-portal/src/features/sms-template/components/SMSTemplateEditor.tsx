import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { SMSTemplate } from '../types';

interface SMSTemplateEditorProps {
  templates: SMSTemplate[];
  onCreate: (values: Partial<SMSTemplate>) => void;
  onUpdate: (id: number, values: Partial<SMSTemplate>) => void;
}

export const SMSTemplateEditor: React.FC<SMSTemplateEditorProps> = ({
  templates,
  onCreate,
  onUpdate,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(templates[0]?.id || null);
  const selectedTemplate = templates.find((t) => t.id === selectedId) || null;

  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<any>('NOTIFICATION');
  const [variables, setVariables] = useState<string[]>([]);
  const [newVar, setNewVar] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  React.useEffect(() => {
    if (selectedTemplate && !isCreating) {
      setName(selectedTemplate.templateName);
      setBody(selectedTemplate.body);
      setCategory(selectedTemplate.category);
      setVariables(selectedTemplate.variables);
    }
  }, [selectedTemplate, isCreating]);

  const handleSave = () => {
    if (!name.trim() || !body.trim()) return;

    if (isCreating) {
      onCreate({
        templateName: name,
        body,
        category,
        variables,
      });
      setIsCreating(false);
    } else if (selectedId) {
      onUpdate(selectedId, {
        templateName: name,
        body,
        category,
        variables,
      });
    }
  };

  const handleAddVar = () => {
    if (newVar.trim() && !variables.includes(newVar.trim())) {
      setVariables([...variables, newVar.trim()]);
      setNewVar('');
    }
  };

  const handleRemoveVar = (v: string) => {
    setVariables(variables.filter((item) => item !== v));
  };

  const startNew = () => {
    setSelectedId(null);
    setName('');
    setBody('');
    setCategory('NOTIFICATION');
    setVariables([]);
    setIsCreating(true);
  };

  const getCharCount = () => {
    return body.length;
  };

  const getSmsSegmentsCount = () => {
    const len = body.length;
    if (len <= 160) return 1;
    return Math.ceil(len / 153);
  };

  const getCompiledSmsBody = () => {
    let preview = body;
    const defaults: { [key: string]: string } = {
      otpCode: '883901',
      memberId: 'VIP-99201',
      points: '+150',
      balance: '4,500',
    };
    variables.forEach((v) => {
      const reg = new RegExp(`{{\\s*${v}\\s*}}`, 'g');
      preview = preview.replace(reg, defaults[v] || `[${v}]`);
    });
    return preview;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Mẫu SMS Hệ Thống
              </Typography>
              <Button size="small" variant="contained" onClick={startNew}>
                Tạo mới
              </Button>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <List component="nav">
              {templates.map((t) => (
                <ListItemButton
                  key={t.id}
                  selected={selectedId === t.id}
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedId(t.id);
                  }}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemText
                    primary={t.templateName}
                    secondary={`V${t.version} - ${t.category}`}
                    primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: selectedId === t.id ? 600 : 400 } }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {(selectedTemplate || isCreating) && (
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            {/* Editor form */}
            <Grid item xs={12} lg={7}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    {isCreating ? 'Soạn thảo SMS Template mới' : 'Biên tập mẫu nội dung SMS'}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        label="Tên mẫu SMS"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Danh mục</InputLabel>
                        <Select
                          value={category}
                          label="Danh mục"
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <MenuItem value="OTP">Mã xác thực OTP</MenuItem>
                          <MenuItem value="NOTIFICATION">Thông báo thường</MenuItem>
                          <MenuItem value="TRANSACTION">Biến động số dư</MenuItem>
                          <MenuItem value="MARKETING">Quảng cáo marketing</MenuItem>
                          <MenuItem value="ALERT">Cảnh báo khẩn cấp</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Placeholder vars */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Placeholder Variables (Trường dữ liệu động)
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {variables.map((v) => (
                          <Chip
                            key={v}
                            label={`{{${v}}}`}
                            onDelete={() => handleRemoveVar(v)}
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label="Biến mới"
                          value={newVar}
                          onChange={(e) => setNewVar(e.target.value)}
                          placeholder="e.g. points"
                          size="small"
                        />
                        <Button variant="outlined" color="success" onClick={handleAddVar}>
                          Thêm Biến
                        </Button>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Nội dung tin nhắn SMS (Không dấu)"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        fullWidth
                        multiline
                        rows={6}
                        required
                        helperText="Nên sử dụng tin nhắn không dấu để tránh lỗi hiển thị trên một số thiết bị cũ."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                        <Typography variant="body2">
                          Số ký tự: <strong>{getCharCount()}</strong> / 160 ký tự mỗi trang
                        </Typography>
                        <Typography variant="body2">
                          Số trang tin nhắn: <strong>{getSmsSegmentsCount()}</strong> SMS
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      {isCreating && (
                        <Button variant="outlined" onClick={() => setIsCreating(false)}>
                          Hủy bỏ
                        </Button>
                      )}
                      <Button variant="contained" color="success" onClick={handleSave}>
                        Lưu Mẫu & Cập Nhật
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Mobile preview */}
            <Grid item xs={12} lg={5}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, alignSelf: 'flex-start' }}>
                  Xem Trước Giao Diện Điện Thoại
                </Typography>

                {/* iPhone style phone simulator */}
                <Box
                  sx={{
                    width: '280px',
                    height: '520px',
                    border: '12px solid #1e293b',
                    borderRadius: '36px',
                    bgcolor: '#fff',
                    position: 'relative',
                    boxShadow: 8,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Status Bar */}
                  <Box sx={{ height: '30px', bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'space-between', px: 2, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 600 }}>09:41</Typography>
                    <Box sx={{ width: '40px', height: '12px', bgcolor: '#cbd5e1', borderRadius: '6px' }} />
                  </Box>

                  {/* SMS Header */}
                  <Box sx={{ p: 1.5, borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f8fafc' }}>
                    <Box sx={{ width: '32px', height: '32px', borderRadius: '50%', bgcolor: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600, mb: 0.5 }}>
                      OS
                    </Box>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600 }}>GateOS BrandName</Typography>
                  </Box>

                  {/* SMS Message list */}
                  <Box sx={{ p: 2, flexGrow: 1, bgcolor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%', bgcolor: '#e2e8f0', borderRadius: '16px', p: 1.5, mb: 1, boxShadow: 1 }}>
                      <Typography sx={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.4, wordBreak: 'break-word' }}>
                        {getCompiledSmsBody() || '(Nội dung tin nhắn trống)'}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '9px', color: '#94a3b8', alignSelf: 'flex-start', pl: 1 }}>
                      Hôm nay 09:41
                    </Typography>
                  </Box>

                  {/* SMS Input bar */}
                  <Box sx={{ p: 1, borderTop: '1px solid #e2e8f0', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1, height: '28px', bgcolor: '#fff', borderRadius: '14px', border: '1px solid #cbd5e1' }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};
