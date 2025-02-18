import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Avatar, Button } from '@mui/material';
import { supabase } from '../supabaseClient';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

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

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => ({ ...prev, profile_picture: publicUrl }));
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch profile from Supabase
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          setProfile({
            id: user.id,
            email: user.email,
            ...profile
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

  if (loading) {
    return <Typography>Loading profile...</Typography>;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" align="center">
          Profile not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label htmlFor="avatar-upload">
          <Avatar
            src={profile?.profile_picture}
            sx={{ 
              width: 120, 
              height: 120, 
              mb: 2,
              cursor: 'pointer',
              transition: 'opacity 0.3s',
              '&:hover': {
                opacity: 0.8
              }
            }}
          />
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          disabled={uploading}
        />
        {uploading && <Typography>Uploading...</Typography>}
        <Typography variant="h4" gutterBottom>
          {profile.first_name || 'New User'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {profile.email}
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 3 }}
          onClick={() => navigate('/profile/edit')}
        >
          Complete Your Profile
        </Button>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }}
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </Button>
      </Box>
    </Container>
  );
}

export default ProfilePage; 