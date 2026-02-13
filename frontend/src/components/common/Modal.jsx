import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  loading = false,
  showCloseButton = true,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmColor = 'primary',
  confirmDisabled = false,
  hideActions = false,
  contentSx = {},
  ...props
}) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
        },
      }}
      {...props}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 3, overflowY: 'auto', ...contentSx }}>
        {children}
      </DialogContent>

      {/* Actions */}
      {!hideActions && (
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1,
          }}
        >
          {actions || (
            <>
              <Button
                onClick={handleCancel}
                color="inherit"
                disabled={loading}
                sx={{ px: 3 }}
              >
                {cancelText}
              </Button>
              {onConfirm && (
                <Button
                  onClick={onConfirm}
                  variant="contained"
                  color={confirmColor}
                  disabled={loading || confirmDisabled}
                  sx={{ px: 3, minWidth: 100 }}
                >
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    confirmText
                  )}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}

// Confirm Dialog Component
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      onConfirm={onConfirm}
      confirmText={confirmText}
      cancelText={cancelText}
      confirmColor={confirmColor}
      loading={loading}
    >
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Modal>
  );
}

export default Modal;

