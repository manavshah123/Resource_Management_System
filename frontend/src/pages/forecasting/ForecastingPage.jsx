import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  Psychology as SkillIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ChartIcon,
  Assessment as AssessmentIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { PageHeader } from '@components/common';
import { forecastingApi } from '@api/forecastingApi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: '24px' }}>
      {value === index && children}
    </div>
  );
}

function ForecastingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [forecastData, setForecastData] = useState(null);
  const [fteMatrix, setFteMatrix] = useState(null);
  const [revenueForecast, setRevenueForecast] = useState(null);
  const [utilization, setUtilization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastMonths, setForecastMonths] = useState(12);

  useEffect(() => {
    fetchAllData();
  }, [forecastMonths]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, fteRes, revenueRes] = await Promise.all([
        forecastingApi.getDashboard(forecastMonths),
        forecastingApi.getFTEMatrix(forecastMonths),
        forecastingApi.getRevenueForecast(forecastMonths),
      ]);
      
      setForecastData(dashboardRes.data);
      setFteMatrix(fteRes.data);
      setRevenueForecast(revenueRes.data);
      setUtilization(dashboardRes.data?.utilization);
    } catch (err) {
      console.error('Failed to fetch forecast data:', err);
      setError('Failed to load forecasting data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Capacity Planning & Forecasting" subtitle="FTE Matrix and Revenue Analysis" />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Capacity Planning & Forecasting" />
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Capacity Planning & Forecasting"
        subtitle="FTE Matrix, Revenue Analysis, and Resource Utilization"
      />

      {/* Key Metrics Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {fteMatrix?.currentTotalCapacityFTE || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Total FTE Capacity</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {fteMatrix?.currentAllocatedFTE || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Allocated FTE</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {fteMatrix?.currentAvailableFTE || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Available FTE</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {utilization?.utilizationPercent || 0}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Utilization</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {formatCurrency(revenueForecast?.totalBudget)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Total Revenue</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {formatCurrency(revenueForecast?.activeRevenue)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Active Revenue</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab icon={<ChartIcon />} iconPosition="start" label="FTE Forecast" />
          <Tab icon={<MoneyIcon />} iconPosition="start" label="Revenue Forecast" />
          <Tab icon={<GroupsIcon />} iconPosition="start" label="Resource Analysis" />
        </Tabs>
      </Box>

      {/* Tab 1: FTE Forecast */}
      <TabPanel value={activeTab} index={0}>
        {/* Forecast Period Selector */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <ToggleButtonGroup
            value={forecastMonths}
            exclusive
            onChange={(e, val) => val && setForecastMonths(val)}
            size="small"
          >
            <ToggleButton value={6}>6 Months</ToggleButton>
            <ToggleButton value={12}>12 Months</ToggleButton>
            <ToggleButton value={18}>18 Months</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={3}>
          {/* FTE Forecast Chart */}
          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  <ChartIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
                  FTE Allocation Forecast
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={fteMatrix?.monthlyForecast || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="monthName" 
                        tick={{ fontSize: 10 }} 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                      />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                        formatter={(value, name) => {
                          if (name === 'utilizationPercent') return [`${value}%`, 'Utilization'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="allocatedFTE" name="Allocated FTE" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="left" dataKey="availableFTE" name="Available FTE" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="utilizationPercent" name="Utilization %" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* FTE Summary Stats */}
          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  FTE Release Schedule
                </Typography>
                {fteMatrix?.monthlyForecast?.filter(m => m.fteReleased > 0).length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Month</TableCell>
                          <TableCell align="right">FTE Released</TableCell>
                          <TableCell align="right">Projects Ending</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fteMatrix?.monthlyForecast
                          ?.filter(m => m.fteReleased > 0)
                          ?.map((month, index) => (
                          <TableRow key={index}>
                            <TableCell>{month.monthName}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={`+${month.fteReleased} FTE`} 
                                size="small" 
                                color="success"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">{month.projectsEnding}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No FTE releases scheduled</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Project End Dates with FTE */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  <CalendarIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'info.main' }} />
                  Project Timeline & FTE Impact
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell>Project</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell align="center">Team Size</TableCell>
                        <TableCell align="center">Allocated FTE</TableCell>
                        <TableCell align="center">Start Date</TableCell>
                        <TableCell align="center">End Date</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Budget</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fteMatrix?.projectEndDates?.map((project, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{project.projectName}</Typography>
                          </TableCell>
                          <TableCell>{project.clientName || '-'}</TableCell>
                          <TableCell align="center">
                            <Chip label={project.teamSize} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              {project.allocatedFTE} FTE
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{project.startDate || '-'}</TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="body2" 
                              color={project.endDate && new Date(project.endDate) < new Date(Date.now() + 30*24*60*60*1000) ? 'error.main' : 'text.primary'}
                              fontWeight={project.endDate && new Date(project.endDate) < new Date(Date.now() + 30*24*60*60*1000) ? 600 : 400}
                            >
                              {project.endDate || 'Ongoing'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={project.status}
                              size="small"
                              color={project.status === 'IN_PROGRESS' ? 'success' : project.status === 'ON_HOLD' ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={500}>
                              {project.budget ? formatCurrency(project.budget) : '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Revenue Forecast */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {/* Revenue by Status Pie Chart */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Revenue by Project Status
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(revenueForecast?.revenueByStatus || {})
                          .filter(([_, value]) => value > 0)
                          .map(([status, value]) => ({
                            name: status.replace('_', ' '),
                            value: parseFloat(value),
                          }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {Object.entries(revenueForecast?.revenueByStatus || {})
                          .filter(([_, value]) => value > 0)
                          .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Revenue Forecast */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  <MoneyIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'success.main' }} />
                  Monthly Revenue Forecast
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueForecast?.monthlyForecast || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="monthName" 
                        tick={{ fontSize: 10 }} 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="activeRevenue"
                        name="Active Revenue"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="newRevenue"
                        name="New Revenue"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.4}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Project Revenue Table */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  <AssessmentIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
                  Project Revenue Details
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell>Project</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Total Budget</TableCell>
                        <TableCell align="right">Monthly Rate</TableCell>
                        <TableCell align="center">Start Date</TableCell>
                        <TableCell align="center">End Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {revenueForecast?.projectRevenue?.map((project, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{project.projectName}</Typography>
                          </TableCell>
                          <TableCell>{project.clientName || '-'}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={project.status?.replace('_', ' ')}
                              size="small"
                              color={project.status === 'IN_PROGRESS' ? 'success' : project.status === 'COMPLETED' ? 'info' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              {formatCurrency(project.budget)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {project.monthlyRate ? formatCurrency(project.monthlyRate) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{project.startDate || '-'}</TableCell>
                          <TableCell align="center">{project.endDate || 'Ongoing'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 3: Resource Analysis */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {/* Department Utilization */}
          <Grid item xs={12} lg={6}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Department Utilization
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecastData?.departmentUtilization || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis dataKey="department" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="utilizationPercent" name="Utilization" radius={[0, 4, 4, 0]}>
                        {(forecastData?.departmentUtilization || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.utilizationPercent > 80 ? '#10b981' : entry.utilizationPercent > 50 ? '#3b82f6' : '#f59e0b'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Skill Distribution */}
          <Grid item xs={12} lg={6}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Top Skills Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecastData?.skillDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="skillName" tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} height={70} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="employeeCount" name="Employees" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Resource Gaps */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  <WarningIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'warning.main' }} />
                  Resource Gaps & Risks
                </Typography>
                {forecastData?.resourceGaps?.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell>Skill</TableCell>
                          <TableCell>Project</TableCell>
                          <TableCell align="center">Available Resources</TableCell>
                          <TableCell>Severity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {forecastData.resourceGaps.map((gap, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SkillIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                {gap.skillName}
                              </Box>
                            </TableCell>
                            <TableCell>{gap.projectName}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={gap.availableResources} 
                                size="small" 
                                color={gap.availableResources === 0 ? 'error' : 'warning'} 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={gap.severity}
                                size="small"
                                color={gap.severity === 'CRITICAL' ? 'error' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No resource gaps identified</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
}

export default ForecastingPage;
