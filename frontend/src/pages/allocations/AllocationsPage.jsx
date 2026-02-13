import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
  Autocomplete,
  TextField,
  Checkbox,
} from '@mui/material';
import { CheckBoxOutlineBlank, CheckBox as CheckBoxIcon } from '@mui/icons-material';
import { PageHeader, DataTable, SearchFilter, StatusChip, Modal, FormField, EmployeeSelector } from '@components/common';
import { useUIStore } from '@store/uiStore';
import { allocationApi } from '@api/allocationApi';
import { employeeApi } from '@api/employeeApi';
import { projectApi } from '@api/projectApi';
import { skillApi } from '@api/skillApi';

const columns = [
  {
    id: 'employeeName',
    label: 'Employee',
    minWidth: 200,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
          {value?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {value || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.employeeDepartment || 'N/A'}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    id: 'projectName',
    label: 'Project',
    minWidth: 180,
    render: (value, row) => (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value || 'N/A'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {row.projectClient || 'N/A'}
        </Typography>
      </Box>
    ),
  },
  {
    id: 'role',
    label: 'Role',
    minWidth: 140,
  },
  {
    id: 'fte',
    label: 'FTE',
    minWidth: 100,
    render: (value, row) => {
      // Handle both fte and allocationPercentage for backward compatibility
      const fteValue = value || (row.allocationPercentage ? row.allocationPercentage / 100 : 0);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={fteValue * 100}
            sx={{ flex: 1, height: 6, borderRadius: 3 }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
            {fteValue.toFixed(2)}
          </Typography>
        </Box>
      );
    },
  },
  {
    id: 'startDate',
    label: 'Start Date',
    minWidth: 100,
    render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
  },
  {
    id: 'endDate',
    label: 'End Date',
    minWidth: 100,
    render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
  },
  {
    id: 'assignedSkills',
    label: 'Tech Stack',
    minWidth: 180,
    render: (value) => (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {value && value.length > 0 ? (
          value.slice(0, 3).map((skill, idx) => (
            <Chip
              key={idx}
              label={skill.name}
              size="small"
              sx={{
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                fontSize: '0.7rem',
              }}
            />
          ))
        ) : (
          <Typography variant="caption" color="text.secondary">—</Typography>
        )}
        {value && value.length > 3 && (
          <Chip
            label={`+${value.length - 3}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        )}
      </Box>
    ),
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    render: (value) => <StatusChip status={value} />,
  },
];

const filterOptions = [
  {
    id: 'status',
    label: 'Status',
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'COMPLETED', label: 'Completed' },
    ],
  },
];

function AllocationsPage() {
  const { showSnackbar } = useUIStore();
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [projectTechStack, setProjectTechStack] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const initialFormData = {
    employeeId: '',
    projectId: '',
    fte: 0.5,
    startDate: '',
    endDate: '',
    role: '',
    billable: true,
    assignedSkillIds: [],
  };
  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedAllocation(null);
    setSelectedSkills([]);
    setProjectTechStack([]);
    setSelectedEmployee(null);
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [allocationsRes, employeesRes, projectsRes, skillsRes] = await Promise.all([
        allocationApi.getAll({ page, size: rowsPerPage }),
        employeeApi.getAll({ size: 100 }),
        projectApi.getAll({ size: 100 }),
        skillApi.getAll(),
      ]);
      
      const allocData = allocationsRes.data.content || allocationsRes.data;
      setAllocations(allocData);
      setTotalCount(allocationsRes.data.totalElements || allocData.length);
      
      const empData = employeesRes.data.content || employeesRes.data;
      setEmployees(empData);
      
      const projData = projectsRes.data.content || projectsRes.data;
      setProjects(projData);
      
      const skillData = skillsRes.data?.content || skillsRes.data || [];
      setSkills(skillData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load allocations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllocation = () => {
    resetForm();
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    
    setFormData({
      ...initialFormData,
      startDate: today.toISOString().split('T')[0],
      endDate: threeMonthsLater.toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleEditAllocation = (allocation) => {
    setSelectedAllocation(allocation);
    // Convert percentage to FTE if needed
    const fteValue = allocation.fte || (allocation.allocationPercentage ? allocation.allocationPercentage / 100 : 0.5);
    setFormData({
      employeeId: allocation.employeeId?.toString() || '',
      projectId: allocation.projectId?.toString() || '',
      fte: fteValue,
      startDate: allocation.startDate || '',
      endDate: allocation.endDate || '',
      role: allocation.role || '',
      billable: allocation.billable !== undefined ? allocation.billable : true,
      assignedSkillIds: allocation.assignedSkills?.map(s => s.id) || [],
    });
    // Find and set the selected employee for the selector
    const emp = employees.find(e => e.id === allocation.employeeId);
    setSelectedEmployee(emp || null);
    // Set selected skills for the Autocomplete
    setSelectedSkills(allocation.assignedSkills || []);
    // Set project tech stack for filtering
    if (allocation.projectId) {
      const proj = projects.find(p => p.id === allocation.projectId);
      setProjectTechStack(proj?.techStack || []);
    }
    setModalOpen(true);
  };

  // When project changes, update available tech stack
  const handleProjectChange = async (e) => {
    const projectId = e.target.value;
    setFormData({ ...formData, projectId });
    
    // Clear selected skills when project changes
    setSelectedSkills([]);
    
    if (!projectId) {
      setProjectTechStack([]);
      return;
    }
    
    // First check if we have tech stack in the already loaded projects
    const selectedProject = projects.find(p => p.id.toString() === projectId);
    if (selectedProject?.techStack && selectedProject.techStack.length > 0) {
      setProjectTechStack(selectedProject.techStack);
    } else {
      // Fetch project details to get tech stack
      try {
        const response = await projectApi.getById(projectId);
        const projectData = response.data;
        if (projectData?.techStack && projectData.techStack.length > 0) {
          setProjectTechStack(projectData.techStack);
        } else {
          // No tech stack defined for this project
          setProjectTechStack([]);
        }
      } catch (error) {
        console.error('Failed to fetch project tech stack:', error);
        setProjectTechStack([]);
      }
    }
  };

  const handleSkillsChange = (event, newValue) => {
    setSelectedSkills(newValue);
  };

  const handleDeleteAllocation = async (allocation) => {
    try {
      await allocationApi.delete(allocation.id);
      showSnackbar('Allocation deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showSnackbar('Failed to delete allocation', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.projectId || !formData.fte) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      showSnackbar('Please select start and end dates', 'error');
      return;
    }

    try {
      const payload = {
        employeeId: parseInt(formData.employeeId),
        projectId: parseInt(formData.projectId),
        fte: parseFloat(formData.fte),
        allocationPercentage: Math.round(parseFloat(formData.fte) * 100), // For backward compatibility
        startDate: formData.startDate,
        endDate: formData.endDate,
        role: formData.role || '',
        billable: formData.billable !== undefined ? formData.billable : true,
        assignedSkillIds: selectedSkills.map(s => s.id),
      };

      if (selectedAllocation) {
        await allocationApi.update(selectedAllocation.id, payload);
        showSnackbar('Allocation updated successfully', 'success');
      } else {
        await allocationApi.create(payload);
        showSnackbar('Allocation created successfully', 'success');
      }
      fetchData();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Allocation save error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to save allocation';
      showSnackbar(errorMsg, 'error');
    }
  };

  const filteredAllocations = allocations.filter((alloc) => {
    const matchesSearch =
      !search ||
      alloc.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      alloc.projectName?.toLowerCase().includes(search.toLowerCase());

    const matchesFilters = !filters.status || alloc.status === filters.status;

    return matchesSearch && matchesFilters;
  });

  // Calculate summary stats
  const totalAllocations = allocations.length;
  const activeAllocations = allocations.filter((a) => a.status === 'ACTIVE').length;
  const avgFte = allocations.length > 0
    ? allocations.reduce((sum, a) => sum + (a.fte || (a.allocationPercentage ? a.allocationPercentage / 100 : 0)), 0) / allocations.length
    : 0;

  if (loading && allocations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
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

  return (
    <Box>
      <PageHeader
        title="Resource Allocations"
        subtitle={`${totalCount} total allocations`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Allocations' },
        ]}
        onPrimaryAction={handleAddAllocation}
        primaryActionLabel="New Allocation"
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {totalAllocations}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Allocations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {activeAllocations}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Active Allocations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {avgFte.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Average FTE
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by employee or project..."
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={setFilters}
        onClearFilters={() => setFilters({})}
      />

      <DataTable
        columns={columns}
        data={filteredAllocations}
        totalCount={filteredAllocations.length}
        page={page}
        rowsPerPage={rowsPerPage}
        loading={loading}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onEdit={handleEditAllocation}
        onDelete={handleDeleteAllocation}
        emptyMessage="No allocations found"
      />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={selectedAllocation ? 'Edit Allocation' : 'Create New Allocation'}
        maxWidth="sm"
        onConfirm={handleSubmit}
        confirmText={selectedAllocation ? 'Update' : 'Create'}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <EmployeeSelector
            value={selectedEmployee}
            onChange={(emp) => {
              setSelectedEmployee(emp);
              setFormData({ ...formData, employeeId: emp?.id?.toString() || '' });
            }}
            employees={employees}
            label="Employee"
            placeholder="Search and select employee..."
            required
            showFTEWarning={true}
          />
          <FormField
            name="projectId"
            label="Project"
            type="select"
            value={formData.projectId}
            onChange={handleProjectChange}
            options={projects.map(proj => ({
              value: proj.id.toString(),
              label: `${proj.name} ${proj.client ? `(${proj.client})` : ''}`
            }))}
            required
          />
          <FormField
            name="role"
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
          <FormField
            name="fte"
            label="FTE (Full-Time Equivalent)"
            type="select"
            value={formData.fte}
            onChange={(e) => setFormData({ ...formData, fte: e.target.value })}
            options={[
              { value: 0.25, label: '0.25 FTE (Quarter Time)' },
              { value: 0.50, label: '0.50 FTE (Half Time)' },
              { value: 0.75, label: '0.75 FTE (Three Quarter)' },
              { value: 1.00, label: '1.00 FTE (Full Time)' },
            ]}
            required
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormField
                name="startDate"
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormField
                name="endDate"
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </Grid>
          </Grid>
          
          {/* Tech Stack / Assigned Skills Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Assigned Tech Stack
            </Typography>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={projectTechStack.length > 0 ? projectTechStack : skills}
              getOptionLabel={(option) => option.name || ''}
              value={selectedSkills}
              onChange={handleSkillsChange}
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
                  placeholder={formData.projectId ? "Select technologies this person will work on..." : "Select a project first..."}
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
              disabled={!formData.projectId}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {!formData.projectId 
                ? '↑ First select a project to see its tech stack'
                : projectTechStack.length > 0 
                  ? `✓ Showing ${projectTechStack.length} skills from project's tech stack`
                  : '⚠ This project has no tech stack defined. Add skills to the project first.'
              }
            </Typography>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default AllocationsPage;
