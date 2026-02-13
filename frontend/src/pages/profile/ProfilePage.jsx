import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import { PageHeader, StatusChip } from '@components/common';
import { useAuthStore } from '@store/authStore';
import { useUIStore } from '@store/uiStore';

function ProfilePage() {
  const { user } = useAuthStore();
  const { showSnackbar } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || 'John Admin',
    email: user?.email || 'admin@rmp.com',
    phone: '+1 (555) 123-4567',
    department: 'Administration',
    designation: 'System Administrator',
    location: 'San Francisco, CA',
  });

  const handleSave = () => {
    setIsEditing(false);
    showSnackbar('Profile updated successfully', 'success');
  };

  return (
    <Box>
      <PageHeader
        title="My Profile"
        subtitle="Manage your account settings"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Profile' },
        ]}
        primaryAction={false}
      />

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <Avatar
                  src={user?.avatar}
                  alt={profile.name}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                  }}
                >
                  {profile.name?.charAt(0)}
                </Avatar>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    minWidth: 36,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    p: 0,
                  }}
                >
                  <CameraIcon fontSize="small" />
                </Button>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {profile.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {profile.designation}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                {user?.roles?.map((role) => (
                  <Chip
                    key={role}
                    label={role}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                )) || <Chip label="ADMIN" size="small" color="primary" />}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Profile Information
                </Typography>
                {!isEditing ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>
                      Save
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    fullWidth
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    fullWidth
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Department"
                    value={profile.department}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Designation"
                    value={profile.designation}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    fullWidth
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Change Password
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Current Password"
                    type="password"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained">Update Password</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePage;

