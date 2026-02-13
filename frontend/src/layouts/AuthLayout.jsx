import { Navigate, Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import { useAuthStore } from '@store/authStore';
import { useBranding } from '../context/BrandingContext';

function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  const { branding } = useBranding();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--sidebar-bg, #0f172a) 0%, #1e293b 50%, #334155 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(var(--primary-color-rgb, 59, 130, 246), 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(var(--accent-color-rgb, 139, 92, 246), 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(var(--secondary-color-rgb, 16, 185, 129), 0.08) 0%, transparent 40%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--primary-color-rgb, 59, 130, 246), 0.08) 0%, transparent 70%)',
          top: '-200px',
          right: '-100px',
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-color-rgb, 139, 92, 246), 0.08) 0%, transparent 70%)',
          bottom: '-150px',
          left: '-100px',
          filter: 'blur(40px)',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          {/* Logo */}
          {branding.appLogo ? (
            <Box
              component="img"
              src={branding.appLogo}
              alt={branding.appName}
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                objectFit: 'contain',
                mb: 2,
                boxShadow: '0 8px 32px rgba(var(--primary-color-rgb, 59, 130, 246), 0.3)',
              }}
            />
          ) : (
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: 'var(--primary-color, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              }}
            >
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                {(branding.appName || 'RMP').charAt(0)}
              </Typography>
            </Box>
          )}
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}
          >
            {branding.appName || 'Resource Portal'}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1 }}
          >
            {branding.companyName ? `Welcome to ${branding.companyName}` : 'Manage your team resources efficiently'}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Outlet />
        </Paper>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 4,
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          {branding.copyrightText || '© 2024 Resource Management Portal. All rights reserved.'}
        </Typography>
      </Container>
    </Box>
  );
}

export default AuthLayout;
