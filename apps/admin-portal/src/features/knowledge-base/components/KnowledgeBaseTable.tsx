import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  TablePagination,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { KBArticle, ArticleStatus } from '../types';

interface KBTableProps {
  articles: KBArticle[];
  totalElements: number;
  page: number;
  size: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
  onCreate: (values: Partial<KBArticle>) => void;
  onUpdate: (id: number, values: Partial<KBArticle>) => void;
  onDelete: (id: number) => void;
}

export const KBTable: React.FC<KBTableProps> = ({
  articles,
  totalElements,
  page,
  size,
  onPageChange,
  onSizeChange,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<KBArticle | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<any>('GENERAL');
  const [status, setStatus] = useState<ArticleStatus>('DRAFT');
  const [tagsStr, setTagsStr] = useState('');

  React.useEffect(() => {
    if (editTarget) {
      setTitle(editTarget.title);
      setContent(editTarget.content);
      setCategory(editTarget.category);
      setStatus(editTarget.status);
      setTagsStr(editTarget.tags.join(', '));
    } else {
      setTitle('');
      setContent('');
      setCategory('GENERAL');
      setStatus('DRAFT');
      setTagsStr('');
    }
  }, [editTarget, formOpen]);

  const handleOpenEdit = (item: KBArticle) => {
    setEditTarget(item);
    setFormOpen(true);
  };

  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleFormSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const values = {
      title,
      content,
      category,
      status,
      tags,
    };

    if (editTarget) {
      onUpdate(editTarget.id, values);
    } else {
      onCreate(values);
    }

    setFormOpen(false);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<MdAdd />} onClick={handleOpenCreate}>
          Viết Bài Hướng Dẫn Mới
        </Button>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Mã</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tiêu Đề / Nội Dung Tóm Tắt</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Danh Mục</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Từ Khóa (Tags)</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Số Lượt Đọc</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Hữu Ích (Like)</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Cập Nhật Cuối</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có bài viết hướng dẫn nào được soạn thảo.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              articles.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>#{item.id}</TableCell>
                  <TableCell sx={{ maxWidth: '300px' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {item.content}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {item.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="filled" sx={{ height: '20px', fontSize: '10px' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      size="small"
                      color={item.status === 'PUBLISHED' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{item.viewCount} lượt</TableCell>
                  <TableCell>{item.helpfulCount} lượt</TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bởi: {item.updatedBy}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Sửa bài viết">
                      <IconButton onClick={() => handleOpenEdit(item)} size="small" color="primary">
                        <MdEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton onClick={() => onDelete(item.id)} size="small" color="error">
                        <MdDelete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={size}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
      />

      {/* Editor Modal Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editTarget ? `Sửa bài viết KB #${editTarget.id}` : 'Thêm bài viết kiến thức mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Tiêu đề bài viết FAQ"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                  onChange={(e: any) => setCategory(e.target.value)}
                >
                  <MenuItem value="TICKETING">Mua Vé / Đổi Vé</MenuItem>
                  <MenuItem value="RIDES">Khu Vui Chơi / Trò Chơi</MenuItem>
                  <MenuItem value="RULES_REGULATIONS">Quy Định Công Viên</MenuItem>
                  <MenuItem value="MEMBERSHIPS">Hạng Thẻ Hội Viên</MenuItem>
                  <MenuItem value="PARKING">Bãi Gửi Xe</MenuItem>
                  <MenuItem value="SAFETY">An Toàn & Thất Lạc</MenuItem>
                  <MenuItem value="REFUNDS">Chính Sách Hoàn Tiền</MenuItem>
                  <MenuItem value="GENERAL">Câu Hỏi Chung</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Từ khóa tìm kiếm (Tags) - Phân cách bằng dấu phẩy"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                fullWidth
                placeholder="e.g. hoan tien, thoi tiet, huy ve"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Nội dung chi tiết bài viết"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                multiline
                rows={10}
                required
                placeholder="Viết nội dung giải pháp, quy trình, hoặc câu trả lời mẫu..."
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái phát hành</InputLabel>
                <Select
                  value={status}
                  label="Trạng thái phát hành"
                  onChange={(e: any) => setStatus(e.target.value as ArticleStatus)}
                >
                  <MenuItem value="DRAFT">Nháp (Draft)</MenuItem>
                  <MenuItem value="PUBLISHED">Công bố (Published)</MenuItem>
                  <MenuItem value="ARCHIVED">Lưu trữ (Archived)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Hủy Bỏ</Button>
          <Button onClick={handleFormSubmit} variant="contained" color="primary" disabled={!title.trim() || !content.trim()}>
            Lưu Bài Viết
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
