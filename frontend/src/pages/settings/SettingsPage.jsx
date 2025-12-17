import { useState } from 'react';
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
} from '@mui/material';
import { PageHeader } from '@components/common';
import { useUIStore } from '@store/uiStore';

function SettingsPage() {
  const { showSnackbar } = useUIStore();
  const [settings, setSettings] = useState({
    companyName: 'Resource Management Portal',
    adminEmail: 'admin@rmp.com',
    emailNotifications: true,
    slackIntegration: false,
    autoDeallocation: true,
    deallocationDays: 7,
    benchAlerts: true,
    overallocationAlerts: true,
    weeklyReports: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    showSnackbar('Settings saved successfully', 'success');
  };

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Configure system settings"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Settings' },
        ]}
        primaryAction={false}
      />

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                General Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Company Name"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Admin Email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
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
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        setSettings({ ...settings, emailNotifications: e.target.checked })
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem disableGutters>
                  <ListItemText
                    primary="Slack Integration"
                    secondary="Send notifications to Slack channel"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.slackIntegration}
                      onChange={(e) =>
                        setSettings({ ...settings, slackIntegration: e.target.checked })
                      }
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
                      checked={settings.benchAlerts}
                      onChange={(e) =>
                        setSettings({ ...settings, benchAlerts: e.target.checked })
                      }
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
                      checked={settings.overallocationAlerts}
                      onChange={(e) =>
                        setSettings({ ...settings, overallocationAlerts: e.target.checked })
                      }
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
                      checked={settings.weeklyReports}
                      onChange={(e) =>
                        setSettings({ ...settings, weeklyReports: e.target.checked })
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Allocation Settings */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Allocation Settings
              </Typography>
              <List disablePadding>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Auto Deallocation"
                    secondary="Automatically deallocate resources after project end date"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.autoDeallocation}
                      onChange={(e) =>
                        setSettings({ ...settings, autoDeallocation: e.target.checked })
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              {settings.autoDeallocation && (
                <TextField
                  label="Days before end date to notify"
                  type="number"
                  value={settings.deallocationDays}
                  onChange={(e) =>
                    setSettings({ ...settings, deallocationDays: parseInt(e.target.value) })
                  }
                  fullWidth
                  sx={{ mt: 2 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                System
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Maintenance mode will make the system read-only for all users except admins.
              </Alert>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      setSettings({ ...settings, maintenanceMode: e.target.checked })
                    }
                    color="warning"
                  />
                }
                label="Maintenance Mode"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined">Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SettingsPage;

