import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, useTheme, CircularProgress, Alert, Avatar, LinearProgress, Chip } from '@mui/material';
import {
  People as PeopleIcon,
  FolderOpen as ProjectsIcon,
  Assignment as AllocationsIcon,
  Psychology as SkillsIcon,
  EventBusy as BenchIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { PageHeader } from '@components/common';
import { dashboardApi } from '@api/dashboardApi';

// Color palette for charts
const CHART_COLORS = {
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#10b981',
  ON_HOLD: '#f59e0b',
  NOT_STARTED: '#94a3b8',
  CANCELLED: '#ef4444',
};

const STAT_CONFIGS = [
  { key: 'totalEmployees', title: 'Total Employees', icon: PeopleIcon, color: '#06b6d4', bgColor: '#ecfeff' },
  { key: 'activeProjects', title: 'Active Projects', icon: ProjectsIcon, color: '#3b82f6', bgColor: '#eff6ff' },
  { key: 'allocatedResources', title: 'Allocated', icon: AllocationsIcon, color: '#10b981', bgColor: '#ecfdf5' },
  { key: 'benchStrength', title: 'On Bench', icon: BenchIcon, color: '#f59e0b', bgColor: '#fffbeb' },
  { key: 'totalSkills', title: 'Total Skills', icon: SkillsIcon, color: '#8b5cf6', bgColor: '#f5f3ff' },
  { key: 'overallocated', title: 'Over-allocated', icon: WarningIcon, color: '#ef4444', bgColor: '#fef2f2' },
];

function DashboardPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getSummary();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Transform project status data for pie chart
  const getProjectStatusChartData = () => {
    if (!dashboardData?.projectStatusDistribution) return [];
    return Object.entries(dashboardData.projectStatusDistribution)
      .filter(([_, value]) => value > 0)
      .map(([status, value]) => ({
        name: status.replace('_', ' '),
        value,
        color: CHART_COLORS[status] || '#64748b',
      }));
  };

  // Transform skills data for bar chart
  const getSkillsChartData = () => {
    if (!dashboardData?.topSkills) return [];
    return dashboardData.topSkills.slice(0, 8).map(skill => ({
      skill: skill.name,
      count: skill.employeeCount || 0,
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  const stats = {
    totalEmployees: dashboardData?.totalEmployees || 0,
    activeProjects: dashboardData?.activeProjects || 0,
    allocatedResources: dashboardData?.allocatedResources || 0,
    benchStrength: dashboardData?.benchStrength || 0,
    totalSkills: dashboardData?.totalSkills || 0,
    overallocated: dashboardData?.overallocatedCount || 0,
    utilization: dashboardData?.averageUtilization || 0,
  };

  const projectStatusData = getProjectStatusChartData();
  const skillDistributionData = getSkillsChartData();
  const recentActivities = dashboardData?.recentActivities || [];

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your resource overview"
        primaryAction={false}
      />

      {/* Stats Cards - Better Grid Layout */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {STAT_CONFIGS.map((config) => {
          const Icon = config.icon;
          const value = stats[config.key];
          return (
            <Grid item xs={6} sm={4} md={2} key={config.key}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: config.color,
                    boxShadow: `0 4px 20px ${config.color}20`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontSize: '0.7rem',
                      }}
                    >
                      {config.title}
                    </Typography>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: config.bgColor,
                        color: config.color,
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </Avatar>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </Typography>
                  {config.key === 'allocatedResources' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                        {stats.utilization}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        utilization
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={3}>
        {/* Left Column - Utilization & Skills */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {/* Utilization Card */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                    Resource Utilization Overview
                  </Typography>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={stats.utilization}
                            size={140}
                            thickness={6}
                            sx={{
                              color: stats.utilization >= 80 ? 'success.main' :
                                     stats.utilization >= 60 ? 'warning.main' : 'error.main',
                              '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                              },
                            }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                            }}
                          >
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                              {stats.utilization}%
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Overall Utilization
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2}>
                        {[
                          { label: 'Allocated Resources', value: stats.allocatedResources, color: '#10b981', max: stats.totalEmployees },
                          { label: 'On Bench', value: stats.benchStrength, color: '#f59e0b', max: stats.totalEmployees },
                          { label: 'Over-allocated', value: stats.overallocated, color: '#ef4444', max: stats.totalEmployees },
                        ].map((item) => (
                          <Grid item xs={12} key={item.label}>
                            <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                {item.label}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.value}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(item.value / Math.max(item.max, 1)) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: '#e2e8f0',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  bgcolor: item.color,
                                },
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Skills Distribution */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Top Skills in Organization
                  </Typography>
                  <Box sx={{ height: 280 }}>
                    {skillDistributionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={skillDistributionData} layout="vertical" margin={{ left: 10, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis
                            dataKey="skill"
                            type="category"
                            tick={{ fill: '#374151', fontSize: 12 }}
                            width={90}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                            formatter={(value) => [`${value} employees`, 'Count']}
                          />
                          <Bar
                            dataKey="count"
                            fill="#8b5cf6"
                            radius={[0, 6, 6, 0]}
                            barSize={20}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography color="text.secondary">No skills data available</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column - Project Status & Activities */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Project Status */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Project Status
                  </Typography>
                  <Box sx={{ height: 240 }}>
                    {projectStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={projectStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {projectStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                          />
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography color="text.secondary">No project data</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activities */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Activities
                    </Typography>
                    <Chip label="Live" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {recentActivities.length > 0 ? (
                      recentActivities.slice(0, 5).map((activity, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            p: 1.5,
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'grey.100',
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: activity.entity === 'project' ? '#3b82f6' : '#10b981',
                              fontSize: '0.75rem',
                            }}
                          >
                            {activity.entity === 'project' ? <ProjectsIcon sx={{ fontSize: 16 }} /> : <PeopleIcon sx={{ fontSize: 16 }} />}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                              {activity.action}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {activity.entityName}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            <Typography variant="caption" sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}>
                              {activity.timestamp}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary" variant="body2">
                          No recent activities
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
