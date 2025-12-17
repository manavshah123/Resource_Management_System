import { Chip } from '@mui/material';

const statusConfig = {
  // Employee statuses
  ACTIVE: { label: 'Active', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  INACTIVE: { label: 'Inactive', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
  ON_LEAVE: { label: 'On Leave', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  TERMINATED: { label: 'Terminated', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },

  // Project statuses
  NOT_STARTED: { label: 'Not Started', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
  IN_PROGRESS: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  ON_HOLD: { label: 'On Hold', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  COMPLETED: { label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },

  // Priority levels
  LOW: { label: 'Low', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  HIGH: { label: 'High', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  CRITICAL: { label: 'Critical', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.15)' },

  // Skill levels
  BEGINNER: { label: 'Beginner', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
  INTERMEDIATE: { label: 'Intermediate', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  ADVANCED: { label: 'Advanced', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  EXPERT: { label: 'Expert', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },

  // Allocation status
  ALLOCATED: { label: 'Allocated', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  BENCH: { label: 'Bench', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  PARTIAL: { label: 'Partial', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  OVERALLOCATED: { label: 'Over-allocated', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
};

function StatusChip({ status, size = 'small', variant = 'filled', customConfig, ...props }) {
  const config = customConfig || statusConfig[status] || {
    label: status,
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.1)',
  };

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        bgcolor: variant === 'filled' ? config.bg : 'transparent',
        color: config.color,
        border: variant === 'outlined' ? `1px solid ${config.color}` : 'none',
        fontWeight: 600,
        fontSize: '0.75rem',
        letterSpacing: '0.3px',
        ...props.sx,
      }}
      {...props}
    />
  );
}

export default StatusChip;
export { statusConfig };

