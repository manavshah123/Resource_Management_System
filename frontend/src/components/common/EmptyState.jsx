import { Box, Typography, Button } from '@mui/material';
import { Inbox as InboxIcon, Add as AddIcon } from '@mui/icons-material';

function EmptyState({
  icon: Icon = InboxIcon,
  title = 'No Data Found',
  description = 'There are no items to display.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon = AddIcon,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <Icon sx={{ fontSize: 40, color: 'text.secondary' }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', maxWidth: 360, mb: actionLabel ? 3 : 0 }}
      >
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={<ActionIcon />}
          onClick={onAction}
          sx={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

export default EmptyState;

