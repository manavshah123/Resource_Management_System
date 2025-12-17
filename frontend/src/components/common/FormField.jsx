import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  Chip,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parseISO, format, isValid } from 'date-fns';

// Helper to convert string to Date
const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  if (typeof value === 'string') {
    try {
      const parsed = parseISO(value);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
};

// Helper to convert Date to ISO string (YYYY-MM-DD)
const formatDateToString = (date) => {
  if (!date || !isValid(date)) return '';
  try {
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

function FormField({
  type = 'text',
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  options = [],
  multiple = false,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'medium',
  placeholder,
  minRows,
  maxRows,
  ...props
}) {
  const handleChange = (e) => {
    if (type === 'date') {
      // Convert Date object to ISO string for consistent data handling
      const dateString = formatDateToString(e);
      onChange({ target: { name, value: dateString } });
    } else {
      onChange(e);
    }
  };

  const handleAutocompleteChange = (_, newValue) => {
    onChange({ target: { name, value: newValue } });
  };

  // Text field (text, email, password, number, textarea)
  if (['text', 'email', 'password', 'number', 'textarea'].includes(type)) {
    return (
      <TextField
        name={name}
        label={label}
        type={type === 'textarea' ? 'text' : type}
        value={value || ''}
        onChange={handleChange}
        error={!!error}
        helperText={error || helperText}
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        size={size}
        placeholder={placeholder}
        multiline={type === 'textarea'}
        minRows={type === 'textarea' ? minRows || 3 : undefined}
        maxRows={type === 'textarea' ? maxRows || 6 : undefined}
        {...props}
      />
    );
  }

  // Select field
  if (type === 'select') {
    return (
      <FormControl fullWidth={fullWidth} size={size} error={!!error} required={required}>
        <InputLabel>{label}</InputLabel>
        <Select
          name={name}
          value={value || (multiple ? [] : '')}
          onChange={handleChange}
          label={label}
          multiple={multiple}
          disabled={disabled}
          renderValue={
            multiple
              ? (selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((val) => (
                      <Chip
                        key={val}
                        label={options.find((o) => o.value === val)?.label || val}
                        size="small"
                      />
                    ))}
                  </Box>
                )
              : undefined
          }
          {...props}
        >
          {!multiple && !required && (
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {(error || helperText) && (
          <FormHelperText>{error || helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  // Autocomplete field
  if (type === 'autocomplete') {
    return (
      <Autocomplete
        value={value || (multiple ? [] : null)}
        onChange={handleAutocompleteChange}
        options={options}
        getOptionLabel={(option) => option.label || option}
        multiple={multiple}
        disabled={disabled}
        isOptionEqualToValue={(option, val) =>
          option.value === val?.value || option === val
        }
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            label={label}
            error={!!error}
            helperText={error || helperText}
            required={required}
            size={size}
            placeholder={placeholder}
          />
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.value || option}
              label={option.label || option}
              size="small"
            />
          ))
        }
        fullWidth={fullWidth}
        {...props}
      />
    );
  }

  // Date picker
  if (type === 'date') {
    // Parse string value to Date object for DatePicker
    const dateValue = parseDate(value);
    
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label={label}
          value={dateValue}
          onChange={handleChange}
          disabled={disabled}
          slotProps={{
            textField: {
              name,
              fullWidth,
              size,
              error: !!error,
              helperText: error || helperText,
              required,
            },
          }}
          {...props}
        />
      </LocalizationProvider>
    );
  }

  return null;
}

export default FormField;

