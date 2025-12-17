import { useState, useEffect } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  Avatar,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { employeeApi } from '@api/employeeApi';

/**
 * Reusable Employee Selector Component with FTE Display
 * 
 * @param {Object} props
 * @param {Object} props.value - Selected employee object
 * @param {Function} props.onChange - Callback when selection changes (employee) => void
 * @param {Array} props.employees - Optional pre-loaded employees list (if not provided, will fetch)
 * @param {Array} props.excludeIds - Array of employee IDs to exclude from the list
 * @param {boolean} props.loading - External loading state
 * @param {string} props.label - Label for the input field
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether the field is required
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {boolean} props.showFTEWarning - Whether to show FTE warning when selected
 * @param {string} props.error - Error message to display
 */
function EmployeeSelector({
  value = null,
  onChange,
  employees: externalEmployees,
  excludeIds = [],
  loading: externalLoading = false,
  label = 'Select Employee',
  placeholder = 'Search employees...',
  required = false,
  disabled = false,
  showFTEWarning = true,
  error,
}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (externalEmployees) {
      // Use provided employees list
      const filtered = externalEmployees.filter(emp => !excludeIds.includes(emp.id));
      setEmployees(filtered);
    } else {
      // Fetch employees if not provided
      fetchEmployees();
    }
  }, [externalEmployees, excludeIds]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      // Try to get employees with availability info
      let response;
      try {
        response = await employeeApi.getAllWithAvailability();
      } catch (err) {
        // Fallback to regular getAll
        response = await employeeApi.getAll({ size: 200 });
      }
      
      const allEmployees = response.data?.content || response.data || [];
      const filtered = allEmployees.filter(emp => !excludeIds.includes(emp.id));
      setEmployees(filtered);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setFetchError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Calculate FTE values for display
  const getEmployeeFTE = (employee) => {
    const currentFTE = employee.currentFTE || (employee.allocationPercentage ? employee.allocationPercentage / 100 : 0);
    const maxFTE = employee.maxFTE || 1.0;
    const availableFTE = employee.availableFTE || Math.max(0, maxFTE - currentFTE);
    return { currentFTE, maxFTE, availableFTE };
  };

  const isLoading = loading || externalLoading;

  return (
    <Box>
      <Autocomplete
        options={employees}
        getOptionLabel={(option) => {
          const { availableFTE, maxFTE } = getEmployeeFTE(option);
          return `${option.name} - ${option.designation || option.department} (${availableFTE.toFixed(2)}/${maxFTE.toFixed(2)} FTE available)`;
        }}
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        loading={isLoading}
        disabled={disabled}
        isOptionEqualToValue={(option, val) => option.id === val?.id}
        renderOption={(props, option) => {
          const { currentFTE, maxFTE, availableFTE } = getEmployeeFTE(option);
          const isOverallocated = currentFTE > maxFTE;
          const isFullyAllocated = availableFTE <= 0;
          
          return (
            <Box 
              component="li" 
              {...props} 
              key={option.id}
              sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center',
                opacity: isFullyAllocated ? 0.6 : 1,
              }}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: isOverallocated ? 'error.main' : 
                           isFullyAllocated ? 'warning.main' : 
                           availableFTE >= 0.5 ? 'success.main' : 'info.main',
                  fontSize: '0.9rem',
                }}
              >
                {option.name?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {option.designation || 'No designation'} • {option.department || 'No department'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Chip 
                  label={`${availableFTE.toFixed(2)} FTE`}
                  size="small"
                  color={isOverallocated ? 'error' : 
                         isFullyAllocated ? 'default' : 
                         availableFTE >= 0.5 ? 'success' : 'warning'}
                  variant={isFullyAllocated ? 'outlined' : 'filled'}
                  sx={{ fontWeight: 600, minWidth: 80 }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    color: 'text.secondary',
                    mt: 0.5,
                  }}
                >
                  of {maxFTE.toFixed(2)} max
                </Typography>
              </Box>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField 
            {...params} 
            label={label}
            placeholder={placeholder}
            required={required}
            error={Boolean(error || fetchError)}
            helperText={error || fetchError}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      
      {/* Show selected employee info with FTE warning */}
      {showFTEWarning && value && (
        <SelectedEmployeeInfo employee={value} />
      )}
    </Box>
  );
}

/**
 * Component to show selected employee's FTE info
 */
function SelectedEmployeeInfo({ employee }) {
  const currentFTE = employee.currentFTE || (employee.allocationPercentage ? employee.allocationPercentage / 100 : 0);
  const maxFTE = employee.maxFTE || 1.0;
  const availableFTE = employee.availableFTE || Math.max(0, maxFTE - currentFTE);
  
  const isOverallocated = currentFTE > maxFTE;
  const isFullyAllocated = availableFTE <= 0;
  const isLowAvailability = availableFTE > 0 && availableFTE < 0.25;
  
  let severity = 'info';
  let message = '';
  
  if (isOverallocated) {
    severity = 'error';
    message = `${employee.name} is over-allocated (${currentFTE.toFixed(2)}/${maxFTE.toFixed(2)} FTE). Adding more allocations will increase overload.`;
  } else if (isFullyAllocated) {
    severity = 'warning';
    message = `${employee.name} is fully allocated (${currentFTE.toFixed(2)}/${maxFTE.toFixed(2)} FTE). No availability remaining.`;
  } else if (isLowAvailability) {
    severity = 'warning';
    message = `${employee.name} has limited availability: ${availableFTE.toFixed(2)} FTE remaining (Max: ${maxFTE.toFixed(2)} FTE)`;
  } else {
    severity = 'info';
    message = `${employee.name} has ${availableFTE.toFixed(2)} FTE available (Max: ${maxFTE.toFixed(2)} FTE)`;
  }
  
  return (
    <Alert severity={severity} sx={{ mt: 1, py: 0.5 }}>
      <Typography variant="body2">{message}</Typography>
    </Alert>
  );
}

export default EmployeeSelector;
export { SelectedEmployeeInfo };


