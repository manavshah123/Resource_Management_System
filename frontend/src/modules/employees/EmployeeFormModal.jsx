import { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Modal, FormField } from '@components/common';

const departmentOptions = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Design', label: 'Design' },
  { value: 'Product', label: 'Product' },
  { value: 'QA', label: 'QA' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'HR', label: 'HR' },
  { value: 'Finance', label: 'Finance' },
];

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' },
];

const maxFTEOptions = [
  { value: 0.25, label: '0.25 FTE (2 hrs/day)' },
  { value: 0.50, label: '0.50 FTE (4 hrs/day)' },
  { value: 0.75, label: '0.75 FTE (6 hrs/day)' },
  { value: 1.00, label: '1.00 FTE (8 hrs/day) - Full Time' },
  { value: 1.25, label: '1.25 FTE (10 hrs/day)' },
  { value: 1.50, label: '1.50 FTE (12 hrs/day)' },
];

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  employeeId: '',
  department: '',
  designation: '',
  location: '',
  joinDate: null,
  status: 'ACTIVE',
  manager: '',
  maxFTE: 1.0,
};

function EmployeeFormModal({ open, onClose, employee, onSubmit }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(employee);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        employeeId: employee.employeeId || '',
        department: employee.department || '',
        designation: employee.designation || '',
        location: employee.location || '',
        joinDate: employee.joinDate ? new Date(employee.joinDate) : null,
        status: employee.status || 'ACTIVE',
        manager: employee.manager || '',
        maxFTE: employee.maxFTE || 1.0,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [employee, open]);

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
      newErrors.name = 'Name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.employeeId?.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.designation?.trim()) {
      newErrors.designation = 'Designation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Employee' : 'Add New Employee'}
      maxWidth="md"
      onConfirm={handleSubmit}
      confirmText={isEdit ? 'Update' : 'Create'}
      loading={loading}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 3 }}>
          {isEdit
            ? 'Update employee information'
            : 'Fill in the details to add a new employee'}
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <FormField
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="phone"
              label="Phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="employeeId"
              label="Employee ID"
              value={formData.employeeId}
              onChange={handleChange}
              error={errors.employeeId}
              required
              disabled={isEdit}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="department"
              label="Department"
              type="select"
              value={formData.department}
              onChange={handleChange}
              options={departmentOptions}
              error={errors.department}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="designation"
              label="Designation"
              value={formData.designation}
              onChange={handleChange}
              error={errors.designation}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="location"
              label="Location"
              value={formData.location}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="joinDate"
              label="Join Date"
              type="date"
              value={formData.joinDate}
              onChange={handleChange}
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
              name="manager"
              label="Reports To"
              value={formData.manager}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              name="maxFTE"
              label="Max FTE Capacity"
              type="select"
              value={formData.maxFTE}
              onChange={handleChange}
              options={maxFTEOptions}
              helperText="Maximum allocation capacity (1 FTE = 8 hours/day)"
            />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}

export default EmployeeFormModal;

