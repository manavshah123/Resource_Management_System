import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Switch,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Check as CheckIcon,
  SupervisorAccount as RoleIcon,
} from '@mui/icons-material';
import { PageHeader } from '@components/common';
import { userApi } from '@api/userApi';
import { rolePermissionApi } from '@api/rolePermissionApi';
import { employeeApi } from '@api/employeeApi';

const ROLE_COLORS = {
  ADMIN: '#ef4444',
  PM: '#3b82f6',
  HR: '#10b981',
  EMPLOYEE: '#64748b',
};

const ROLE_ICONS = {
  ADMIN: <AdminIcon />,
  PM: <RoleIcon />,
  HR: <PersonIcon />,
  EMPLOYEE: <PersonIcon />,
};

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [search, setSearch] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Dialogs
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // Forms
  const [userForm, setUserForm] = useState({
    email: '',
    name: '',
    password: '',
    phone: '',
    roles: [],
    enabled: true,
    // Employee fields
    department: '',
    designation: '',
    location: '',
    joinDate: null,
    maxFT: 100,
    managerId: null,
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolePermsRes, permissionsRes, statsRes, employeesRes] = await Promise.all([
        userApi.getAllList(),
        rolePermissionApi.getAllRolePermissions(),
        rolePermissionApi.getPermissionsByModule(),
        userApi.getStats(),
        employeeApi.getAll({ size: 100 }),
      ]);
      setUsers(usersRes.data || []);
      
      // Process role permissions from new API format
      const rolePermsData = rolePermsRes.data || [];
      const rolesData = rolePermsData.map(rp => ({
        code: rp.role,
        name: rp.roleName,
        description: rp.roleDescription,
      }));
      const rolePermsMap = {};
      rolePermsData.forEach(rp => {
        rolePermsMap[rp.role] = rp.permissions?.map(p => p.code) || [];
      });
      
      setRoles(rolesData);
      setRolePermissions(rolePermsMap);
      
      // Process permissions by module
      const permsData = permissionsRes.data || [];
      const permsMap = {};
      permsData.forEach(module => {
        permsMap[module.module] = module.permissions || [];
      });
      setPermissions(permsMap);
      
      setStats(statsRes.data || { total: 0, active: 0, inactive: 0 });
      setEmployees(employeesRes.data?.content || employeesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // User CRUD
  const handleAddUser = () => {
    setSelectedUser(null);
    setUserForm({
      email: '',
      name: '',
      password: '',
      phone: '',
      roles: ['EMPLOYEE'],
      enabled: true,
      department: '',
      designation: '',
      location: '',
      joinDate: null,
      maxFT: 100,
      managerId: null,
    });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      email: user.email,
      name: user.name,
      password: '',
      phone: user.phone || '',
      roles: user.roles || [],
      enabled: user.enabled,
      department: user.department || '',
      designation: user.designation || '',
      location: user.location || '',
      joinDate: user.joinDate || null,
      maxFT: user.maxFT || 100,
      managerId: null,
    });
    setUserDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await userApi.delete(selectedUser.id);
      showSnackbar('User deleted successfully', 'success');
      fetchData();
      setDeleteDialogOpen(false);
    } catch (err) {
      showSnackbar('Failed to delete user', 'error');
    }
  };

  const handleSubmitUser = async () => {
    if (!userForm.email || !userForm.name || (!selectedUser && !userForm.password)) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }

    try {
      if (selectedUser) {
        await userApi.update(selectedUser.id, userForm);
        showSnackbar('User updated successfully', 'success');
      } else {
        await userApi.create(userForm);
        showSnackbar('User created successfully', 'success');
      }
      fetchData();
      setUserDialogOpen(false);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to save user', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await userApi.toggleStatus(user.id);
      showSnackbar(`User ${user.enabled ? 'disabled' : 'enabled'} successfully`, 'success');
      fetchData();
    } catch (err) {
      showSnackbar('Failed to toggle user status', 'error');
    }
  };

  // Role permissions
  const handleEditRolePermissions = (role) => {
    setSelectedRole(role);
    setRoleDialogOpen(true);
  };

  const handleSaveRolePermissions = async (roleCode, selectedPerms) => {
    try {
      await rolePermissionApi.updateRolePermissions(roleCode, selectedPerms);
      showSnackbar('Role permissions updated successfully', 'success');
      fetchData();
      setRoleDialogOpen(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update permissions';
      showSnackbar(errorMessage, 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Filter users
  const filteredUsers = users.filter((user) =>
    !search ||
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

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
        title="User Management"
        subtitle="Manage users, roles and permissions"
      />

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <PersonIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {stats.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">Total Users</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <UnlockIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats.active}
              </Typography>
              <Typography variant="caption" color="text.secondary">Active</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <LockIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {stats.inactive}
              </Typography>
              <Typography variant="caption" color="text.secondary">Inactive</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Users (${users.length})`} icon={<PersonIcon />} iconPosition="start" />
          <Tab label={`Roles & Permissions`} icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Users Tab */}
      {tabValue === 0 && (
        <>
          {/* Search and Actions */}
          <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddUser}>
                    Add User
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>User</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: user.roles?.includes('ADMIN') ? ROLE_COLORS.ADMIN : 'primary.main' }}>
                              {user.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {user.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                              {user.employeeCode && (
                                <Typography variant="caption" sx={{ display: 'block', color: 'primary.main' }}>
                                  {user.employeeCode}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.department || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.designation || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {user.roles?.map((role) => (
                              <Chip
                                key={role}
                                label={role}
                                size="small"
                                sx={{
                                  bgcolor: `${ROLE_COLORS[role]}15`,
                                  color: ROLE_COLORS[role],
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.enabled ? 'Active' : 'Inactive'}
                            size="small"
                            color={user.enabled ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditUser(user)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={user.enabled ? 'Disable' : 'Enable'}>
                              <IconButton size="small" onClick={() => handleToggleStatus(user)}>
                                {user.enabled ? <LockIcon fontSize="small" /> : <UnlockIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      {/* Roles & Permissions Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {roles.map((role) => (
            <Grid item xs={12} md={6} key={role.code}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  borderTop: `4px solid ${ROLE_COLORS[role.code] || '#64748b'}`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar sx={{ bgcolor: ROLE_COLORS[role.code], width: 40, height: 40 }}>
                          {ROLE_ICONS[role.code]}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {role.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {role.description}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditRolePermissions(role)}
                    >
                      Edit
                    </Button>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Permissions ({rolePermissions[role.code]?.length || 0})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {rolePermissions[role.code]?.slice(0, 8).map((perm) => (
                        <Chip
                          key={perm}
                          label={perm.replace('_', ' ')}
                          size="small"
                          sx={{ fontSize: '0.65rem' }}
                        />
                      ))}
                      {rolePermissions[role.code]?.length > 8 && (
                        <Chip
                          label={`+${rolePermissions[role.code].length - 8} more`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedUser ? 'Edit User' : 'Create New User'}
          <IconButton onClick={() => setUserDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
              Account Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={selectedUser ? 'New Password (leave blank to keep)' : 'Password'}
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  required={!selectedUser}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Roles</InputLabel>
                  <Select
                    multiple
                    value={userForm.roles}
                    label="Roles"
                    onChange={(e) => setUserForm({ ...userForm, roles: e.target.value })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            sx={{ bgcolor: `${ROLE_COLORS[role]}15`, color: ROLE_COLORS[role] }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.code} value={role.code}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: ROLE_COLORS[role.code] }} />
                          {role.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userForm.enabled}
                      onChange={(e) => setUserForm({ ...userForm, enabled: e.target.checked })}
                    />
                  }
                  label="Account Enabled"
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mt: 4, mb: 2, color: 'primary.main', fontWeight: 600 }}>
              Employee Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={userForm.department}
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={userForm.designation}
                  onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={userForm.location}
                  onChange={(e) => setUserForm({ ...userForm, location: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Join Date"
                  type="date"
                  value={userForm.joinDate || ''}
                  onChange={(e) => setUserForm({ ...userForm, joinDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max FT Allocation (%)"
                  type="number"
                  value={userForm.maxFT}
                  onChange={(e) => setUserForm({ ...userForm, maxFT: parseInt(e.target.value) || 100 })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={users.filter(u => u.employeeId && u.id !== selectedUser?.id)}
                  getOptionLabel={(option) => `${option.name} (${option.department || 'N/A'})`}
                  value={users.find(u => u.employeeId === userForm.managerId) || null}
                  onChange={(e, newValue) => setUserForm({ ...userForm, managerId: newValue?.employeeId || null })}
                  renderInput={(params) => (
                    <TextField {...params} label="Reporting Manager" />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitUser}
            disabled={!userForm.email || !userForm.name || (!selectedUser && !userForm.password)}
          >
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Permissions Dialog */}
      <RolePermissionsDialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        role={selectedRole}
        permissions={permissions}
        currentPermissions={selectedRole ? (rolePermissions[selectedRole.code] || []) : []}
        onSave={handleSaveRolePermissions}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>"{selectedUser?.name}"</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Role Permissions Dialog Component
function RolePermissionsDialog({ open, onClose, role, permissions, currentPermissions, onSave }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (open && currentPermissions) {
      setSelected([...currentPermissions]);
    }
  }, [open, currentPermissions]);

  const handleToggle = (code) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  const handleSelectAll = (module, perms) => {
    const codes = perms.map((p) => p.code);
    const allSelected = codes.every((c) => selected.includes(c));
    if (allSelected) {
      setSelected((prev) => prev.filter((p) => !codes.includes(p)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...codes])]);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          Edit Permissions for {role.name}
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {Object.entries(permissions).map(([module, perms]) => (
          <Accordion key={module} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Checkbox
                  checked={perms.every((p) => selected.includes(p.code))}
                  indeterminate={
                    perms.some((p) => selected.includes(p.code)) &&
                    !perms.every((p) => selected.includes(p.code))
                  }
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleSelectAll(module, perms)}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {module}
                </Typography>
                <Chip
                  label={`${perms.filter((p) => selected.includes(p.code)).length}/${perms.length}`}
                  size="small"
                  color="primary"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                {perms.map((perm) => (
                  <Grid item xs={12} sm={6} md={4} key={perm.code}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selected.includes(perm.code)}
                          onChange={() => handleToggle(perm.code)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {perm.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {perm.description}
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(role.code, selected)}>
          Save Permissions ({selected.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserManagementPage;

