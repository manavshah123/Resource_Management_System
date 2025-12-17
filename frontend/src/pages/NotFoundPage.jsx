import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
          background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
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
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          px: 4,
          py: 1.5,
        }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
}

export default NotFoundPage;

