import { Navigate, Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import { useAuthStore } from '@store/authStore';
import { useBranding } from '../context/BrandingContext';

function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  const { branding, currentTheme } = useBranding();

  // Get colors from current theme
  const colors = currentTheme?.colors || {
    primary: '#3b82f6',
    secondary: '#10b981',
    sidebar: '#0f172a',
    sidebarText: '#ffffff',
    accent: '#06b6d4',
  };

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
        background: `linear-gradient(135deg, ${colors.sidebar} 0%, ${adjustColor(colors.sidebar, 20)} 50%, ${adjustColor(colors.sidebar, 40)} 100%)`,
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
            radial-gradient(circle at 20% 80%, ${colors.primary}25 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${colors.accent}20 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${colors.secondary}15 0%, transparent 40%)
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
          background: `radial-gradient(circle, ${colors.primary}15 0%, transparent 70%)`,
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
          background: `radial-gradient(circle, ${colors.accent}15 0%, transparent 70%)`,
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
                boxShadow: `0 8px 32px ${colors.primary}40`,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: `0 8px 32px ${colors.primary}40`,
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
            Manage your team resources efficiently
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

// Helper to lighten a hex color
function adjustColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

export default AuthLayout;
