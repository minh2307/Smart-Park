import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
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
import { EmailTemplate } from '../types';

interface EmailTemplateEditorProps {
  templates: EmailTemplate[];
  onCreate: (values: Partial<EmailTemplate>) => void;
  onUpdate: (id: number, values: Partial<EmailTemplate>) => void;
}

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  templates,
  onCreate,
  onUpdate,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(templates[0]?.id || null);
  const selectedTemplate = templates.find((t) => t.id === selectedId) || null;

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<any>('SYSTEM');
  const [variables, setVariables] = useState<string[]>([]);
  const [newVar, setNewVar] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Sync edits
  React.useEffect(() => {
    if (selectedTemplate && !isCreating) {
      setName(selectedTemplate.templateName);
      setSubject(selectedTemplate.subject);
      setBody(selectedTemplate.bodyHtml);
      setCategory(selectedTemplate.category);
      setVariables(selectedTemplate.variables);
    }
  }, [selectedTemplate, isCreating]);

  const handleSave = () => {
    if (!name.trim() || !subject.trim() || !body.trim()) return;

    if (isCreating) {
      onCreate({
        templateName: name,
        subject,
        bodyHtml: body,
        category,
        variables,
      });
      setIsCreating(false);
    } else if (selectedId) {
      onUpdate(selectedId, {
        templateName: name,
        subject,
        bodyHtml: body,
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
    setSubject('');
    setBody('');
    setCategory('SYSTEM');
    setVariables([]);
    setIsCreating(true);
  };

  // Compile mock preview by replacing double braces with default text
  const getCompiledPreview = () => {
    let preview = body;
    const defaults: { [key: string]: string } = {
      fullName: 'Nguyễn Văn A',
      email: 'customer@gmail.com',
      bookingCode: 'BK-8849',
      amount: '500,000',
      customerName: 'Nguyễn Văn A',
      ticketCount: '2',
      expiryDate: '31/12/2026',
      resetLink: 'https://gateos.vn/reset-password?token=mockToken',
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
                Mẫu Email Hệ Thống
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
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    {isCreating ? 'Soạn thảo Email Template mới' : 'Thiết kế cấu trúc mẫu'}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        label="Tên mẫu email"
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
                          <MenuItem value="REGISTRATION">Registration</MenuItem>
                          <MenuItem value="BOOKING">Booking</MenuItem>
                          <MenuItem value="PAYMENT">Payment</MenuItem>
                          <MenuItem value="REFUND">Refund</MenuItem>
                          <MenuItem value="SECURITY">Security</MenuItem>
                          <MenuItem value="MARKETING">Marketing</MenuItem>
                          <MenuItem value="SUPPORT">Support</MenuItem>
                          <MenuItem value="SYSTEM">System</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Tiêu đề thư (Subject)"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        fullWidth
                        required
                      />
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
                            color="primary"
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
                          placeholder="e.g. otpCode"
                          size="small"
                        />
                        <Button variant="outlined" onClick={handleAddVar}>
                          Thêm Biến
                        </Button>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Nội dung mã nguồn (HTML Body)"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        fullWidth
                        multiline
                        rows={12}
                        required
                        inputProps={{ style: { fontFamily: 'monospace', fontSize: '13px' } }}
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      {isCreating && (
                        <Button variant="outlined" onClick={() => setIsCreating(false)}>
                          Hủy bỏ
                        </Button>
                      )}
                      <Button variant="contained" color="primary" onClick={handleSave}>
                        Lưu Mẫu & Cập Nhật
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Live sandbox preview */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Live Preview (Hộp cát thử nghiệm)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Tự động điền dữ liệu giả lập cho các trường động được khai báo.
                  </Typography>

                  <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, p: 2, bg: '#fff', mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Chủ đề:</strong> {subject || '(Trống)'}
                    </Typography>
                  </Box>

                  <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, flexGrow: 1, overflow: 'hidden', bg: '#f8fafc', minHeight: '380px' }}>
                    <iframe
                      title="Email Render Sandbox"
                      srcDoc={getCompiledPreview()}
                      style={{ border: 'none', width: '100%', height: '100%', minHeight: '380px' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};
