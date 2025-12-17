import { useState, useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress, Chip, Autocomplete, TextField, Checkbox } from '@mui/material';
import { CheckBoxOutlineBlank, CheckBox as CheckBoxIcon } from '@mui/icons-material';
import { Modal, FormField } from '@components/common';
import { userApi } from '@api/userApi';
import { skillApi } from '@api/skillApi';

const statusOptions = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
];

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const initialFormData = {
  name: '',
  description: '',
  client: '',
  status: 'NOT_STARTED',
  priority: 'MEDIUM',
  startDate: '',
  endDate: '',
  budget: '',
  managerId: '',
  requiredSkillIds: [],
};

function ProjectFormModal({ open, onClose, project, onSubmit }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const isEdit = Boolean(project);

  // Fetch users and skills when modal opens
  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchSkills();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await userApi.getAllList();
      // Filter to only show users who can be managers (ADMIN, PM)
      const allUsers = response.data || [];
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      setSkillsLoading(true);
      const response = await skillApi.getAll();
      setSkills(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setSkillsLoading(false);
    }
  };

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        client: project.client || '',
        status: project.status || 'NOT_STARTED',
        priority: project.priority || 'MEDIUM',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        budget: project.budget || '',
        managerId: project.managerId || project.manager?.id || '',
        requiredSkillIds: project.requiredSkillIds || [],
      });
      // Set selected skills for the Autocomplete
      if (project.techStack && skills.length > 0) {
        setSelectedSkills(project.techStack);
      } else if (project.requiredSkillIds && skills.length > 0) {
        const preSelected = skills.filter(s => project.requiredSkillIds.includes(s.id));
        setSelectedSkills(preSelected);
      }
    } else {
      setFormData(initialFormData);
      setSelectedSkills([]);
    }
    setErrors({});
  }, [project, open, skills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.client?.trim()) {
      newErrors.client = 'Client is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: formData.name,
        description: formData.description,
        client: formData.client,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        budget: parseFloat(formData.budget) || 0,
        managerId: formData.managerId ? Number(formData.managerId) : null,
        requiredSkillIds: selectedSkills.map(s => s.id),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkillsChange = (event, newValue) => {
    setSelectedSkills(newValue);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Project' : 'Create New Project'}
      maxWidth="md"
      onConfirm={handleSubmit}
      confirmText={isEdit ? 'Update' : 'Create'}
      loading={loading}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 3 }}>
          {isEdit
            ? 'Update project information'
            : 'Fill in the details to create a new project'}
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <FormField
              name="name"
              label="Project Name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormField
              name="description"
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              minRows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="client"
              label="Client"
              value={formData.client}
              onChange={handleChange}
              error={errors.client}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="managerId"
              label="Project Manager"
              type="select"
              value={formData.managerId}
              onChange={handleChange}
              options={users.map(user => ({ value: user.id, label: user.name || user.email }))}
              disabled={usersLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="status"
              label="Status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="priority"
              label="Priority"
              type="select"
              value={formData.priority}
              onChange={handleChange}
              options={priorityOptions}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="startDate"
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="endDate"
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              error={errors.endDate}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="budget"
              label="Budget ($)"
              type="number"
              value={formData.budget}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Tech Stack / Required Skills
            </Typography>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={skills}
              getOptionLabel={(option) => option.name || ''}
              value={selectedSkills}
              onChange={handleSkillsChange}
              loading={skillsLoading}
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
                  placeholder="Select technologies..."
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {skillsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
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
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      '& .MuiChip-deleteIcon': {
                        color: 'primary.contrastText',
                      },
                    }}
                  />
                ))
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Select the technologies and skills required for this project
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}

export default ProjectFormModal;

