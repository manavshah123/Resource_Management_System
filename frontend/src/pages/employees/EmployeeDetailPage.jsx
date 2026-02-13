import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Button,
  Tabs,
  Tab,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { PageHeader, StatusChip } from '@components/common';
import { employeeApi } from '@api/employeeApi';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const skillLevelColors = {
  BEGINNER: '#64748b',
  INTERMEDIATE: '#3b82f6',
  ADVANCED: '#8b5cf6',
  EXPERT: '#10b981',
};

function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployeeProfile();
  }, [id]);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeApi.getProfile(id);
      setEmployee(response.data);
    } catch (err) {
      console.error('Failed to fetch employee profile:', err);
      setError('Failed to load employee profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader
          title="Employee Details"
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Employees', path: '/employees' },
            { label: 'Loading...' },
          ]}
        />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
                <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width="40%" sx={{ mx: 'auto' }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={300} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => navigate('/employees')}>
          {error}
        </Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/employees')}>
          Back to Employees
        </Button>
      </Box>
    );
  }

  if (!employee) return null;

  // FTE values
  const currentFTE = employee.currentFTE || (employee.currentAllocation ? employee.currentAllocation / 100 : 0);
  const maxFTE = employee.maxFTE || 1.0;
  const availableFTE = employee.availableFTE || Math.max(0, maxFTE - currentFTE);

  return (
    <Box>
      <PageHeader
        title="Employee Profile"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Employees', path: '/employees' },
          { label: employee.name },
        ]}
        primaryAction={false}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/employees')}
          >
            Back to List
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* Left Column - Profile Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                src={employee.avatar}
                alt={employee.name}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  border: '4px solid',
                  borderColor: 'primary.light',
                }}
              >
                {employee.name?.charAt(0)}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {employee.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                {employee.designation}
              </Typography>
              <Chip 
                label={employee.employeeId} 
                size="small" 
                sx={{ mb: 2, bgcolor: 'grey.100' }} 
              />
              <Box sx={{ mb: 2 }}>
                <StatusChip status={employee.status} />
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ textAlign: 'left' }}>
                <InfoItem icon={EmailIcon} label="Email" value={employee.email} />
                <InfoItem icon={PhoneIcon} label="Phone" value={employee.phone || 'Not provided'} />
                <InfoItem icon={BusinessIcon} label="Department" value={employee.department} />
                <InfoItem icon={LocationIcon} label="Location" value={employee.location || 'Not provided'} />
                <InfoItem icon={CalendarIcon} label="Join Date" value={employee.joinDate || 'Not provided'} />
                <InfoItem icon={PersonIcon} label="Reports To" value={employee.managerName || 'None'} />
              </Box>
              
              <Button
                fullWidth
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ mt: 3 }}
                onClick={() => navigate(`/employees/${id}/edit`)}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* FTE Allocation Card */}
          <Card elevation={0} sx={{ mt: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                FTE Allocation
              </Typography>
              
              {/* Circular Progress for Current Allocation */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={Math.min((currentFTE / maxFTE) * 100, 100)}
                    size={100}
                    thickness={6}
                    sx={{
                      color: currentFTE > maxFTE ? 'error.main' : 
                             currentFTE >= maxFTE * 0.8 ? 'warning.main' : 'success.main',
                      '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                    }}
                  />
                  <Box
                    sx={{
                      top: 0, left: 0, bottom: 0, right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {currentFTE.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      of {maxFTE.toFixed(2)} FTE
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {maxFTE.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Max FTE</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {currentFTE.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Allocated</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {availableFTE.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Available</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                Current Projects
              </Typography>
              
              {employee.currentProjects && employee.currentProjects.length > 0 ? (
                employee.currentProjects.map((project) => {
                  const projectFTE = project.fte || (project.allocationPercentage ? project.allocationPercentage / 100 : 0);
                  return (
                    <Box
                      key={project.projectId}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1.5,
                        px: 1,
                        mb: 1,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                      onClick={() => navigate(`/projects/${project.projectId}`)}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {project.projectName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {project.role}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${projectFTE.toFixed(2)} FTE`}
                        size="small"
                        color={projectFTE >= 0.5 ? 'primary' : 'default'}
                      />
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No current projects
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          {employee.stats && (
            <Card elevation={0} sx={{ mt: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'primary.50', borderRadius: 2 }}>
                      <WorkIcon sx={{ color: 'primary.main', mb: 0.5 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {employee.stats.totalProjectsWorked}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Projects Worked
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'success.50', borderRadius: 2 }}>
                      <TrendingUpIcon sx={{ color: 'success.main', mb: 0.5 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {employee.stats.skillsCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Skills
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - Tabs */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Overview" />
              <Tab label={`Skills (${employee.skills?.length || 0})`} />
              <Tab label="Assignment History" />
            </Tabs>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  About
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  {employee.bio || 'No bio provided.'}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={6} md={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Employee ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {employee.employeeId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Department
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {employee.department}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Availability
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      <Chip 
                        label={employee.availabilityStatus?.replace('_', ' ') || 'Available'} 
                        size="small" 
                        color={
                          employee.availabilityStatus === 'AVAILABLE' ? 'success' :
                          employee.availabilityStatus === 'FULLY_ALLOCATED' ? 'warning' : 'default'
                        }
                      />
                    </Typography>
                  </Grid>
                </Grid>

                {/* Current Projects Summary */}
                {employee.currentProjects && employee.currentProjects.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
                      Current Projects
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Project</TableCell>
                            <TableCell>Client</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="center">FTE</TableCell>
                            <TableCell>Duration</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {employee.currentProjects.map((project) => {
                            const projectFTE = project.fte || (project.allocationPercentage ? project.allocationPercentage / 100 : 0);
                            return (
                              <TableRow 
                                key={project.projectId} 
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/projects/${project.projectId}`)}
                              >
                                <TableCell sx={{ fontWeight: 500 }}>{project.projectName}</TableCell>
                                <TableCell>{project.client}</TableCell>
                                <TableCell>{project.role}</TableCell>
                                <TableCell align="center">
                                  <Chip label={`${projectFTE.toFixed(2)} FTE`} size="small" />
                                </TableCell>
                                <TableCell>
                                  {project.startDate} - {project.endDate || 'Ongoing'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </CardContent>
            </TabPanel>

            {/* Skills Tab */}
            <TabPanel value={tabValue} index={1}>
              <CardContent>
                {employee.skills && employee.skills.length > 0 ? (
                  <Grid container spacing={2}>
                    {employee.skills.map((skill) => (
                      <Grid item xs={12} sm={6} md={4} key={skill.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': { boxShadow: 2, borderColor: 'primary.main' },
                          }}
                        >
                          <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {skill.name}
                              </Typography>
                              {skill.isPrimary && (
                                <Chip label="Primary" size="small" color="primary" sx={{ fontSize: '0.65rem', height: 20 }} />
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                              {skill.category}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip
                                label={skill.level}
                                size="small"
                                sx={{
                                  bgcolor: `${skillLevelColors[skill.level]}15`,
                                  color: skillLevelColors[skill.level],
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                }}
                              />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {skill.yearsOfExperience} years
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No skills added yet</Typography>
                    <Button variant="outlined" sx={{ mt: 2 }}>
                      Add Skills
                    </Button>
                  </Box>
                )}
              </CardContent>
            </TabPanel>

            {/* Assignment History Tab */}
            <TabPanel value={tabValue} index={2}>
              <CardContent>
                {employee.assignmentHistory && employee.assignmentHistory.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Project</TableCell>
                          <TableCell>Client</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell align="center">FTE</TableCell>
                          <TableCell>Period</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {employee.assignmentHistory.map((assignment, index) => {
                          const assignmentFTE = assignment.fte || (assignment.allocationPercentage ? assignment.allocationPercentage / 100 : 0);
                          return (
                            <TableRow key={index} hover>
                              <TableCell sx={{ fontWeight: 500 }}>{assignment.projectName}</TableCell>
                              <TableCell>{assignment.client}</TableCell>
                              <TableCell>{assignment.role}</TableCell>
                              <TableCell align="center">{assignmentFTE.toFixed(2)} FTE</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    {assignment.startDate} - {assignment.endDate || 'Present'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{assignment.durationDays} days</TableCell>
                              <TableCell>
                                <Chip 
                                  label={assignment.status} 
                                  size="small"
                                  color={assignment.status === 'ACTIVE' ? 'success' : 'default'}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No assignment history</Typography>
                  </Box>
                )}
              </CardContent>
            </TabPanel>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.100' }}>
        <Icon sx={{ color: 'text.secondary', fontSize: 16 }} />
      </Avatar>
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

export default EmployeeDetailPage;
