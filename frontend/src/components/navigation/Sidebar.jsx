import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  FolderOpen as ProjectsIcon,
  Psychology as SkillsIcon,
  Assignment as AllocationsIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  School as TrainingIcon,
  Quiz as QuizIcon,
  TrendingUp as ForecastingIcon,
  AdminPanelSettings as UsersIcon,
  TrendingDown as SkillGapIcon,
  CloudSync as IntegrationsIcon,
} from '@mui/icons-material';
import { useUIStore } from '@store/uiStore';
import { useAuthStore } from '@store/authStore';
import { useBranding } from '../../context/BrandingContext';

const menuItems = [
  { title: 'Dashboard', icon: DashboardIcon, path: '/dashboard', roles: ['ADMIN', 'PM', 'HR', 'EMPLOYEE'], permission: 'DASHBOARD_VIEW' },
  { title: 'Employees', icon: PeopleIcon, path: '/employees', roles: ['ADMIN', 'PM', 'HR', 'EMPLOYEE'], permission: 'EMPLOYEE_VIEW' },
  { title: 'Projects', icon: ProjectsIcon, path: '/projects', roles: ['ADMIN', 'PM', 'HR', 'EMPLOYEE'], permission: 'PROJECT_VIEW' },
  { title: 'Skills', icon: SkillsIcon, path: '/skills', roles: ['ADMIN', 'HR', 'EMPLOYEE'], permission: 'SKILL_VIEW' },
  { title: 'Allocations', icon: AllocationsIcon, path: '/allocations', roles: ['ADMIN', 'PM'], permission: 'ALLOCATION_VIEW' },
  { title: 'Training', icon: TrainingIcon, path: '/training', roles: ['ADMIN', 'HR', 'PM', 'EMPLOYEE'], permission: 'TRAINING_VIEW' },
  { title: 'Quizzes', icon: QuizIcon, path: '/quizzes', roles: ['ADMIN', 'HR', 'PM', 'EMPLOYEE'], permission: 'TRAINING_VIEW' },
  { title: 'Forecasting', icon: ForecastingIcon, path: '/forecasting', roles: ['ADMIN', 'PM', 'HR'], permission: 'FORECASTING_VIEW' },
  { title: 'Skill Gap', icon: SkillGapIcon, path: '/skill-gap', roles: ['ADMIN', 'PM', 'HR'], permission: 'SKILL_GAP_VIEW' },
  { title: 'Users', icon: UsersIcon, path: '/users', roles: ['ADMIN'], permission: 'USER_MANAGE' },
  { title: 'Reports', icon: ReportsIcon, path: '/reports', roles: ['ADMIN', 'PM', 'HR'], permission: 'REPORT_VIEW' },
  { title: 'Zoho Sync', icon: IntegrationsIcon, path: '/integrations/zoho', roles: ['ADMIN', 'PM'], permission: 'INTEGRATION_VIEW' },
];

const bottomMenuItems = [
  { title: 'Settings', icon: SettingsIcon, path: '/settings', roles: ['ADMIN'] },
];

function Sidebar({ drawerWidth, mobileOpen, onClose }) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const { hasAnyRole, hasPermission, user } = useAuthStore();
  const { branding } = useBranding();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Get user roles as array (handle both array and Set from backend)
  const getUserRoles = () => {
    if (!user?.roles) return [];
    return Array.isArray(user.roles) ? user.roles : Array.from(user.roles);
  };

  const userRoles = getUserRoles();

  // Filter menu items based on roles
  const filteredMenuItems = menuItems.filter((item) => {
    if (!user) return false;
    
    // Check if user has any of the required roles
    const hasRole = item.roles.some(role => userRoles.includes(role));
    return hasRole;
  });

  const filteredBottomItems = bottomMenuItems.filter((item) => {
    if (!user) return false;
    const hasRole = item.roles.some(role => userRoles.includes(role));
    return hasRole;
  });

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'var(--sidebar-bg, #0f172a)',
        color: 'var(--sidebar-text, #ffffff)',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
          minHeight: 64,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {branding.appLogo ? (
            <Box
              component="img"
              src={branding.appLogo}
              alt={branding.appName}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'var(--primary-color, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                {(branding.appName || 'RMP').charAt(0)}
              </Typography>
            </Box>
          )}
          {!sidebarCollapsed && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'var(--primary-color, #3b82f6)',
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {branding.appName || 'RMP'}
            </Typography>
          )}
        </Box>
        {!isMobile && !sidebarCollapsed && (
          <IconButton
            onClick={toggleSidebarCollapse}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* Collapsed expand button */}
      {sidebarCollapsed && !isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <IconButton
            onClick={toggleSidebarCollapse}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, py: 2, overflow: 'auto' }}>
        <List sx={{ px: sidebarCollapsed ? 1 : 2 }}>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={sidebarCollapsed ? item.title : ''} placement="right">
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    px: sidebarCollapsed ? 1.5 : 2,
                    bgcolor: isActive(item.path) ? 'var(--primary-color-light, rgba(59, 130, 246, 0.15))' : 'transparent',
                    borderLeft: isActive(item.path) ? '3px solid var(--primary-color, #3b82f6)' : '3px solid transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: sidebarCollapsed ? 0 : 2,
                      justifyContent: 'center',
                      color: isActive(item.path) ? 'var(--primary-color, #3b82f6)' : 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    <item.icon />
                  </ListItemIcon>
                  {!sidebarCollapsed && (
                    <ListItemText
                      primary={item.title}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem',
                          fontWeight: isActive(item.path) ? 600 : 400,
                          color: isActive(item.path) ? 'var(--primary-color, #3b82f6)' : 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom Navigation */}
      {filteredBottomItems.length > 0 && (
        <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <List sx={{ px: sidebarCollapsed ? 1 : 2, py: 1 }}>
            {filteredBottomItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <Tooltip title={sidebarCollapsed ? item.title : ''} placement="right">
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      minHeight: 48,
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      px: sidebarCollapsed ? 1.5 : 2,
                      bgcolor: isActive(item.path) ? 'var(--primary-color-light, rgba(59, 130, 246, 0.15))' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: sidebarCollapsed ? 0 : 2,
                        justifyContent: 'center',
                        color: isActive(item.path) ? 'var(--primary-color, #3b82f6)' : 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      <item.icon />
                    </ListItemIcon>
                    {!sidebarCollapsed && (
                      <ListItemText
                        primary={item.title}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '0.9rem',
                            fontWeight: isActive(item.path) ? 600 : 400,
                            color: isActive(item.path) ? 'var(--primary-color, #3b82f6)' : 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Sidebar;
