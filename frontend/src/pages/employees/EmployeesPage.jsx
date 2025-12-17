import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Avatar,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import {
  PageHeader,
  DataTable,
  SearchFilter,
  StatusChip,
} from '@components/common';
import EmployeeFormModal from '@modules/employees/EmployeeFormModal';
import { useUIStore } from '@store/uiStore';
import { employeeApi } from '@api/employeeApi';

const columns = [
  {
    id: 'name',
    label: 'Employee',
    minWidth: 200,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          src={row.avatar}
          alt={value}
          sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
        >
          {value?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.email}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    id: 'employeeId',
    label: 'ID',
    minWidth: 100,
  },
  {
    id: 'department',
    label: 'Department',
    minWidth: 150,
  },
  {
    id: 'designation',
    label: 'Designation',
    minWidth: 150,
  },
  {
    id: 'skills',
    label: 'Skills',
    minWidth: 200,
    render: (value) => (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {value?.slice(0, 3).map((skill, idx) => (
          <Chip
            key={skill.id || idx}
            label={skill.name || skill}
            size="small"
            sx={{ fontSize: '0.7rem' }}
          />
        ))}
        {value?.length > 3 && (
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
    id: 'currentFTE',
    label: 'Current FTE',
    minWidth: 100,
    render: (value, row) => {
      const fte = value || (row.allocationPercentage ? row.allocationPercentage / 100 : 0);
      const maxFTE = row.maxFTE || 1.0;
      return (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: fte > maxFTE ? 'error.main' : fte === maxFTE ? 'success.main' : 'warning.main',
          }}
        >
          {fte.toFixed(2)} / {maxFTE.toFixed(2)}
        </Typography>
      );
    },
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 120,
    render: (value) => <StatusChip status={value} />,
  },
];

const filterOptions = [
  {
    id: 'department',
    label: 'Department',
    options: [
      { value: 'Engineering', label: 'Engineering' },
      { value: 'Design', label: 'Design' },
      { value: 'Product', label: 'Product' },
      { value: 'QA', label: 'QA' },
      { value: 'DevOps', label: 'DevOps' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
      { value: 'ON_LEAVE', label: 'On Leave' },
    ],
  },
];

const quickFilters = [
  { id: 'all', label: 'All' },
  { id: 'bench', label: 'On Bench' },
  { id: 'allocated', label: 'Allocated' },
  { id: 'overallocated', label: 'Over-allocated' },
];

function EmployeesPage() {
  const navigate = useNavigate();
  const { openModal, modals, closeModal, showSnackbar } = useUIStore();
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [quickFilter, setQuickFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage, sortBy, sortOrder, quickFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (quickFilter === 'bench') {
        response = await employeeApi.getBench();
        setEmployees(response.data);
        setTotalCount(response.data.length);
      } else if (quickFilter === 'overallocated') {
        response = await employeeApi.getAll({ page, size: rowsPerPage });
        const allEmployees = response.data.content || response.data;
        const overallocated = allEmployees.filter(e => {
          const currentFTE = e.currentFTE || (e.allocationPercentage ? e.allocationPercentage / 100 : 0);
          const maxFTE = e.maxFTE || 1.0;
          return currentFTE > maxFTE;
        });
        setEmployees(overallocated);
        setTotalCount(overallocated.length);
      } else if (quickFilter === 'allocated') {
        response = await employeeApi.getAll({ page, size: rowsPerPage });
        const allEmployees = response.data.content || response.data;
        const allocated = allEmployees.filter(e => {
          const currentFTE = e.currentFTE || (e.allocationPercentage ? e.allocationPercentage / 100 : 0);
          const maxFTE = e.maxFTE || 1.0;
          return currentFTE > 0 && currentFTE <= maxFTE;
        });
        setEmployees(allocated);
        setTotalCount(allocated.length);
      } else {
        response = await employeeApi.getAll({ 
          page, 
          size: rowsPerPage,
          sort: `${sortBy},${sortOrder}`
        });
        
        if (response.data.content) {
          setEmployees(response.data.content);
          setTotalCount(response.data.totalElements);
        } else {
          setEmployees(response.data);
          setTotalCount(response.data.length);
        }
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    openModal('createEmployee');
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    openModal('editEmployee');
  };

  const handleViewEmployee = (employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const handleDeleteEmployee = async (employee) => {
    try {
      await employeeApi.delete(employee.id);
      showSnackbar(`Employee ${employee.name} deleted`, 'success');
      fetchEmployees();
    } catch (err) {
      showSnackbar('Failed to delete employee', 'error');
    }
  };

  const handleSort = (columnId, order) => {
    setSortBy(columnId);
    setSortOrder(order);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedEmployee) {
        await employeeApi.update(selectedEmployee.id, data);
        showSnackbar('Employee updated successfully', 'success');
      } else {
        await employeeApi.create(data);
        showSnackbar('Employee created successfully', 'success');
      }
      fetchEmployees();
      closeModal('createEmployee');
      closeModal('editEmployee');
    } catch (err) {
      showSnackbar('Failed to save employee', 'error');
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !search ||
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(search.toLowerCase());

    const matchesFilters =
      (!filters.department || emp.department === filters.department) &&
      (!filters.status || emp.status === filters.status);

    return matchesSearch && matchesFilters;
  });

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
        title="Employees"
        subtitle={`${totalCount} total employees`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Employees' },
        ]}
        onPrimaryAction={handleAddEmployee}
        primaryActionLabel="Add Employee"
        actions={
          <>
            <Button variant="outlined" startIcon={<UploadIcon />}>
              Import
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export
            </Button>
          </>
        }
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employees..."
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={setFilters}
        onClearFilters={() => setFilters({})}
        quickFilters={quickFilters}
        activeQuickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
      />

      <DataTable
        columns={columns}
        data={filteredEmployees}
        totalCount={filteredEmployees.length}
        page={page}
        rowsPerPage={rowsPerPage}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSort={handleSort}
        onView={handleViewEmployee}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        emptyMessage="No employees found"
      />

      {/* Create/Edit Employee Modal */}
      <EmployeeFormModal
        open={modals.createEmployee || modals.editEmployee}
        onClose={() => {
          closeModal('createEmployee');
          closeModal('editEmployee');
        }}
        employee={selectedEmployee}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
}

export default EmployeesPage;
