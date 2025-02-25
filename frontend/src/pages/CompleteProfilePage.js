import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Avatar,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { PhotoCamera } from '@mui/icons-material';

function CompleteProfilePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    profilePicture: null,
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserRole(user.user_metadata?.role || 'candidate');
      }
    };
    getUserRole();
  }, []);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, profilePicture: publicUrl }));
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not found');

      // Determine which table to update based on user role
      const tableName = userRole === 'recruiter' ? 'recruiter_profiles' : 'profiles';
      const profileData = {
        id: user.id,
        email: user.email,
        profile_picture: formData.profilePicture
      };

      // Add company field for recruiters
      if (userRole === 'recruiter') {
        profileData.company = formData.company;
      } else {
        // For candidates, keep first and last name
        profileData.first_name = formData.firstName;
        profileData.last_name = formData.lastName;
      }

      const { error } = await supabase
        .from(tableName)
        .upsert(profileData);

      if (error) throw error;

      navigate('/profile');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Let's Get to Know You Better
      </Typography>

      {step === 1 && (
        <Box component="form" sx={{ mt: 4 }}>
          {userRole === 'recruiter' ? (
            <TextField
              fullWidth
              label="Company Name"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              margin="normal"
              required
            />
          ) : (
            <>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                margin="normal"
                required
              />
            </>
          )}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={handleNext}
            disabled={
              userRole === 'recruiter' 
                ? !formData.company 
                : !formData.firstName || !formData.lastName
            }
          >
            Continue
          </Button>
        </Box>
      )}

      {step === 2 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Add a Profile Picture
          </Typography>
          <label htmlFor="avatar-upload">
            <Avatar
              src={formData.profilePicture}
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 2,
                cursor: 'pointer',
                margin: '0 auto'
              }}
            />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          {uploading && <Typography>Uploading...</Typography>}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            Skip and Complete
          </Button>
        </Box>
      )}

      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
    </Container>
  );
}

export default CompleteProfilePage; 