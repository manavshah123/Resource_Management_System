import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  AlertTitle,
  Chip,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CloudSync as CloudSyncIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  OpenInNew as OpenInNewIcon,
  Folder as FolderIcon,
  People as PeopleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { PageHeader, StatCard } from '@components/common';
import { zohoApi } from '@api/zohoApi';
import { employeeApi } from '@api/employeeApi';
import { useUIStore } from '@store/uiStore';

function ZohoIntegrationPage() {
  const { showSnackbar } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [integration, setIntegration] = useState(null);
  const [config, setConfig] = useState({ enabled: false, configured: false });
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [importing, setImporting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [defaultManager, setDefaultManager] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [zohoUsers, setZohoUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [timesheets, setTimesheets] = useState([]);
  const [loadingTimesheets, setLoadingTimesheets] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [configRes, statusRes, employeesRes] = await Promise.all([
        zohoApi.getConfig(),
        zohoApi.getStatus(),
        employeeApi.getAll({ size: 100 }),
      ]);

      setConfig(configRes.data);
      setIntegration(statusRes.data);
      setEmployees(employeesRes.data?.content || employeesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch integration data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleOAuthCallback(code);
    }
  }, [fetchData]);

  const handleOAuthCallback = async (code) => {
    try {
      setConnecting(true);
      const response = await zohoApi.completeCallback(code);
      setIntegration(response.data);
      showSnackbar('Successfully connected to Zoho!', 'success');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('OAuth callback failed:', error);
      showSnackbar('Failed to connect to Zoho', 'error');
    } finally {
      setConnecting(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await zohoApi.getAuthUrl();
      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      showSnackbar('Failed to initiate Zoho connection', 'error');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Zoho integration?')) return;

    try {
      await zohoApi.disconnect();
      setIntegration(null);
      setProjects([]);
      showSnackbar('Zoho disconnected successfully', 'success');
      fetchData();
    } catch (error) {
      console.error('Failed to disconnect:', error);
      showSnackbar('Failed to disconnect Zoho', 'error');
    }
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await zohoApi.getProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      showSnackbar('Failed to fetch Zoho projects', 'error');
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await zohoApi.getUsers();
      setZohoUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showSnackbar('Failed to fetch Zoho users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTimesheets = async () => {
    try {
      setLoadingTimesheets(true);
      const response = await zohoApi.getTimesheets();
      setTimesheets(response.data || []);
    } catch (error) {
      console.error('Failed to fetch timesheets:', error);
      showSnackbar('Failed to fetch Zoho timesheets', 'error');
    } finally {
      setLoadingTimesheets(false);
    }
  };

  const handleImportProjects = async () => {
    if (selectedProjects.length === 0) {
      showSnackbar('Please select at least one project to import', 'warning');
      return;
    }

    try {
      setImporting(true);
      const response = await zohoApi.importProjects(
        selectedProjects,
        defaultManager || null,
        updateExisting
      );
      showSnackbar(`Successfully imported ${response.data.length} projects!`, 'success');
      setSelectedProjects([]);
      setImportDialogOpen(false);
      fetchProjects(); // Refresh to show imported status
    } catch (error) {
      console.error('Failed to import projects:', error);
      showSnackbar('Failed to import projects', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleToggleProject = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map((p) => p.id));
    }
  };

  const isConnected = integration?.status === 'CONNECTED';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Zoho Integration"
        subtitle="Connect your Zoho Projects account to sync projects"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Integrations' },
          { label: 'Zoho' },
        ]}
      />

      {/* Configuration Warning */}
      {!config.configured && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Zoho Integration Not Configured</AlertTitle>
          To enable Zoho integration, please configure the following environment variables:
          <Box component="ul" sx={{ mt: 1, mb: 0 }}>
            <li><code>ZOHO_ENABLED=true</code></li>
            <li><code>ZOHO_CLIENT_ID</code> - Your Zoho API Console Client ID</li>
            <li><code>ZOHO_CLIENT_SECRET</code> - Your Zoho API Console Client Secret</li>
            <li><code>ZOHO_REDIRECT_URI</code> - OAuth redirect URI (default: http://localhost:3000/integrations/zoho/callback)</li>
          </Box>
        </Alert>
      )}

      {/* Connection Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: isConnected ? 'success.light' : 'grey.200',
                }}
              >
                <CloudSyncIcon sx={{ fontSize: 40, color: isConnected ? 'success.main' : 'grey.500' }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Zoho Projects
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  icon={isConnected ? <CheckCircleIcon /> : <ErrorIcon />}
                  label={isConnected ? 'Connected' : 'Not Connected'}
                  color={isConnected ? 'success' : 'default'}
                  size="small"
                />
                {integration?.portalName && (
                  <Chip
                    icon={<FolderIcon />}
                    label={integration.portalName}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
              {isConnected && integration && (
                <Typography variant="body2" color="text.secondary">
                  Connected as <strong>{integration.zohoUserEmail || integration.zohoUserName}</strong>
                  {integration.lastSync && (
                    <> • Last synced: {new Date(integration.lastSync).toLocaleString()}</>
                  )}
                </Typography>
              )}
            </Grid>
            <Grid item>
              {isConnected ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchProjects}
                    disabled={loadingProjects}
                  >
                    Fetch Projects
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    onClick={fetchUsers}
                    disabled={loadingUsers}
                  >
                    Fetch Users
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    onClick={fetchTimesheets}
                    disabled={loadingTimesheets}
                  >
                    Fetch Timesheets
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LinkOffIcon />}
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={connecting ? <CircularProgress size={20} color="inherit" /> : <LinkIcon />}
                  onClick={handleConnect}
                  disabled={!config.configured || connecting}
                >
                  {connecting ? 'Connecting...' : 'Connect to Zoho'}
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for Projects, Users, and Timesheets */}
      {isConnected && (
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab icon={<FolderIcon />} label="Projects" iconPosition="start" />
            <Tab icon={<PeopleIcon />} label="People" iconPosition="start" />
            <Tab icon={<ScheduleIcon />} label="Timesheets" iconPosition="start" />
          </Tabs>
        </Card>
      )}

      {/* Stats Cards - Projects Tab */}
      {isConnected && activeTab === 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Total Zoho Projects"
              value={projects.length}
              icon={FolderIcon}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Imported Projects"
              value={projects.filter((p) => p.imported).length}
              icon={CheckCircleIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Pending Import"
              value={projects.filter((p) => !p.imported).length}
              icon={ScheduleIcon}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      {/* Stats Cards - Users Tab */}
      {isConnected && activeTab === 1 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Total Zoho Users"
              value={zohoUsers.length}
              icon={PeopleIcon}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Matched in RMP"
              value={zohoUsers.filter((u) => u.imported).length}
              icon={CheckCircleIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Not in RMP"
              value={zohoUsers.filter((u) => !u.imported).length}
              icon={PersonIcon}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      {/* Projects Table */}
      {isConnected && activeTab === 0 && projects.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Zoho Projects ({projects.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => setImportDialogOpen(true)}
                  disabled={selectedProjects.length === 0}
                >
                  Import Selected ({selectedProjects.length})
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedProjects.length > 0 && selectedProjects.length < projects.length}
                        checked={selectedProjects.length === projects.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Tasks</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Import Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow
                      key={project.id}
                      hover
                      selected={selectedProjects.includes(project.id)}
                      sx={{ opacity: project.imported ? 0.7 : 1 }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => handleToggleProject(project.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {project.name}
                          </Typography>
                          {project.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {project.description.substring(0, 100)}...
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status || 'Active'}
                          size="small"
                          color={
                            project.status?.toLowerCase().includes('active')
                              ? 'success'
                              : project.status?.toLowerCase().includes('complete')
                              ? 'info'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{project.ownerName || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        {project.taskCount ? (
                          <Box>
                            <Typography variant="body2">
                              {project.taskCount.closed || 0} / {(project.taskCount.open || 0) + (project.taskCount.closed || 0)}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={
                                project.taskCount.open + project.taskCount.closed > 0
                                  ? (project.taskCount.closed / (project.taskCount.open + project.taskCount.closed)) * 100
                                  : 0
                              }
                              sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                            />
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          {project.startDate || 'N/A'} - {project.endDate || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {project.imported ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Imported"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : (
                          <Chip label="Not Imported" size="small" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Empty State - Projects */}
      {isConnected && activeTab === 0 && projects.length === 0 && !loadingProjects && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <FolderIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No Projects Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click "Fetch Projects" to load projects from your Zoho account
            </Typography>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchProjects}>
              Fetch Projects
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading Projects */}
      {activeTab === 0 && loadingProjects && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Fetching projects from Zoho...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      {isConnected && activeTab === 1 && zohoUsers.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Zoho Team Members ({zohoUsers.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchUsers}
                disabled={loadingUsers}
              >
                Refresh
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>In RMP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {zohoUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: user.imported ? 'success.main' : 'primary.main' }}>
                            {user.name?.charAt(0) || '?'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.name || 'Unknown'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role || 'User'}
                          size="small"
                          color={user.role?.toLowerCase().includes('admin') ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.active ? 'Active' : 'Inactive'}
                          size="small"
                          color={user.active ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {user.imported ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Matched"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : (
                          <Chip label="Not Found" size="small" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Empty State - Users */}
      {isConnected && activeTab === 1 && zohoUsers.length === 0 && !loadingUsers && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <PeopleIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No Users Loaded
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click "Fetch Users" to load team members from your Zoho account
            </Typography>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUsers}>
              Fetch Users
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading Users */}
      {activeTab === 1 && loadingUsers && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Fetching users from Zoho...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Timesheets Tab Content */}
      {isConnected && activeTab === 2 && timesheets.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Zoho Timesheets ({timesheets.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchTimesheets}
                disabled={loadingTimesheets}
              >
                Refresh
              </Button>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Date</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timesheets.map((ts, index) => (
                    <TableRow key={ts.id || index} hover>
                      <TableCell>{ts.logDate || '-'}</TableCell>
                      <TableCell>{ts.projectName || '-'}</TableCell>
                      <TableCell>{ts.taskName || ts.task || '-'}</TableCell>
                      <TableCell>{ts.ownerName || '-'}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={ts.hoursDisplay || ts.hours || `${(ts.totalMinutes / 60).toFixed(1)}h`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ts.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ts.approvalStatus || ts.billStatus || 'Pending'}
                          size="small"
                          color={ts.approvalStatus === 'approved' ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Empty Timesheets State */}
      {isConnected && activeTab === 2 && timesheets.length === 0 && !loadingTimesheets && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ScheduleIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No Timesheets Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click "Fetch Timesheets" to load time logs from your Zoho projects
            </Typography>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchTimesheets}>
              Fetch Timesheets
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading Timesheets */}
      {activeTab === 2 && loadingTimesheets && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Fetching timesheets from Zoho...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Projects from Zoho</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 3 }}>
            You are about to import <strong>{selectedProjects.length}</strong> project(s) from Zoho to RMP.
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Default Project Manager</InputLabel>
            <Select
              value={defaultManager}
              onChange={(e) => setDefaultManager(e.target.value)}
              label="Default Project Manager"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {employees
                .filter((emp) => emp.role === 'PM' || emp.role === 'ADMIN')
                .map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.designation})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={updateExisting}
                onChange={(e) => setUpdateExisting(e.target.checked)}
              />
            }
            label="Update existing imported projects"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleImportProjects}
            disabled={importing}
            startIcon={importing ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {importing ? 'Importing...' : 'Import Projects'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ZohoIntegrationPage;

