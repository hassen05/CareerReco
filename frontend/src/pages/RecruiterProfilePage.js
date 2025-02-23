import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Avatar, 
  Button,
  Paper,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Business, Email, Phone, EditOutlined } from '@mui/icons-material';

function RecruiterProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        const { data, error } = await supabase
          .from('recruiter_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <Typography>Loading profile...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={profile.profile_picture}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  margin: '0 auto'
                }}
              />
              <Typography variant="h6">{profile.company}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Company Information
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {profile.company_description || 'No description provided'}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography>
                  <Email sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {profile.email}
                </Typography>
                {profile.phone && (
                  <Typography>
                    <Phone sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {profile.phone}
                  </Typography>
                )}
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<EditOutlined />}
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default RecruiterProfilePage; 