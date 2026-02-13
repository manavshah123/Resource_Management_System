import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Avatar,
  AvatarGroup,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { PageHeader, SearchFilter, StatusChip, DataTable } from '@components/common';
import ProjectFormModal from '@modules/projects/ProjectFormModal';
import { useUIStore } from '@store/uiStore';
import { projectApi } from '@api/projectApi';

const quickFilters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'on_hold', label: 'On Hold' },
];

const filterOptions = [
  {
    id: 'status',
    label: 'Status',
    options: [
      { value: 'NOT_STARTED', label: 'Not Started' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'ON_HOLD', label: 'On Hold' },
      { value: 'COMPLETED', label: 'Completed' },
    ],
  },
  {
    id: 'priority',
    label: 'Priority',
    options: [
      { value: 'LOW', label: 'Low' },
      { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' },
      { value: 'CRITICAL', label: 'Critical' },
    ],
  },
];

function ProjectCard({ project, onMenuClick, onView }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.15)',
        },
      }}
      onClick={() => onView(project)}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {project.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {project.clientName || project.client || 'N/A'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description || 'No description'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <StatusChip status={project.status} />
          {project.priority && <StatusChip status={project.priority} />}
        </Box>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Tech Stack
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {project.techStack.slice(0, 4).map((skill) => (
                <Chip
                  key={skill.id}
                  label={skill.name}
                  size="small"
                  sx={{
                    fontSize: '0.7rem',
                    height: 22,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  }}
                />
              ))}
              {project.techStack.length > 4 && (
                <Chip
                  label={`+${project.techStack.length - 4}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {project.progress || 0}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={project.progress || 0}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: project.progress === 100 ? 'success.main' : 'primary.main',
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </Typography>
          </Box>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12 } }}>
            {(project.teamMembers || []).map((member, index) => (
              <Avatar key={member.id || index} src={member.avatar} alt={member.name}>
                {member.name?.charAt(0)}
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
          <MenuItem onClick={handleMenuClose}>Manage Team</MenuItem>
          <MenuItem onClick={handleMenuClose}>View Timeline</MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
}

function ProjectsPage() {
  const navigate = useNavigate();
  const { openModal, modals, closeModal, showSnackbar } = useUIStore();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [quickFilter, setQuickFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, [page, rowsPerPage, quickFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectApi.getAll({ page, size: rowsPerPage });
      
      if (response.data.content) {
        setProjects(response.data.content);
        setTotalCount(response.data.totalElements);
      } else {
        setProjects(response.data);
        setTotalCount(response.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = () => {
    setSelectedProject(null);
    openModal('createProject');
  };

  const handleViewProject = (project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedProject) {
        await projectApi.update(selectedProject.id, data);
        showSnackbar('Project updated successfully', 'success');
      } else {
        await projectApi.create(data);
        showSnackbar('Project created successfully', 'success');
      }
      fetchProjects();
      closeModal('createProject');
      closeModal('editProject');
    } catch (err) {
      showSnackbar('Failed to save project', 'error');
    }
  };

  const filteredProjects = projects.filter((proj) => {
    const matchesSearch =
      !search ||
      proj.name?.toLowerCase().includes(search.toLowerCase()) ||
      proj.clientName?.toLowerCase().includes(search.toLowerCase());

    const matchesFilters =
      (!filters.status || proj.status === filters.status) &&
      (!filters.priority || proj.priority === filters.priority);

    const matchesQuickFilter =
      quickFilter === 'all' ||
      (quickFilter === 'active' && proj.status === 'IN_PROGRESS') ||
      (quickFilter === 'completed' && proj.status === 'COMPLETED') ||
      (quickFilter === 'on_hold' && proj.status === 'ON_HOLD');

    return matchesSearch && matchesFilters && matchesQuickFilter;
  });

  if (loading && projects.length === 0) {
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
        title="Projects"
        subtitle={`${totalCount} total projects`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Projects' },
        ]}
        onPrimaryAction={handleAddProject}
        primaryActionLabel="New Project"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <GridIcon />
            </IconButton>
            <IconButton
              onClick={() => setViewMode('list')}
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <ListIcon />
            </IconButton>
          </Box>
        }
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search projects..."
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={setFilters}
        onClearFilters={() => setFilters({})}
        quickFilters={quickFilters}
        activeQuickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
      />

      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} lg={4} key={project.id}>
              <ProjectCard project={project} onView={handleViewProject} />
            </Grid>
          ))}
          {filteredProjects.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No projects found
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      ) : (
        <DataTable
          columns={[
            { id: 'name', label: 'Project Name', minWidth: 200 },
            { id: 'clientName', label: 'Client', minWidth: 150 },
            {
              id: 'techStack',
              label: 'Tech Stack',
              minWidth: 200,
              render: (value) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {value && value.length > 0 ? (
                    <>
                      {value.slice(0, 3).map((skill) => (
                        <Chip
                          key={skill.id}
                          label={skill.name}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            height: 20,
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                          }}
                        />
                      ))}
                      {value.length > 3 && (
                        <Chip
                          label={`+${value.length - 3}`}
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
              ),
            },
            {
              id: 'status',
              label: 'Status',
              minWidth: 120,
              render: (value) => <StatusChip status={value} />,
            },
            {
              id: 'priority',
              label: 'Priority',
              minWidth: 100,
              render: (value) => value ? <StatusChip status={value} /> : 'N/A',
            },
            {
              id: 'progress',
              label: 'Progress',
              minWidth: 150,
              render: (value) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={value || 0}
                    sx={{ flex: 1, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="body2">{value || 0}%</Typography>
                </Box>
              ),
            },
            { id: 'managerName', label: 'Manager', minWidth: 150 },
          ]}
          data={filteredProjects}
          totalCount={filteredProjects.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onView={handleViewProject}
          loading={loading}
          emptyMessage="No projects found"
        />
      )}

      <ProjectFormModal
        open={modals.createProject || modals.editProject}
        onClose={() => {
          closeModal('createProject');
          closeModal('editProject');
        }}
        project={selectedProject}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
}

export default ProjectsPage;
