import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, TextField, Button, Paper, 
  CircularProgress, Alert, Avatar, IconButton, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, Save, ArrowBack } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function EditProfilePage() {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    profile_picture: '',
    bio: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    visibility: 'public'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          setProfile({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            phone: profile.phone || '',
            profile_picture: profile.profile_picture || '',
            bio: profile.bio || '',
            website: profile.website || '',
            linkedin: profile.linkedin || '',
            github: profile.github || '',
            twitter: profile.twitter || '',
            visibility: profile.visibility || 'public'
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update local state
      setProfile(prev => ({ ...prev, profile_picture: publicUrl }));
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
            profile_picture: profile.profile_picture,
            bio: profile.bio,
            website: profile.website,
            linkedin: profile.linkedin,
            github: profile.github,
            twitter: profile.twitter,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;

        navigate('/profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profile')}
          sx={{ mb: 2 }}
        >
          Back to Profile
        </Button>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Edit Profile
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ 
        p: 4,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          maxWidth: 600,
          mx: 'auto'
        }}>
          {/* Avatar Section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2,
            mb: 3
          }}>
            <Avatar
              src={profile.profile_picture}
              sx={{ 
                width: 120,
                height: 120,
                border: `2px solid ${theme.palette.divider}`
              }}
            />
            <Button
              component="label"
              variant="outlined"
              startIcon={<EditOutlined />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Change Photo'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileUpload}
              />
            </Button>
          </Box>

          {/* Name Fields */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            />
          </Box>

          {/* Phone Number */}
          <TextField
            fullWidth
            label="Phone Number"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />

          {/* Bio */}
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={4}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            sx={{ mb: 3 }}
          />

          {/* Website */}
          <TextField
            fullWidth
            label="Website"
            value={profile.website}
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            sx={{ mb: 3 }}
          />

          {/* LinkedIn */}
          <TextField
            fullWidth
            label="LinkedIn"
            value={profile.linkedin}
            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
            sx={{ mb: 3 }}
          />

          {/* GitHub */}
          <TextField
            fullWidth
            label="GitHub"
            value={profile.github}
            onChange={(e) => setProfile({ ...profile, github: e.target.value })}
            sx={{ mb: 3 }}
          />

          {/* Twitter */}
          <TextField
            fullWidth
            label="Twitter"
            value={profile.twitter}
            onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
            sx={{ mb: 3 }}
          />

          {/* Save Button */}
          <Box sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditProfilePage; 