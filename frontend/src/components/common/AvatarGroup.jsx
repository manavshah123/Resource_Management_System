import { Avatar, AvatarGroup as MuiAvatarGroup, Tooltip, Box, Typography } from '@mui/material';

function AvatarGroup({ users = [], max = 4, size = 32, showNames = false, onClick }) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <MuiAvatarGroup
        max={max + 1}
        sx={{
          '& .MuiAvatar-root': {
            width: size,
            height: size,
            fontSize: size * 0.4,
            fontWeight: 600,
            border: '2px solid white',
          },
        }}
      >
        {displayUsers.map((user, index) => (
          <Tooltip key={user.id || index} title={user.name || 'User'}>
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{
                bgcolor: getAvatarColor(index),
              }}
            >
              {getInitials(user.name)}
            </Avatar>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Tooltip title={`${remainingCount} more`}>
            <Avatar
              sx={{
                bgcolor: 'grey.300',
                color: 'grey.700',
              }}
            >
              +{remainingCount}
            </Avatar>
          </Tooltip>
        )}
      </MuiAvatarGroup>
      {showNames && displayUsers.length > 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {displayUsers.map((u) => u.name.split(' ')[0]).join(', ')}
          {remainingCount > 0 && ` +${remainingCount}`}
        </Typography>
      )}
    </Box>
  );
}

// Helper functions
function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(index) {
  const colors = [
    '#06b6d4',
    '#8b5cf6',
    '#f59e0b',
    '#10b981',
    '#ef4444',
    '#3b82f6',
    '#ec4899',
    '#6366f1',
  ];
  return colors[index % colors.length];
}

export default AvatarGroup;

