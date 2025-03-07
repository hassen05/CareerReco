import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Avatar,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { PhotoCamera, CheckCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '0 auto',
  cursor: 'pointer',
  border: `3px solid ${theme.palette.primary.main}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 0 0 4px ${theme.palette.primary.light}30`
  }
}));

function CompleteProfilePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    company: '',
    jobTitle: '',
    profilePicture: null
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  
  // Define steps based on user role
  const candidateSteps = ['Basic Information', 'Add a Profile Picture', 'Complete'];
  const recruiterSteps = ['Company Information', 'Add a Profile Picture', 'Complete'];

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        setInitialLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        setUserId(user.id);
        setUserRole(user.user_metadata?.role || 'candidate');
        
        // Try to fetch existing profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          // Pre-fill form with existing data
          setFormData({
            firstName: profile.first_name || user.user_metadata?.first_name || '',
            lastName: profile.last_name || user.user_metadata?.last_name || '',
            phone: profile.phone || '',
            bio: profile.bio || '',
            company: profile.company || '',
            jobTitle: profile.job_title || '',
            profilePicture: profile.profile_picture || null
          });
        } else if (user.user_metadata) {
          // Pre-fill from auth metadata if available
          setFormData(prev => ({
            ...prev,
            firstName: user.user_metadata.first_name || '',
            lastName: user.user_metadata.last_name || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError('Failed to load user information');
      } finally {
        setInitialLoading(false);
      }
    };
    
    getUserInfo();
  }, [navigate]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    if (activeStep === getSteps().length - 2) {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getSteps = () => {
    return userRole === 'recruiter' ? recruiterSteps : candidateSteps;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    
    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const fileName = `${userId}_${timestamp}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true // Overwrite if exists
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, profilePicture: publicUrl }));
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userId) throw new Error('User not found');

      // Prepare profile data based on user role
      const profileData = {
        id: userId,
        profile_picture: formData.profilePicture,
        phone: formData.phone,
        bio: formData.bio,
        updated_at: new Date().toISOString()
      };

      // Add role-specific fields
      if (userRole === 'recruiter') {
        profileData.company = formData.company;
        profileData.job_title = formData.jobTitle;
      } else {
        profileData.first_name = formData.firstName;
        profileData.last_name = formData.lastName;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      setSuccess(true);
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(`Failed to update profile: ${error.message}`);
      setActiveStep(0); // Go back to first step on error
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step) => {
    if (userRole === 'recruiter') {
      if (step === 0) {
        return formData.company.trim() !== '' && formData.jobTitle.trim() !== '';
      }
    } else {
      if (step === 0) {
        return formData.firstName.trim() !== '' && formData.lastName.trim() !== '';
      }
    }
    return true;
  };

  if (initialLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Complete Your Profile
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {getSteps().map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Profile Completed Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Redirecting you to your profile...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Step 1: Basic Information */}
            {activeStep === 0 && (
              <Box sx={{ mt: 2 }}>
                {userRole === 'recruiter' ? (
                  // Recruiter form fields
                  <>
                    <TextField
                      fullWidth
                      label="Company Name"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Job Title"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      margin="normal"
                      required
                    />
                  </>
                ) : (
                  // Candidate form fields
                  <>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
                    </Box>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      margin="normal"
                    />
                  </>
                )}
                
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  margin="normal"
                  placeholder="Tell us a bit about yourself..."
                />
              </Box>
            )}
            
            {/* Step 2: Profile Picture */}
            {activeStep === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Add a Profile Picture
                </Typography>
                
                <label htmlFor="avatar-upload">
                  <ProfileAvatar src={formData.profilePicture || '/avatar-placeholder.png'} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
                
                <Typography align="center" variant="body2" color="text.secondary">
                  Click on the avatar to upload or change your picture
                </Typography>
                
                {uploading && <CircularProgress size={24} />}
              </Box>
            )}
            
            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep) || loading || uploading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : activeStep === getSteps().length - 2 ? (
                  'Complete Profile'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default CompleteProfilePage; 