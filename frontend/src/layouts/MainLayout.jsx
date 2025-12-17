import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Snackbar, Alert } from '@mui/material';
import Sidebar from '@components/navigation/Sidebar';
import Topbar from '@components/navigation/Topbar';
import { useUIStore } from '@store/uiStore';

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 80;

function MainLayout() {
  const { sidebarCollapsed, snackbar, hideSnackbar } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Sidebar
        drawerWidth={sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { sm: `calc(100% - ${sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)` },
          ml: { sm: `${sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px` },
          transition: 'margin 0.3s ease, width 0.3s ease',
        }}
      >
        {/* Topbar */}
        <Topbar onMenuClick={handleDrawerToggle} />

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            mt: '64px',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={hideSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MainLayout;

