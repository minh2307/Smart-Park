/**
 * Export Center Page - MODULE 13
 * Manages background bulk exports, format selections, scheduled emails, and download history
 */
import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Stack } from '@mui/material';
import { useGetExportHistoryQuery } from '../services/analyticsApi';
import { DashboardCard } from '../components/shared/DashboardCard';
import { StatusChip } from '../components/shared/StatusChip';
import type { ExportJob, ExportFormat } from '../types/index';
import { MdCloudDownload, MdEmail, MdSchedule } from 'react-icons/md';

export const ExportPage: React.FC = () => {

  // Simulated active export jobs
  const [activeJobs, setActiveJobs] = useState<ExportJob[]>([]);
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleRecipients, setScheduleRecipients] = useState('');
  const [scheduleFreq, setScheduleFreq] = useState('weekly');
  const [scheduleFormat, setScheduleFormat] = useState<ExportFormat>('xlsx');
  const [scheduledList, setScheduledList] = useState<any[]>([
    { id: 'sch-1', name: 'Tóm tắt doanh thu hàng tuần', format: 'xlsx', frequency: 'weekly', emails: 'finance@smartpark.com', nextRun: '2026-07-14' },
    { id: 'sch-2', name: 'Kiểm toán lượt quét khách hàng hàng ngày', format: 'csv', frequency: 'daily', emails: 'ops-leads@smartpark.com', nextRun: '2026-07-11' },
  ]);

  // Load from RTK Query
  const { data: initialHistory } = useGetExportHistoryQuery();

  // Initialize jobs with initial history logs
  useEffect(() => {
    if (initialHistory) {
      setActiveJobs(initialHistory);
    }
  }, [initialHistory]);

  // Run a background export simulation
  const handleTriggerExport = (format: ExportFormat, name: string) => {
    const jobId = `job-${Date.now()}`;
    const newJob: ExportJob = {
      id: jobId,
      reportName: name,
      format,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    // Add to top of list
    setActiveJobs((prev) => [newJob, ...prev]);

    // Simulate progress increments
    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += 25;
      setActiveJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.id === jobId) {
            if (currentProg >= 100) {
              clearInterval(interval);
              return {
                ...job,
                status: 'completed',
                progress: 100,
                fileSize: 102450 + Math.floor(Math.random() * 200000),
                completedAt: new Date().toISOString(),
                fileUrl: '#',
              };
            }
            return {
              ...job,
              status: 'processing',
              progress: currentProg,
            };
          }
          return job;
        })
      );
    }, 1000);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleName) return;

    const newSch = {
      id: `sch-${Date.now()}`,
      name: scheduleName,
      format: scheduleFormat,
      frequency: scheduleFreq,
      emails: scheduleRecipients || 'admin@smartpark.com',
      nextRun: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    };

    setScheduledList((prev) => [...prev, newSch]);
    setScheduleName('');
    setScheduleRecipients('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Trung tâm Xuất dữ liệu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thực hiện xuất báo cáo hàng loạt chạy nền (Excel, CSV, PDF, JSON), theo dõi tiến trình nhiệm vụ và cấu hình gửi email
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5}>
        {/* Quick export triggers */}
        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdCloudDownload /> Xuất dữ liệu chạy nền theo yêu cầu
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Kích hoạt biên dịch bất đồng bộ các phân hệ hệ thống. Tải xuống tệp cục bộ sau khi tiến trình hoàn thành.
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleTriggerExport('xlsx', 'Nhật ký kiểm toán doanh thu')}
                >
                  Xuất nhật ký doanh thu (.xlsx)
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleTriggerExport('csv', 'Kiểm tra vé hàng ngày')}
                >
                  Xuất lượt quét vé (.csv)
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleTriggerExport('pdf', 'Tóm tắt nhật ký sự cố')}
                >
                  Xuất nhật ký sự cố (.pdf)
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleTriggerExport('json', 'Luồng truyền dữ liệu vận hành')}
                >
                  Xuất dữ liệu vận hành thiết bị (.json)
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Scheduling deliverable Form */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdSchedule /> Lên lịch báo cáo gửi Email tự động
              </Typography>
              <Box component="form" onSubmit={handleAddSchedule} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Tiêu đề báo cáo"
                  size="small"
                  fullWidth
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder="Ví dụ: Lượt vào cổng VIP hàng tuần"
                  required
                />
                <TextField
                  label="Email người nhận (cách nhau bằng dấu phẩy)"
                  size="small"
                  fullWidth
                  value={scheduleRecipients}
                  onChange={(e) => setScheduleRecipients(e.target.value)}
                  placeholder="manager@smartpark.com"
                />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tần suất</InputLabel>
                      <Select value={scheduleFreq} label="Tần suất" onChange={(e) => setScheduleFreq(e.target.value)}>
                        <MenuItem value="daily">Hàng ngày</MenuItem>
                        <MenuItem value="weekly">Hàng tuần</MenuItem>
                        <MenuItem value="monthly">Hàng tháng</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Định dạng</InputLabel>
                      <Select
                        value={scheduleFormat}
                        label="Định dạng"
                        onChange={(e) => setScheduleFormat(e.target.value as ExportFormat)}
                      >
                        <MenuItem value="xlsx">Excel</MenuItem>
                        <MenuItem value="csv">CSV</MenuItem>
                        <MenuItem value="pdf">PDF</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Button type="submit" variant="contained" fullWidth>
                  Lưu lịch trình
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* History and Active Scheduled Lists */}
        <Grid item xs={12} lg={8}>
          <DashboardCard title="Lịch trình gửi tự động đang hoạt động" subtitle="Mẫu báo cáo được cấu hình để gửi email tự động">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên báo cáo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Định dạng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lịch trình</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Người nhận</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lần gửi tiếp theo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Kênh gửi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scheduledList.map((sch) => (
                    <TableRow key={sch.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{sch.name}</TableCell>
                      <TableCell sx={{ textTransform: 'uppercase' }}>{sch.format}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {sch.frequency === 'daily' ? 'Hàng ngày' : sch.frequency === 'weekly' ? 'Hàng tuần' : sch.frequency === 'monthly' ? 'Hàng tháng' : sch.frequency}
                      </TableCell>
                      <TableCell>{sch.emails}</TableCell>
                      <TableCell>{sch.nextRun}</TableCell>
                      <TableCell sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5, py: 2 }}>
                        <MdEmail /> Email
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>

          <DashboardCard title="Lịch sử xuất dữ liệu & Tải xuống" subtitle="Nhật ký trạng thái của tất cả các tập dữ liệu lớn và báo cáo được yêu cầu">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên báo cáo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Định dạng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Dung lượng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái / Tiến độ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Hoàn thành lúc</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeJobs.map((job) => (
                    <TableRow key={job.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{job.reportName}</TableCell>
                      <TableCell sx={{ textTransform: 'uppercase' }}>{job.format}</TableCell>
                      <TableCell>{job.fileSize ? `${(job.fileSize / 1024).toFixed(1)} KB` : '—'}</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        {job.status === 'processing' ? (
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                              Đang biên dịch... {job.progress}%
                            </Typography>
                            <LinearProgress variant="determinate" value={job.progress} />
                          </Box>
                        ) : (
                          <StatusChip
                            label={job.status === 'completed' ? 'Thành công' : job.status === 'pending' ? 'Đang chờ' : 'Thất bại'}
                            status={job.status === 'completed' ? 'active' : job.status === 'pending' ? 'pending' : 'error'}
                          />
                        )}
                      </TableCell>
                      <TableCell>{job.completedAt ? new Date(job.completedAt).toLocaleTimeString('vi-VN') : '—'}</TableCell>
                      <TableCell>
                        {job.status === 'completed' ? (
                          <Button size="small" variant="contained" href={job.fileUrl}>
                            Tải xuống
                          </Button>
                        ) : job.status === 'failed' ? (
                          <Typography variant="caption" color="error.main">
                            Thất bại
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Đang xử lý
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};
