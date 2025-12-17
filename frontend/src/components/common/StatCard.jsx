import { Box, Card, CardContent, Typography, Avatar, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  loading = false,
  onClick,
}) {
  const colorMap = {
    primary: {
      bg: 'rgba(6, 182, 212, 0.1)',
      icon: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      icon: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      icon: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      icon: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      icon: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
    purple: {
      bg: 'rgba(139, 92, 246, 0.1)',
      icon: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
  };

  const colors = colorMap[color] || colorMap.primary;

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return <TrendingUp sx={{ fontSize: 16 }} />;
    if (trend === 'down') return <TrendingDown sx={{ fontSize: 16 }} />;
    return <TrendingFlat sx={{ fontSize: 16 }} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'success.main';
    if (trend === 'down') return 'error.main';
    return 'text.secondary';
  };

  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: colors.gradient,
            borderRadius: '12px 12px 0 0',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={80} height={40} sx={{ mt: 1 }} />
              <Skeleton variant="text" width={120} height={16} sx={{ mt: 1 }} />
            </Box>
            <Skeleton variant="circular" width={48} height={48} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.15)',
            }
          : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: colors.gradient,
          borderRadius: '12px 12px 0 0',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}
            >
              {value}
            </Typography>
            {(subtitle || trendValue) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                {trendValue && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: getTrendColor(),
                    }}
                  >
                    {getTrendIcon()}
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {trendValue}
                    </Typography>
                  </Box>
                )}
                {subtitle && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          {Icon && (
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: colors.bg,
                color: colors.icon,
              }}
            >
              <Icon />
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatCard;

