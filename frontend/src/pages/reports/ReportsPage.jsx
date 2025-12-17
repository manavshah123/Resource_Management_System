import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  FolderOpen as ProjectIcon,
  TrendingUp as TrendIcon,
  Schedule as ScheduleIcon,
  School as TrainingIcon,
  EmojiEvents as PerformanceIcon,
  Today as DailyIcon,
  DateRange as WeeklyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { PageHeader, FormField } from '@components/common';
import { useUIStore } from '@store/uiStore';
import { reportApi } from '@api/reportApi';

const reportTypes = [
  {
    id: 'utilization',
    name: 'Employee Utilization',
    description: 'FTE allocation and utilization metrics across departments',
    icon: TrendIcon,
    color: '#3b82f6',
    formats: ['pdf', 'excel'],
    needsDates: true,
  },
  {
    id: 'bench',
    name: 'Bench Report',
    description: 'Employees currently without project allocation',
    icon: PeopleIcon,
    color: '#ef4444',
    formats: ['pdf', 'excel'],
    needsDates: false,
  },
  {
    id: 'skill-evolution',
    name: 'Skill Evolution',
    description: 'Skill growth and trends analysis over time',
    icon: AssessmentIcon,
    color: '#8b5cf6',
    formats: ['excel'],
    needsDates: true,
  },
  {
    id: 'project-needs',
    name: 'Project Needs',
    description: 'Upcoming project resource requirements and skill gaps',
    icon: ProjectIcon,
    color: '#f59e0b',
    formats: ['excel'],
    needsDates: false,
  },
  {
    id: 'training-progress',
    name: 'Training Progress',
    description: 'Training completion rates and employee progress',
    icon: TrainingIcon,
    color: '#10b981',
    formats: ['pdf', 'excel'],
    needsDates: false,
  },
  {
    id: 'performance',
    name: 'Performance Scores',
    description: 'Quiz scores, certifications, and skill acquisition',
    icon: PerformanceIcon,
    color: '#ec4899',
    formats: ['excel'],
    needsDates: true,
  },
  {
    id: 'daily-summary',
    name: 'Daily Summary',
    description: "Today's metrics, alerts, and key statistics",
    icon: DailyIcon,
    color: '#06b6d4',
    formats: ['pdf'],
    needsDates: false,
  },
  {
    id: 'weekly-summary',
    name: 'Weekly Summary',
    description: 'Weekly trends, highlights, and performance overview',
    icon: WeeklyIcon,
    color: '#6366f1',
    formats: ['pdf'],
    needsDates: false,
  },
];

const scheduledReports = [
  { name: 'Daily Summary', schedule: 'Every day at 8:00 AM', enabled: true },
  { name: 'Weekly Report', schedule: 'Every Monday at 9:00 AM', enabled: true },
];

