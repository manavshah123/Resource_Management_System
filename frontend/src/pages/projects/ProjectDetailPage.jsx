import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  AvatarGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  IconButton,
  Snackbar,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Group as TeamIcon,
  Flag as FlagIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckBoxOutlineBlank,
  CheckBox as CheckBoxIcon,
} from '@mui/icons-material';
import { PageHeader, StatusChip, EmployeeSelector } from '@components/common';
import { projectApi } from '@api/projectApi';
import { allocationApi } from '@api/allocationApi';
import { employeeApi } from '@api/employeeApi';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add Team Member Dialog
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectRes, allocationsRes] = await Promise.all([
        projectApi.getById(id),
        allocationApi.getByProject(id),
      ]);
      
      setProject(projectRes.data);
      setTeamMembers(allocationsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch project data:', err);
      setError('Failed to load project details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddMember = async () => {
    setAddMemberOpen(true);
    setLoadingEmployees(true);
    try {
      // Get all employees with availability info from database
      const response = await employeeApi.getAllWithAvailability();
      // Filter out employees already on the team
      const existingIds = teamMembers.map(m => m.employeeId);
      const available = (response.data || []).filter(emp => !existingIds.includes(emp.id));
      setAvailableEmployees(available);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      // Fallback: get all employees
      try {
        const response = await employeeApi.getAll({ size: 100 });
        const existingIds = teamMembers.map(m => m.employeeId);
        const available = (response.data?.content || []).filter(emp => !existingIds.includes(emp.id));
        setAvailableEmployees(available);
      } catch (e) {
        setSnackbar({ open: true, message: 'Failed to load employees', severity: 'error' });
      }
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleAddTeamMember = async (allocationData) => {
    try {
      await allocationApi.create({
        ...allocationData,
        projectId: parseInt(id),
      });
      setSnackbar({ open: true, message: 'Team member added successfully!', severity: 'success' });
      setAddMemberOpen(false);
      fetchProjectData(); // Refresh data
    } catch (err) {
      console.error('Failed to add team member:', err);
      const message = err.response?.data?.message || 'Failed to add team member';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleRemoveTeamMember = async (allocationId) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await allocationApi.delete(allocationId);
      setSnackbar({ open: true, message: 'Team member removed', severity: 'success' });
      fetchProjectData();
    } catch (err) {
      console.error('Failed to remove team member:', err);
      setSnackbar({ open: true, message: 'Failed to remove team member', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader
          title="Loading..."
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Projects', path: '/projects' },
            { label: 'Loading...' },
          ]}
        />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => navigate('/projects')}>
          {error}
        </Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  if (!project) return null;

  const budgetProgress = project.budget > 0 
    ? ((project.spentBudget || 0) / project.budget) * 100 
    : 0;

  // Prepare FTE distribution data for chart
  const fteDistributionData = teamMembers.map((member, index) => ({
    name: member.employeeName,
    fte: member.fte || (member.allocationPercentage ? member.allocationPercentage / 100 : 0),
    fill: COLORS[index % COLORS.length],
  }));

  const totalFte = teamMembers.reduce((sum, m) => sum + (m.fte || (m.allocationPercentage ? m.allocationPercentage / 100 : 0)), 0);

  return (
    <Box>
      <PageHeader
        title={project.name}
        subtitle={`Client: ${project.client || project.clientName}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Projects', path: '/projects' },
          { label: project.name },
        ]}
        primaryAction={false}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/projects')}
            >
              Back to List
            </Button>
            <Button variant="contained" startIcon={<EditIcon />}>
              Edit Project
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                <StatusChip status={project.status} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Status
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                {project.progress || 0}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={project.progress || 0}
                sx={{ mt: 1.5, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
                ${project.budget ? (project.budget / 1000).toFixed(0) : 0}K
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Budget
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 0.5 }}>
                {teamMembers.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Team Members
              </Typography>
              <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                  {teamMembers.map((member, i) => (
                    <Avatar key={i} sx={{ bgcolor: COLORS[i % COLORS.length] }}>
                      {member.employeeName?.charAt(0)}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Overview" />
              <Tab label={`Team (${teamMembers.length})`} />
              <Tab label="FTE Distribution" />
            </Tabs>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.8 }}>
                  {project.description || 'No description provided.'}
                </Typography>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                      <CalendarIcon sx={{ color: 'primary.main', mb: 1 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Start Date
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {project.startDate || 'Not set'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                      <ScheduleIcon sx={{ color: 'warning.main', mb: 1 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        End Date
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {project.endDate || 'Not set'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                      <FlagIcon sx={{ color: 'error.main', mb: 1 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Priority
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <StatusChip status={project.priority} />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                      <TrendingUpIcon sx={{ color: 'success.main', mb: 1 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Total FTE
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {totalFte.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </TabPanel>

            {/* Team Tab */}
            <TabPanel value={tabValue} index={1}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Team Members
                  </Typography>
                  <Button 
                    startIcon={<PersonAddIcon />} 
                    variant="contained"
                    onClick={handleOpenAddMember}
                  >
                    Add Team Member
                  </Button>
                </Box>
                
                {teamMembers.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell>Employee</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Tech Stack</TableCell>
                          <TableCell align="center">FTE</TableCell>
                          <TableCell>Period</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teamMembers.map((member, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: COLORS[index % COLORS.length] }}>
                                  {member.employeeName?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {member.employeeName}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{member.role || 'Not specified'}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {member.assignedSkills && member.assignedSkills.length > 0 ? (
                                  <>
                                    {member.assignedSkills.slice(0, 2).map((skill) => (
                                      <Chip
                                        key={skill.id}
                                        label={skill.name}
                                        size="small"
                                        sx={{
                                          fontSize: '0.7rem',
                                          height: 20,
                                          bgcolor: 'success.light',
                                          color: 'success.contrastText',
                                        }}
                                      />
                                    ))}
                                    {member.assignedSkills.length > 2 && (
                                      <Chip
                                        label={`+${member.assignedSkills.length - 2}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                      />
                                    )}
                                  </>
                                ) : (
                                  <Typography variant="caption" color="text.secondary">—</Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={`${(member.fte || (member.allocationPercentage ? member.allocationPercentage / 100 : 0)).toFixed(2)} FTE`} 
                                size="small"
                                color={(member.fte || 0) >= 0.8 ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {member.startDate} - {member.endDate || 'Ongoing'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <StatusChip status={member.status} />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleRemoveTeamMember(member.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <TeamIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      No team members assigned yet
                    </Typography>
                    <Button 
                      startIcon={<PersonAddIcon />} 
                      variant="contained" 
                      size="small"
                      onClick={handleOpenAddMember}
                    >
                      Add First Member
                    </Button>
                  </Box>
                )}
              </CardContent>
            </TabPanel>

            {/* FTE Distribution Tab */}
            <TabPanel value={tabValue} index={2}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  FTE Distribution Chart
                </Typography>
                
                {teamMembers.length > 0 ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={fteDistributionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={3}
                              dataKey="fte"
                            >
                              {fteDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value.toFixed(2)} FTE`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={fteDistributionData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${v} FTE`} />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value) => `${value.toFixed(2)} FTE`} />
                            <Bar dataKey="fte" name="FTE" radius={[0, 4, 4, 0]}>
                              {fteDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">
                      No allocation data available
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {totalFte.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total FTE Allocated
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {teamMembers.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Team Members
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                        {teamMembers.length > 0 ? (totalFte / teamMembers.length).toFixed(2) : '0.00'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Avg. FTE
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </TabPanel>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Project Details
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'grey.100' }}>
                  <BusinessIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Client
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {project.client || project.clientName}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'grey.100' }}>
                  <CalendarIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Timeline
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {project.startDate} - {project.endDate || 'Ongoing'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'grey.100' }}>
                  <TeamIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Project Manager
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {project.managerName || 'Not assigned'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'grey.100' }}>
                  <MoneyIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Budget
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ${project.budget ? project.budget.toLocaleString() : 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  startIcon={<PersonAddIcon />}
                  onClick={handleOpenAddMember}
                >
                  Add Team Member
                </Button>
                <Button fullWidth variant="outlined" startIcon={<EditIcon />}>
                  Update Progress
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Team Member Dialog */}
      <AddTeamMemberDialog
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onSubmit={handleAddTeamMember}
        employees={availableEmployees}
        loading={loadingEmployees}
        project={project}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Add Team Member Dialog Component
function AddTeamMemberDialog({ open, onClose, onSubmit, employees, loading, project }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fte, setFte] = useState(0.5);
  const [role, setRole] = useState('');
  const [startDate, setStartDate] = useState(project?.startDate || '');
  const [endDate, setEndDate] = useState(project?.endDate || '');
  const [submitting, setSubmitting] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Get tech stack from project
  const projectTechStack = project?.techStack || [];

  // FTE options
  const fteOptions = [
    { value: 0.25, label: '0.25 FTE (Quarter Time)' },
    { value: 0.50, label: '0.50 FTE (Half Time)' },
    { value: 0.75, label: '0.75 FTE (Three Quarter)' },
    { value: 1.00, label: '1.00 FTE (Full Time)' },
  ];

  const handleSubmit = async () => {
    if (!selectedEmployee) return;
    
    setSubmitting(true);
    try {
      await onSubmit({
        employeeId: selectedEmployee.id,
        fte: parseFloat(fte),
        allocationPercentage: Math.round(parseFloat(fte) * 100), // For backward compatibility
        role: role,
        startDate: startDate || project?.startDate,
        endDate: endDate || project?.endDate,
        billable: true,
        assignedSkillIds: selectedSkills.map(s => s.id),
      });
      // Reset form
      setSelectedEmployee(null);
      setFte(0.5);
      setRole('');
      setSelectedSkills([]);
    } catch (err) {
      // Error handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedEmployee(null);
    setFte(0.5);
    setRole('');
    setSelectedSkills([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" />
          Add Team Member
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Employee Selection - Using shared component */}
            <EmployeeSelector
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              employees={employees}
              label="Select Employee"
              placeholder="Search and select employee..."
              required
              showFTEWarning={true}
            />

            {/* Role */}
            <TextField
              fullWidth
              label="Role in Project"
              placeholder="e.g., Frontend Developer, Tech Lead, QA Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            {/* Assigned Tech Stack */}
            {projectTechStack.length > 0 ? (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Assigned Tech Stack
                </Typography>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={projectTechStack}
                  getOptionLabel={(option) => option.name || ''}
                  value={selectedSkills}
                  onChange={(e, newValue) => setSelectedSkills(newValue)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  groupBy={(option) => option.category || 'Other'}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.id}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlank fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select technologies this person will work on..."
                      variant="outlined"
                      size="small"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.name}
                        size="small"
                        sx={{
                          bgcolor: 'success.light',
                          color: 'success.contrastText',
                          '& .MuiChip-deleteIcon': {
                            color: 'success.contrastText',
                          },
                        }}
                      />
                    ))
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  ✓ {projectTechStack.length} skills available from project's tech stack
                </Typography>
              </Box>
            ) : (
              <Alert severity="info" sx={{ py: 0.5 }}>
                <Typography variant="body2">
                  This project has no tech stack defined. 
                  <br />
                  <Typography component="span" variant="caption" color="text.secondary">
                    Edit the project to add required skills first.
                  </Typography>
                </Typography>
              </Alert>
            )}

            {/* FTE Selection */}
            <FormControl fullWidth>
              <InputLabel>FTE (Full-Time Equivalent)</InputLabel>
              <Select
                value={fte}
                label="FTE (Full-Time Equivalent)"
                onChange={(e) => setFte(e.target.value)}
              >
                {fteOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedEmployee && fte > ((selectedEmployee.availableFTE || 0) / 100) && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                This will over-allocate the employee beyond their available capacity ({((selectedEmployee.availableFTE || 0) / 100).toFixed(2)} FTE available).
              </Alert>
            )}

            {/* Date Range */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!selectedEmployee || submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : <PersonAddIcon />}
        >
          {submitting ? 'Adding...' : 'Add to Team'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProjectDetailPage;
