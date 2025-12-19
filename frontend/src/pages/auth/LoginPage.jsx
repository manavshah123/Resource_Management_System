import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuthStore } from '@store/authStore';
import { useBranding } from '../../context/BrandingContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { branding } = useBranding();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await login(formData);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome Back
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Sign in to continue to {branding.appName || 'Resource Management Portal'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          name="email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!validationErrors.email}
          helperText={validationErrors.email}
          margin="normal"
          autoComplete="email"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          error={!!validationErrors.password}
          helperText={validationErrors.password}
          margin="normal"
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 3 }}>
          <Link
            href="#"
            variant="body2"
            sx={{ color: 'primary.main', textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{
            py: 1.5,
            bgcolor: 'var(--primary-color, #3b82f6)',
            color: '#ffffff',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': {
              bgcolor: 'var(--primary-color-dark, #2563eb)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Sign In'
          )}
        </Button>
      </Box>

      {/* Demo credentials */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          bgcolor: 'action.hover',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Demo Credentials
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
          admin@rmp.com / admin123
        </Typography>
      </Box>
    </Box>
  );
}

export default LoginPage;

