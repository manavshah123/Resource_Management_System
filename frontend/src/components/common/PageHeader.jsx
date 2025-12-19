import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Add as AddIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';

function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  primaryAction,
  onPrimaryAction,
  primaryActionIcon = AddIcon,
  primaryActionLabel = 'Add New',
}) {
  const PrimaryIcon = primaryActionIcon;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography
                key={crumb.path || index}
                color="text.primary"
                sx={{ fontWeight: 500 }}
              >
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={crumb.path || index}
                component={RouterLink}
                to={crumb.path}
                underline="hover"
                color="inherit"
                sx={{ '&:hover': { color: 'var(--primary-color, #3b82f6)' } }}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Title and Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {actions}
          {primaryAction !== false && onPrimaryAction && (
            <Button
              variant="contained"
              startIcon={<PrimaryIcon />}
              onClick={onPrimaryAction}
              sx={{
                px: 3,
                bgcolor: 'var(--primary-color, #3b82f6)',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: 'var(--primary-color-dark, #2563eb)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
              }}
            >
              {primaryActionLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default PageHeader;
