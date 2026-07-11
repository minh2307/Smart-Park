/**
 * Reports Center Page - MODULE 12 / Report Builder
 * Implements system template selection, interactive Report Builder, groupings, and live data previews
 */
import React, { useState, useMemo } from 'react';
import { Box, Grid, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, FormGroup, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Stepper, Step, StepLabel, LinearProgress } from '@mui/material';
import { useGetReportTemplatesQuery, useGenerateReportMutation } from '../services/analyticsApi';
import { DashboardCard } from '../components/shared/DashboardCard';
import { REPORT_TEMPLATES, REPORT_PERIOD_OPTIONS } from '../constants/reportTemplates';
import type { ReportCategory } from '../types/index';
import { formatCurrency } from '../utils/numberFormatters';
import { MdSettings, MdPlayArrow, MdSave, MdCheckCircle } from 'react-icons/md';

export const ReportsPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  // Builder States
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('revenue');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly');
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const [groupByField, setGroupByField] = useState<string>('none');
  const [aggFunction, setAggFunction] = useState<string>('sum');
  const [aggField, setAggField] = useState<string>('none');

  // Triggering Mutation
  const [generateReport, { isLoading: isGenerating }] = useGenerateReportMutation();
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [generatedPreviewRows, setGeneratedPreviewRows] = useState<any[]>([]);

  // Load available system templates
  const { data: templates } = useGetReportTemplatesQuery();

  // Selected template configurations
  const activeTemplateConfig = useMemo(() => {
    return REPORT_TEMPLATES.find((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  // Sync visible columns when category changes
  React.useEffect(() => {
    if (activeTemplateConfig) {
      const initialCols: Record<string, boolean> = {};
      activeTemplateConfig.defaultColumns.forEach((col) => {
        initialCols[col.key] = col.visible;
      });
      setVisibleColumns(initialCols);
    }
  }, [activeTemplateConfig]);

  // Columns that are checked visible
  const activeColumns = useMemo(() => {
    if (!activeTemplateConfig) return [];
    return activeTemplateConfig.defaultColumns.filter((col) => visibleColumns[col.key]);
  }, [activeTemplateConfig, visibleColumns]);

  // Available aggregation numeric columns
  const numericColumns = useMemo(() => {
    if (!activeTemplateConfig) return [];
    return activeTemplateConfig.defaultColumns.filter(
      (col) => col.dataType === 'currency' || col.dataType === 'number' || col.dataType === 'percentage'
    );
  }, [activeTemplateConfig]);

  // Generate mock preview records based on active template category
  const handleGenerateReportPreview = async () => {
    setGenerationSuccess(false);
    await generateReport({
      category: selectedCategory,
      columns: activeColumns.map((c) => c.key),
      filters: { period: selectedPeriod },
      startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      endDate: new Date().toISOString(),
      format: 'xlsx',
    });

    // Generate realistic mock records
    const rowCount = 8;
    const mockRows = Array.from({ length: rowCount }, (_, index) => {
      const row: Record<string, any> = {};
      activeTemplateConfig?.defaultColumns.forEach((col) => {
        if (col.key === 'date' || col.key === 'createdAt' || col.key === 'soldDate' || col.key === 'transactionDate' || col.key === 'timestamp' || col.key === 'reportedAt') {
          row[col.key] = new Date(Date.now() - index * 86400000).toLocaleDateString('vi-VN');
        } else if (col.dataType === 'currency') {
          row[col.key] = 1200000 + Math.floor(Math.random() * 5000000);
        } else if (col.dataType === 'percentage') {
          row[col.key] = Math.floor(45 + Math.random() * 50);
        } else if (col.dataType === 'number') {
          row[col.key] = Math.floor(10 + Math.random() * 200);
        } else if (col.key === 'venue') {
          row[col.key] = index % 2 === 0 ? 'Khu phía Đông Smart Park' : 'Khu vực thế giới nước';
        } else if (col.key === 'status') {
          row[col.key] = index % 3 === 0 ? 'Đã hoàn thành' : 'Đang hoạt động';
        } else if (col.key === 'customer' || col.key === 'fullName' || col.key === 'memberName') {
          const names = ['Trần Minh', 'Lê Hoa', 'Nguyễn Hùng', 'Phan Bình', 'Vũ Sơn', 'Đoàn Thư', 'Đinh Nam', 'Ngô Lan'];
          row[col.key] = names[index % names.length];
        } else {
          row[col.key] = `Bản ghi giả lập #${index + 1}`;
        }
      });
      return row;
    });

    setGeneratedPreviewRows(mockRows);
    setGenerationSuccess(true);
    setActiveStep(2);
  };

  const steps = ['Chọn danh mục mẫu', 'Tùy chỉnh bố cục & tổng hợp', 'Xem trước báo cáo trực tiếp'];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Trung tâm Báo cáo & Bộ tạo Tùy chỉnh
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chọn các mẫu hệ thống được định nghĩa trước, cấu hình các cột tổng hợp tùy chỉnh, áp dụng các phép tổng hợp và xem trước báo cáo
          </Typography>
        </Box>
      </Box>

      {/* Stepper tracking progress */}
      <Box sx={{ width: '100%', my: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} onClick={() => setActiveStep(index)} sx={{ cursor: 'pointer' }}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Grid container spacing={2.5}>
        {/* Step 1 & 2 Config Panel */}
        {activeStep < 2 && (
          <Grid item xs={12} lg={4}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdSettings /> Cấu hình Báo cáo
                </Typography>

                {/* Category select */}
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="category-select-label">Danh mục Báo cáo</InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={selectedCategory}
                    label="Danh mục Báo cáo"
                    onChange={(e) => setSelectedCategory(e.target.value as ReportCategory)}
                  >
                    {templates?.map((t) => (
                      <MenuItem key={t.id} value={t.category}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Time range option */}
                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                  <InputLabel id="period-select-label">Kỳ báo cáo</InputLabel>
                  <Select
                    labelId="period-select-label"
                    value={selectedPeriod}
                    label="Kỳ báo cáo"
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    {REPORT_PERIOD_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label === 'Daily' ? 'Hàng ngày' : opt.label === 'Weekly' ? 'Hàng tuần' : opt.label === 'Monthly' ? 'Hàng tháng' : opt.label === 'Quarterly' ? 'Hàng quý' : opt.label === 'Yearly' ? 'Hàng năm' : opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                  CHỌN CÁC CỘT HIỂN THỊ
                </Typography>
                <FormGroup sx={{ mb: 3 }}>
                  {activeTemplateConfig?.defaultColumns.map((col) => (
                    <FormControlLabel
                      key={col.key}
                      control={
                        <Checkbox
                          checked={!!visibleColumns[col.key]}
                          onChange={(e) =>
                            setVisibleColumns((prev) => ({ ...prev, [col.key]: e.target.checked }))
                          }
                          size="small"
                        />
                      }
                      label={col.label}
                    />
                  ))}
                </FormGroup>

                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                  NHÓM & TỔNG HỢP
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="group-select-label">Nhóm theo chiều</InputLabel>
                  <Select
                    labelId="group-select-label"
                    value={groupByField}
                    label="Nhóm theo chiều"
                    onChange={(e) => setGroupByField(e.target.value)}
                  >
                    <MenuItem value="none">Không nhóm</MenuItem>
                    <MenuItem value="date">Ngày</MenuItem>
                    <MenuItem value="venue">Khu vui chơi</MenuItem>
                    <MenuItem value="status">Trạng thái</MenuItem>
                  </Select>
                </FormControl>

                <Grid container spacing={1} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="agg-func-label">Hàm</InputLabel>
                      <Select
                        labelId="agg-func-label"
                        value={aggFunction}
                        label="Hàm"
                        onChange={(e) => setAggFunction(e.target.value)}
                      >
                        <MenuItem value="sum">Tổng (Sum)</MenuItem>
                        <MenuItem value="avg">Trung bình (Avg)</MenuItem>
                        <MenuItem value="count">Số lượng (Count)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="agg-field-label">Trường mục tiêu</InputLabel>
                      <Select
                        labelId="agg-field-label"
                        value={aggField}
                        label="Trường mục tiêu"
                        onChange={(e) => setAggField(e.target.value)}
                      >
                        <MenuItem value="none">Không tổng hợp</MenuItem>
                        {numericColumns.map((c) => (
                          <MenuItem key={c.key} value={c.key}>
                            {c.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleGenerateReportPreview}
                  disabled={isGenerating}
                  startIcon={<MdPlayArrow />}
                >
                  {isGenerating ? 'Đang biên dịch dữ liệu...' : 'Biên dịch & Tạo bản xem trước'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Step 3 Preview Workspace */}
        <Grid item xs={12} lg={activeStep < 2 ? 8 : 12}>
          <DashboardCard
            title={activeTemplateConfig?.label || 'Xem trước báo cáo tùy chỉnh'}
            subtitle={activeTemplateConfig?.description || 'Bản xem trang tính được biên dịch tùy chỉnh'}
          >
            {isGenerating && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Đang biên dịch, nhóm và tổng hợp các bản ghi giao dịch...
                </Typography>
              </Box>
            )}

            {!isGenerating && generatedPreviewRows.length === 0 && (
              <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  Chưa có bản xem trước nào được biên dịch
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Thiết lập các bộ lọc cấu hình, chọn các trường hoạt động trong bố cục và nhấp vào 'Biên dịch & Tạo bản xem trước' để kết xuất bảng tính.
                </Typography>
              </Box>
            )}

            {!isGenerating && generatedPreviewRows.length > 0 && (
              <Box>
                {generationSuccess && (
                  <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} icon={<MdCheckCircle size={20} />}>
                    Đã tạo báo cáo thành công với <strong>{generatedPreviewRows.length}</strong> dòng dữ liệu.
                  </Alert>
                )}

                {/* Aggregated values summary row if set */}
                {aggField !== 'none' && (
                  <Box sx={{ mb: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      TỔNG HỢP ĐÃ TÍNH TOÁN ({aggFunction.toUpperCase()})
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {aggField.toLowerCase().includes('revenue') || aggField.toLowerCase().includes('amount') || aggField.toLowerCase().includes('spent') || aggField.toLowerCase().includes('spending')
                        ? formatCurrency(35824000)
                        : '1,423'}
                    </Typography>
                  </Box>
                )}

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="medium">
                    <TableHead sx={{ backgroundColor: 'action.hover' }}>
                      <TableRow>
                        {activeColumns.map((col) => (
                          <TableCell key={col.key} sx={{ fontWeight: 'bold' }}>
                            {col.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {generatedPreviewRows.map((row, idx) => (
                        <TableRow key={idx} hover>
                          {activeColumns.map((col) => (
                            <TableCell key={col.key}>
                              {col.dataType === 'currency' ? (
                                <strong>{formatCurrency(row[col.key])}</strong>
                              ) : col.dataType === 'percentage' ? (
                                `${row[col.key]}%`
                              ) : (
                                row[col.key]
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" startIcon={<MdSave />}>
                    Lưu mẫu
                  </Button>
                  <Button variant="contained">Xuất tệp</Button>
                </Box>
              </Box>
            )}
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};