function ReportsPage() {
  const { showSnackbar } = useUIStore();
  const [selectedReport, setSelectedReport] = useState(null);
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [generating, setGenerating] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleSelectReport = async (report) => {
    setSelectedReport(report);
    setFormat(report.formats[0]);
    setPreviewData(null);
  };

  const handlePreviewReport = async () => {
    if (!selectedReport) return;

    setLoading(true);
    try {
      let response;
      switch (selectedReport.id) {
        case 'utilization':
          response = await reportApi.getUtilizationReport(dateRange.start, dateRange.end);
          break;
        case 'bench':
          response = await reportApi.getBenchReport();
          break;
        case 'skill-evolution':
          response = await reportApi.getSkillEvolutionReport(dateRange.start, dateRange.end);
          break;
        case 'project-needs':
          response = await reportApi.getProjectNeedsReport();
          break;
        case 'training-progress':
          response = await reportApi.getTrainingProgressReport();
          break;
        case 'performance':
          response = await reportApi.getPerformanceReport(dateRange.start, dateRange.end);
          break;
        case 'daily-summary':
          response = await reportApi.getDailySummaryReport();
          break;
        case 'weekly-summary':
          response = await reportApi.getWeeklySummaryReport();
          break;
        default:
          throw new Error('Unknown report type');
      }
      setPreviewData(response.data);
      showSnackbar('Report data loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading report:', error);
      showSnackbar(error.response?.data?.message || 'Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedReport) {
      showSnackbar('Please select a report type', 'error');
      return;
    }

    setGenerating(true);
    try {
      switch (selectedReport.id) {
        case 'utilization':
          if (format === 'pdf') {
            await reportApi.downloadUtilizationPdf(dateRange.start, dateRange.end);
          } else {
            await reportApi.downloadUtilizationExcel(dateRange.start, dateRange.end);
          }
          break;
        case 'bench':
          if (format === 'pdf') {
            await reportApi.downloadBenchPdf();
          } else {
            await reportApi.downloadBenchExcel();
          }
          break;
        case 'skill-evolution':
          await reportApi.downloadSkillEvolutionExcel(dateRange.start, dateRange.end);
          break;
        case 'project-needs':
          await reportApi.downloadProjectNeedsExcel();
          break;
        case 'training-progress':
          if (format === 'pdf') {
            await reportApi.downloadTrainingProgressPdf();
          } else {
            await reportApi.downloadTrainingProgressExcel();
          }
          break;
        case 'performance':
          await reportApi.downloadPerformanceExcel(dateRange.start, dateRange.end);
          break;
        case 'daily-summary':
          await reportApi.downloadDailySummaryPdf();
          break;
        case 'weekly-summary':
          await reportApi.downloadWeeklySummaryPdf();
          break;
        default:
          throw new Error('Unknown report type');
      }
      showSnackbar(`${selectedReport.name} downloaded successfully`, 'success');
    } catch (error) {
      console.error('Error downloading report:', error);
      showSnackbar(error.response?.data?.message || 'Failed to download report', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const renderPreviewData = () => {
    if (!previewData) return null;

    const renderUtilizationPreview = () => (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
              <Typography variant="h4" color="primary.main">{previewData.totalEmployees}</Typography>
              <Typography variant="body2" color="text.secondary">Total Employees</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
              <Typography variant="h4" color="success.main">{previewData.allocatedEmployees}</Typography>
              <Typography variant="body2" color="text.secondary">Allocated</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.lighter', borderRadius: 2 }}>
              <Typography variant="h4" color="warning.main">{previewData.benchEmployees}</Typography>
              <Typography variant="body2" color="text.secondary">On Bench</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
              <Typography variant="h4" color="info.main">{previewData.averageUtilization?.toFixed(1)}%</Typography>
              <Typography variant="body2" color="text.secondary">Avg Utilization</Typography>
            </Box>
          </Grid>
        </Grid>
        {previewData.employees && previewData.employees.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell align="center">Current FTE</TableCell>
                  <TableCell align="center">Utilization</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.employees.slice(0, 10).map((emp, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell align="center">{emp.currentFTE?.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(emp.utilizationPercentage || 0, 100)}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                        />
                        <Typography variant="caption">{emp.utilizationPercentage?.toFixed(0)}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={emp.status}
                        color={emp.status === 'ALLOCATED' ? 'success' : emp.status === 'BENCH' ? 'warning' : 'error'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );

    const renderBenchPreview = () => (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.lighter', borderRadius: 2 }}>
              <Typography variant="h4" color="warning.main">{previewData.totalBenchEmployees}</Typography>
              <Typography variant="body2" color="text.secondary">Total on Bench</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
              <Typography variant="h4" color="info.main">{previewData.averageBenchDays?.toFixed(0)}</Typography>
              <Typography variant="body2" color="text.secondary">Avg Days on Bench</Typography>
            </Box>
          </Grid>
        </Grid>
        {previewData.employees && previewData.employees.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell align="center">Days on Bench</TableCell>
                  <TableCell>Top Skills</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.employees.slice(0, 10).map((emp, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={emp.daysOnBench}
                        color={emp.daysOnBench > 30 ? 'error' : emp.daysOnBench > 7 ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{emp.topSkills?.join(', ') || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );

    const renderTrainingPreview = () => (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
              <Typography variant="h4" color="primary.main">{previewData.totalTrainings}</Typography>
              <Typography variant="body2" color="text.secondary">Total Trainings</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
              <Typography variant="h4" color="success.main">{previewData.completedAssignments}</Typography>
              <Typography variant="body2" color="text.secondary">Completed</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.lighter', borderRadius: 2 }}>
              <Typography variant="h4" color="warning.main">{previewData.totalAssignments - previewData.completedAssignments - previewData.overdueAssignments}</Typography>
              <Typography variant="body2" color="text.secondary">In Progress</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.lighter', borderRadius: 2 }}>
              <Typography variant="h4" color="error.main">{previewData.overdueAssignments}</Typography>
              <Typography variant="body2" color="text.secondary">Overdue</Typography>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>Overall Completion Rate</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={previewData.overallCompletionRate || 0}
              sx={{ flexGrow: 1, height: 12, borderRadius: 2 }}
            />
            <Typography variant="h6">{previewData.overallCompletionRate?.toFixed(1)}%</Typography>
          </Box>
        </Box>
      </Box>
    );

    const renderDailySummaryPreview = () => (
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Report Date: {previewData.reportDate}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>👥 Employees</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2">Total: {previewData.totalEmployees}</Typography>
              <Typography variant="body2">New Today: {previewData.newEmployeesToday}</Typography>
              <Typography variant="body2">On Leave: {previewData.employeesOnLeave}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>📁 Projects</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2">Active: {previewData.activeProjects}</Typography>
              <Typography variant="body2">Starting Today: {previewData.projectsStartingToday}</Typography>
              <Typography variant="body2">Ending Today: {previewData.projectsEndingToday}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>📊 Utilization</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 2 }}>
              <LinearProgress
                variant="determinate"
                value={previewData.overallUtilization || 0}
                sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
              />
              <Typography variant="body2">{previewData.overallUtilization?.toFixed(1)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>📚 Training</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2">Completed Today: {previewData.trainingsCompleted}</Typography>
              <Typography variant="body2" color="error.main">Overdue: {previewData.overdueTrainings}</Typography>
            </Box>
          </Grid>
        </Grid>
        {previewData.criticalAlerts?.length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Critical Alerts:</Typography>
            {previewData.criticalAlerts.map((alert, idx) => (
              <Typography key={idx} variant="body2">• {alert}</Typography>
            ))}
          </Alert>
        )}
        {previewData.warningAlerts?.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Warnings:</Typography>
            {previewData.warningAlerts.map((alert, idx) => (
              <Typography key={idx} variant="body2">• {alert}</Typography>
            ))}
          </Alert>
        )}
      </Box>
    );

    switch (selectedReport?.id) {
      case 'utilization':
        return renderUtilizationPreview();
      case 'bench':
        return renderBenchPreview();
      case 'training-progress':
        return renderTrainingPreview();
      case 'daily-summary':
        return renderDailySummaryPreview();
      default:
        return (
          <Alert severity="info">
            Preview loaded. Click Download to get the full report.
          </Alert>
        );
    }
  };

  return (
    <Box>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate, download, and schedule automated reports"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Reports' },
        ]}
        primaryAction={false}
      />

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Generate Reports" />
        <Tab label="Scheduled Reports" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Report Types */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Select Report Type
                </Typography>
                <Grid container spacing={2}>
                  {reportTypes.map((report) => (
                    <Grid item xs={12} sm={6} md={4} key={report.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: selectedReport?.id === report.id ? `2px solid ${report.color}` : '1px solid',
                          borderColor: selectedReport?.id === report.id ? report.color : 'divider',
                          bgcolor: selectedReport?.id === report.id ? `${report.color}08` : 'transparent',
                          '&:hover': {
                            borderColor: report.color,
                            bgcolor: `${report.color}08`,
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => handleSelectReport(report)}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              bgcolor: `${report.color}20`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 1.5,
                            }}
                          >
                            <report.icon sx={{ color: report.color }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {report.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {report.description}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            {report.formats.map((f) => (
                              <Chip
                                key={f}
                                label={f.toUpperCase()}
                                size="small"
                                icon={f === 'pdf' ? <PdfIcon /> : <ExcelIcon />}
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  bgcolor: f === 'pdf' ? 'error.lighter' : 'success.lighter',
                                  color: f === 'pdf' ? 'error.main' : 'success.main',
                                  '& .MuiChip-icon': { fontSize: 12 },
                                }}
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Report Options & Preview */}
            {selectedReport && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    {selectedReport.name} - Options
                  </Typography>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Format</InputLabel>
                        <Select
                          value={format}
                          label="Format"
                          onChange={(e) => setFormat(e.target.value)}
                        >
                          {selectedReport.formats.map((f) => (
                            <MenuItem key={f} value={f}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {f === 'pdf' ? (
                                  <PdfIcon fontSize="small" sx={{ color: 'error.main' }} />
                                ) : (
                                  <ExcelIcon fontSize="small" sx={{ color: 'success.main' }} />
                                )}
                                {f.toUpperCase()}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {selectedReport.needsDates && (
                      <>
                        <Grid item xs={12} sm={3}>
                          <FormField
                            name="startDate"
                            label="Start Date"
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormField
                            name="endDate"
                            label="End Date"
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            size="small"
                          />
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12} sm={selectedReport.needsDates ? 3 : 9}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          onClick={handlePreviewReport}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                        >
                          {loading ? 'Loading...' : 'Preview'}
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleDownloadReport}
                          disabled={generating}
                          startIcon={generating ? <CircularProgress size={16} /> : <DownloadIcon />}
                          sx={{
                            background: `linear-gradient(135deg, ${selectedReport.color} 0%, ${selectedReport.color}dd 100%)`,
                          }}
                        >
                          {generating ? 'Generating...' : 'Download'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Preview Section */}
                  {previewData && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Preview
                      </Typography>
                      {renderPreviewData()}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Quick Info Sidebar */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <InfoIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Report Guide
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="primary.main">Employee Utilization</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Shows FTE allocation across employees and departments
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="error.main">Bench Report</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lists employees without current project allocation
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="success.main">Training Progress</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Training completion rates and overdue assignments
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="warning.main">Project Needs</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming resource requirements and skill gaps
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  📅 Automated Reports
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Reports are automatically generated and sent to admin emails
                </Alert>
                {scheduledReports.map((report, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {report.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {report.schedule}
                      </Typography>
                    </Box>
                    <Chip
                      label={report.enabled ? 'Active' : 'Disabled'}
                      size="small"
                      color={report.enabled ? 'success' : 'default'}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Scheduled Report Configuration
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Scheduled reports are configured via backend environment variables. Contact your administrator to modify schedules.
            </Alert>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report Name</TableCell>
                    <TableCell>Schedule</TableCell>
                    <TableCell>Recipients</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DailyIcon color="primary" />
                        Daily Summary Report
                      </Box>
                    </TableCell>
                    <TableCell>Every day at 8:00 AM</TableCell>
                    <TableCell>Admin emails</TableCell>
                    <TableCell>
                      <Chip label="Active" size="small" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WeeklyIcon color="secondary" />
                        Weekly Summary Report
                      </Box>
                    </TableCell>
                    <TableCell>Every Monday at 9:00 AM</TableCell>
                    <TableCell>Admin emails</TableCell>
                    <TableCell>
                      <Chip label="Active" size="small" color="success" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Configuration Variables:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                ADMIN_EMAILS=admin@rmp.com<br />
                DAILY_REPORT_ENABLED=true<br />
                WEEKLY_REPORT_ENABLED=true
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default ReportsPage;
