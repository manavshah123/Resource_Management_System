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
  Tooltip,
} from '@mui/material';
import {
  Palette as BrandingIcon,
  CloudSync as IntegrationIcon,
  Settings as GeneralIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { PageHeader } from '@components/common';
import { settingsApi } from '@api/settingsApi';

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
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
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

  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [brandingRes, zohoRes] = await Promise.all([
        settingsApi.getBranding(),
        settingsApi.getZohoConfig(),
      ]);
      setBranding(brandingRes.data || {});
      setZoho(zohoRes.data || {});
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showSnackbar('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranding = async () => {
    try {
      setSaving(true);
      await settingsApi.updateBranding(branding);
      showSnackbar('Branding settings saved successfully', 'success');
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
                  label="Primary Color"
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: branding.primaryColor }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: branding.secondaryColor }} />
                      </InputAdornment>
                    ),
                  }}
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
                  helperText="Comma-separated list of scopes (e.g., ZohoProjects.portals.READ,ZohoProjects.projects.READ)"
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
                Configure general application behavior and notifications.
              </Typography>
            </Box>

            <Grid container spacing={3}>
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
                          <Switch defaultChecked />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Bench Alerts"
                          secondary="Get notified when employees go on bench"
                        />
                        <ListItemSecondaryAction>
                          <Switch defaultChecked />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Over-allocation Alerts"
                          secondary="Get notified when resources are over-allocated"
                        />
                        <ListItemSecondaryAction>
                          <Switch defaultChecked />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Weekly Reports"
                          secondary="Receive weekly utilization reports"
                        />
                        <ListItemSecondaryAction>
                          <Switch defaultChecked />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      System
                    </Typography>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Maintenance mode will make the system read-only for all users except admins.
                    </Alert>
                    <FormControlLabel
                      control={<Switch color="warning" />}
                      label="Maintenance Mode"
                    />
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Allocation Settings
                    </Typography>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Auto Deallocation after project end"
                    />
                    <TextField
                      fullWidth
                      label="Days before end date to notify"
                      type="number"
                      defaultValue={7}
                      size="small"
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button variant="outlined">Cancel</Button>
                  <Button variant="contained" startIcon={<SaveIcon />}>
                    Save Settings
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
