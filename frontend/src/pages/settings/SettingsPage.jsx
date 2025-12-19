import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  alpha,
} from '@mui/material';
import {
  Palette as BrandingIcon,
  CloudSync as IntegrationIcon,
  Settings as GeneralIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Check as CheckMarkIcon,
} from '@mui/icons-material';
import { PageHeader } from '@components/common';
import { settingsApi } from '@api/settingsApi';
import { useBranding } from '../../context/BrandingContext';
import { themePresets } from '../../themes/themePresets';

// Theme Card Component
function ThemeCard({ theme, isSelected, onSelect }) {
  return (
    <Paper
      elevation={isSelected ? 8 : 1}
      onClick={() => onSelect(theme.id)}
      sx={{
        p: 2,
        cursor: 'pointer',
        position: 'relative',
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 4,
        },
      }}
    >
      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 2,
          }}
        >
          <CheckMarkIcon sx={{ color: 'white', fontSize: 16 }} />
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
        {theme.preview.map((color, index) => (
          <Box
            key={index}
            sx={{
              width: index === 0 ? 40 : 24,
              height: 24,
              borderRadius: 1,
              bgcolor: color,
              border: '1px solid',
              borderColor: alpha('#000', 0.1),
            }}
          />
        ))}
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {theme.name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {theme.description}
      </Typography>
    </Paper>
  );
}

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Branding state
  const [branding, setBranding] = useState({
    appName: '',
    appLogo: '',
    appFavicon: '',
    themeId: 'default',
    companyName: '',
    supportEmail: '',
    copyrightText: '',
  });

  // Zoho state
  const [zoho, setZoho] = useState({
    enabled: false,
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    authUrl: '',
    tokenUrl: '',
    apiBaseUrl: '',
    peopleApiBaseUrl: '',
    scopes: '',
  });

  // General settings state
  const [general, setGeneral] = useState({
    notifications: {
      emailNotificationsEnabled: true,
      benchAlertsEnabled: true,
      overallocationAlertsEnabled: true,
      weeklyReportsEnabled: true,
      notificationEmailRecipients: '',
    },
    system: {
      maintenanceMode: false,
      sessionTimeout: 30,
      defaultPageSize: 10,
    },
    allocation: {
      autoDeallocationEnabled: true,
      deallocationNotifyDays: 7,
      maxAllocationPercentage: 100,
      minAllocationPercentage: 10,
    },
  });

  const [showSecret, setShowSecret] = useState(false);
  const { refreshBranding, setTheme: applyThemePreview } = useBranding();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [brandingRes, zohoRes, generalRes] = await Promise.all([
        settingsApi.getBranding(),
        settingsApi.getZohoConfig(),
        settingsApi.getGeneralConfig(),
      ]);
      setBranding(brandingRes.data || {});
      setZoho(zohoRes.data || {});
      if (generalRes.data) {
        setGeneral({
          notifications: generalRes.data.notifications || general.notifications,
          system: generalRes.data.system || general.system,
          allocation: generalRes.data.allocation || general.allocation,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showSnackbar('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (themeId) => {
    setBranding({ ...branding, themeId });
    applyThemePreview(themeId);
  };

  const handleSaveBranding = async () => {
    try {
      setSaving(true);
      await settingsApi.updateBranding(branding);
      await refreshBranding();
      showSnackbar('Branding settings saved and applied!', 'success');
    } catch (error) {
      console.error('Failed to save branding:', error);
      showSnackbar('Failed to save branding settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveZoho = async () => {
    try {
      setSaving(true);
      await settingsApi.updateZohoConfig(zoho);
      showSnackbar('Zoho configuration saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save Zoho config:', error);
      showSnackbar('Failed to save Zoho configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      setSaving(true);
      await settingsApi.updateGeneralConfig(general);
      showSnackbar('General settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save general settings:', error);
      showSnackbar('Failed to save general settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Helper functions to update nested state
  const updateNotification = (key, value) => {
    setGeneral({
      ...general,
      notifications: { ...general.notifications, [key]: value },
    });
  };

  const updateSystem = (key, value) => {
    setGeneral({
      ...general,
      system: { ...general.system, [key]: value },
    });
  };

  const updateAllocation = (key, value) => {
    setGeneral({
      ...general,
      allocation: { ...general.allocation, [key]: value },
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Configure application settings, branding, and integrations"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Settings' },
        ]}
        primaryAction={false}
      />

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: 2 }}>
            <Tab icon={<BrandingIcon />} iconPosition="start" label="Branding" />
            <Tab icon={<IntegrationIcon />} iconPosition="start" label="Zoho Integration" />
            <Tab icon={<GeneralIcon />} iconPosition="start" label="General" />
          </Tabs>
        </Box>

        {/* Branding Tab */}
        {tabValue === 0 && (
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                White Label Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customize the application appearance and branding to match your organization.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Application Name"
                  value={branding.appName}
                  onChange={(e) => setBranding({ ...branding, appName: e.target.value })}
                  helperText="Displayed in browser tab and header"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={branding.companyName}
                  onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                  helperText="Your organization name"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  value={branding.appLogo}
                  onChange={(e) => setBranding({ ...branding, appLogo: e.target.value })}
                  helperText="URL to your company logo"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Favicon URL"
                  value={branding.appFavicon}
                  onChange={(e) => setBranding({ ...branding, appFavicon: e.target.value })}
                  helperText="URL to browser tab icon"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Support Email"
                  type="email"
                  value={branding.supportEmail}
                  onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                  helperText="Contact email for support"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Copyright Text"
                  value={branding.copyrightText}
                  onChange={(e) => setBranding({ ...branding, copyrightText: e.target.value })}
                  helperText="Footer copyright text"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Application Theme
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Select a color theme for your application. Changes are previewed immediately.
                </Typography>

                <Grid container spacing={2}>
                  {themePresets.map((theme) => (
                    <Grid item xs={6} sm={4} md={3} lg={2.4} key={theme.id}>
                      <ThemeCard
                        theme={theme}
                        isSelected={branding.themeId === theme.id}
                        onSelect={handleThemeSelect}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchSettings}>
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveBranding}
                    disabled={saving}
                  >
                    Save Branding
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* Zoho Integration Tab */}
        {tabValue === 1 && (
          <CardContent>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Zoho Integration Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure your Zoho API credentials to enable project and timesheet sync.
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={zoho.enabled}
                    onChange={(e) => setZoho({ ...zoho, enabled: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Chip
                    label={zoho.enabled ? 'Enabled' : 'Disabled'}
                    color={zoho.enabled ? 'success' : 'default'}
                    size="small"
                  />
                }
              />
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>How to get Zoho credentials:</strong>
              </Typography>
              <ol style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>Go to <a href="https://api-console.zoho.com" target="_blank" rel="noopener noreferrer">Zoho API Console</a></li>
                <li>Create a new Server-based Application</li>
                <li>Add the Redirect URI below to your Zoho app</li>
                <li>Copy the Client ID and Client Secret</li>
                <li>Add required scopes for Projects and People APIs</li>
              </ol>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Client ID"
                  value={zoho.clientId}
                  onChange={(e) => setZoho({ ...zoho, clientId: e.target.value })}
                  helperText="From Zoho API Console"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Client Secret"
                  type={showSecret ? 'text' : 'password'}
                  value={zoho.clientSecret}
                  onChange={(e) => setZoho({ ...zoho, clientSecret: e.target.value })}
                  helperText="From Zoho API Console (leave empty to keep existing)"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowSecret(!showSecret)} edge="end">
                          {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Redirect URI"
                  value={zoho.redirectUri}
                  onChange={(e) => setZoho({ ...zoho, redirectUri: e.target.value })}
                  helperText="OAuth callback URL (add this to Zoho API Console)"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="OAuth Scopes"
                  value={zoho.scopes}
                  onChange={(e) => setZoho({ ...zoho, scopes: e.target.value })}
                  helperText="Comma-separated list of scopes"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Advanced Settings (usually no changes needed)
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Auth URL"
                  value={zoho.authUrl}
                  onChange={(e) => setZoho({ ...zoho, authUrl: e.target.value })}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Token URL"
                  value={zoho.tokenUrl}
                  onChange={(e) => setZoho({ ...zoho, tokenUrl: e.target.value })}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Projects API Base URL"
                  value={zoho.apiBaseUrl}
                  onChange={(e) => setZoho({ ...zoho, apiBaseUrl: e.target.value })}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="People API Base URL"
                  value={zoho.peopleApiBaseUrl}
                  onChange={(e) => setZoho({ ...zoho, peopleApiBaseUrl: e.target.value })}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchSettings}>
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveZoho}
                    disabled={saving}
                  >
                    Save Zoho Configuration
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* General Settings Tab */}
        {tabValue === 2 && (
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                General Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure general application behavior, notifications, and allocation rules.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* Notifications Section */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Notifications
                    </Typography>
                    <List disablePadding>
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Email Notifications"
                          secondary="Receive important updates via email"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={general.notifications.emailNotificationsEnabled}
                            onChange={(e) => updateNotification('emailNotificationsEnabled', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Bench Alerts"
                          secondary="Get notified when employees go on bench"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={general.notifications.benchAlertsEnabled}
                            onChange={(e) => updateNotification('benchAlertsEnabled', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Over-allocation Alerts"
                          secondary="Get notified when resources are over-allocated"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={general.notifications.overallocationAlertsEnabled}
                            onChange={(e) => updateNotification('overallocationAlertsEnabled', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Weekly Reports"
                          secondary="Receive weekly utilization reports"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={general.notifications.weeklyReportsEnabled}
                            onChange={(e) => updateNotification('weeklyReportsEnabled', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                    <TextField
                      fullWidth
                      label="Notification Recipients"
                      value={general.notifications.notificationEmailRecipients}
                      onChange={(e) => updateNotification('notificationEmailRecipients', e.target.value)}
                      helperText="Comma-separated email addresses"
                      size="small"
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* System & Allocation Section */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      System
                    </Typography>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Maintenance mode will make the system read-only for all users except admins.
                    </Alert>
                    <FormControlLabel
                      control={
                        <Switch
                          color="warning"
                          checked={general.system.maintenanceMode}
                          onChange={(e) => updateSystem('maintenanceMode', e.target.checked)}
                        />
                      }
                      label="Maintenance Mode"
                    />
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Session Timeout (min)"
                          type="number"
                          value={general.system.sessionTimeout}
                          onChange={(e) => updateSystem('sessionTimeout', parseInt(e.target.value) || 30)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Default Page Size"
                          type="number"
                          value={general.system.defaultPageSize}
                          onChange={(e) => updateSystem('defaultPageSize', parseInt(e.target.value) || 10)}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Allocation Settings
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={general.allocation.autoDeallocationEnabled}
                          onChange={(e) => updateAllocation('autoDeallocationEnabled', e.target.checked)}
                        />
                      }
                      label="Auto Deallocation after project end"
                    />
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Days before end date to notify"
                          type="number"
                          value={general.allocation.deallocationNotifyDays}
                          onChange={(e) => updateAllocation('deallocationNotifyDays', parseInt(e.target.value) || 7)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Max Allocation %"
                          type="number"
                          value={general.allocation.maxAllocationPercentage}
                          onChange={(e) => updateAllocation('maxAllocationPercentage', parseInt(e.target.value) || 100)}
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Min Allocation %"
                          type="number"
                          value={general.allocation.minAllocationPercentage}
                          onChange={(e) => updateAllocation('minAllocationPercentage', parseInt(e.target.value) || 10)}
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchSettings}>
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveGeneral}
                    disabled={saving}
                  >
                    Save General Settings
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SettingsPage;
