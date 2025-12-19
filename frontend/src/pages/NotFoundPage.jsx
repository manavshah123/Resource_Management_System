import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';
import { useBranding } from '../context/BrandingContext';

function NotFoundPage() {
  const navigate = useNavigate();
  const { currentTheme } = useBranding();

  // Get colors from current theme
  const colors = currentTheme?.colors || {
    primary: '#3b82f6',
    secondary: '#10b981',
    sidebar: '#0f172a',
    accent: '#06b6d4',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.sidebar} 0%, ${adjustColor(colors.sidebar, 20)} 100%)`,
        color: 'white',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '6rem', md: '10rem' },
          fontWeight: 800,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          mb: 2,
        }}
      >
        404
      </Typography>
      <Typography
        variant="h4"
        sx={{ fontWeight: 600, mb: 2 }}
      >
        Page Not Found
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4, maxWidth: 400 }}
      >
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          px: 4,
          py: 1.5,
          '&:hover': {
            background: `linear-gradient(135deg, ${adjustColor(colors.primary, -10)} 0%, ${adjustColor(colors.secondary, -10)} 100%)`,
          },
        }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
}

// Helper to adjust a hex color (lighten if positive, darken if negative)
function adjustColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

export default NotFoundPage;
