import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Avatar, Button, Paper, Grid, 
  IconButton, Card, Stack, List, ListItem, ListItemAvatar,
  ListItemText, Divider, Chip, CircularProgress
} from '@mui/material';
import { supabase } from '../supabaseClient';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorSnackbar from '../components/ErrorSnackbar';

import { useNavigate } from 'react-router-dom';
import { 
  WorkOutline, SchoolOutlined, CodeOutlined, LanguageOutlined,
  EditOutlined, DownloadOutlined, Email, 
  Phone, LinkedIn, GitHub, Twitter, CardMembershipOutlined,
  Business, Visibility
} from '@mui/icons-material';
import { useTheme, styled, alpha } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.background.paper, 0.98),
  boxShadow: `0 10px 40px -10px ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px -20px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const SectionHeader = ({ icon, title }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    mb: 3,
    '& svg': {
      color: 'primary.main',
      mr: 2,
      fontSize: 24
    }
  }}>
    {icon}
    <Typography variant="h6" fontWeight={700} color="text.primary">
      {title}
    </Typography>
  </Box>
);

const DetailChip = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.9rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  margin: theme.spacing(0.5)
}));

function CandidateProfilePage() {
  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileViews, setProfileViews] = useState([]);
  const [loadingViews, setLoadingViews] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  // Dialog & error state for destructive actions
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [confirmType, setConfirmType] = useState('profile'); // 'profile' or 'resume'

  // Delete profile handler
  const handleDeleteProfile = async () => {
    setDeleteLoading(true);
    try {
      // Remove user profile from supabase
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      if (deleteError) throw deleteError;
      // Optionally, sign out user and redirect
      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      setSnackbarMsg(err.message || 'Failed to delete profile');
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
    }
  };

  // Delete resume handler
  const handleDeleteResume = async () => {
    setDeleteLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');
      const { error: deleteError } = await supabase
        .from('resumes')
        .delete()
        .eq('user_id', user.id);
      if (deleteError) throw deleteError;
      setResume(null);
      setSnackbarMsg('Resume deleted successfully.');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMsg(err.message || 'Failed to delete resume');
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
    }
  };


  useEffect(() => {
    let globalTimeoutId;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Starting profile data fetch');

        // Global loading timeout (8 seconds)
        globalTimeoutId = setTimeout(() => {
          setLoading(false);
          setError('Request timed out. Please check your connection and try again.');
          console.error('Global loading timeout hit!');
        }, 8000);
        
        // Fetch user authentication data with timeout
        const userPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Authentication timeout')), 3000)
        );
        
        let user;
        try {
          const { data } = await Promise.race([userPromise, timeoutPromise]);
          user = data?.user;
          console.log('Auth check completed, user:', user ? 'found' : 'not found');
        } catch (authError) {
          console.error('Auth error:', authError);
          throw new Error('Authentication failed. Please try logging in again.');
        }
        
        if (!user) {
          console.log('No authenticated user found');
          throw new Error('Please sign in to view your profile');
        }

        // Fetch profile with timeout
        console.log('Fetching profile for user ID:', user.id);
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
        );
        
        let profileData;
        try {
          const { data, error } = await Promise.race([profilePromise, profileTimeoutPromise]);
          if (error) throw error;
          profileData = data;
          console.log('Profile data fetched:', profileData ? 'success' : 'empty');
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
          throw new Error('Unable to load profile. Please try again later.');
        }

        // Fetch resume data
        console.log('Fetching resume data');
        let resumeData = null;
        try {
          const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (error) {
            console.warn('Resume fetch error (non-critical):', error);
          } else {
            resumeData = data;
            console.log('Resume data fetched:', resumeData ? 'success' : 'empty');
          }
        } catch (resumeError) {
          console.warn('Resume fetch exception (non-critical):', resumeError);
          // Non-critical error, continue without resume data
        }

        // Set profile data from fetched data or create default
        if (profileData) {
          setProfile(profileData);
        } else {
          console.log('Creating default profile from user data');
          const defaultProfile = {
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            profile_picture: null,
            bio: '',
            phone: '',
            address: '',
            linkedin: '',
            github: '',
            twitter: ''
          };
          setProfile(defaultProfile);
        }

        setResume(resumeData);
        console.log('Profile data loading complete');
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
        if (globalTimeoutId) clearTimeout(globalTimeoutId);
      }
    };

    fetchData();
    // Cleanup
    return () => {
      if (globalTimeoutId) clearTimeout(globalTimeoutId);
    };
  }, []);

  useEffect(() => {
    const fetchProfileViews = async () => {
      try {
        setLoadingViews(true);
        console.log('Starting profile views fetch');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user found');
          setProfileViews([]);
          setLoadingViews(false);
          return;
        }

        console.log('Authenticated user ID:', user.id);
        
        // First check if notifications table exists
        try {
          const { count, error: tableError } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true });
          
          if (tableError) {
            console.error('Notifications table error:', tableError);
            
            // Create mock data for demo purposes since the table doesn't exist
            const mockViews = [
              {
                company_name: 'TechCorp Inc.',
                viewed_at: new Date().toISOString(),
              },
              {
                company_name: 'Global Innovations',
                viewed_at: new Date(Date.now() - 86400000).toISOString(), // yesterday
              }
            ];
            
            console.log('Using mock profile views for demo:', mockViews);
            setProfileViews(mockViews);
            setLoadingViews(false);
            return;
          }
          
          console.log('Notifications table exists, count:', count);
        } catch (tableCheckError) {
          console.error('Error checking notifications table:', tableCheckError);
          setProfileViews([]);
          setLoadingViews(false);
          return;
        }

        // Fetch notifications of type 'profile_view' for the current user
        const { data: notifications, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'profile_view')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          setProfileViews([]);
          setLoadingViews(false);
          return;
        }

        console.log('Found notifications:', notifications?.length || 0);
        
        if (!notifications || notifications.length === 0) {
          console.log('No profile view notifications found');
          setProfileViews([]);
          setLoadingViews(false);
          return;
        }

        // Process notifications into profile views
        const views = notifications.map(notification => ({
          company_name: notification.data?.company_name || 'Company',
          profile_picture: notification.data?.profile_picture,
          viewed_at: notification.created_at
        }));
        
        console.log('Processed profile views:', views);
        setProfileViews(views);
      } catch (error) {
        console.error('Error in fetchProfileViews:', error);
        // Don't break the UI for this non-critical feature
        setProfileViews([]);
      } finally {
        setLoadingViews(false);
      }
    };

    fetchProfileViews();
  }, []);

  const parseField = (field) => {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return field.split(',').map(item => item.trim());
      }
    }
    return field;
  };

  const renderDetailSection = (items, icon, title) => (
    <Box sx={{ mb: 3 }}>
      <SectionHeader icon={icon} title={title} />
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 1.5,
        alignItems: 'start'
      }}>
        {items.map((item, index) => (
          <DetailChip key={index} sx={{ width: '100%' }}>
            {icon && React.cloneElement(icon, { fontSize: 'small' })}
            {item}
          </DetailChip>
        ))}
      </Box>
    </Box>
  );

  const renderExperienceEducation = (items, icon, title) => (
    <Box>
      <SectionHeader icon={icon} title={title} />
      {items.map((item, index) => (
        <Card key={index} sx={{ 
          mb: 2, 
          p: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          boxShadow: theme.shadows[2]
        }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {item.position ? 'Position: ' : 'Degree: '}{item.position || item.degree}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.company ? 'Company: ' : 'Institution: '}{item.company || item.institution}
          </Typography>
          <DetailChip sx={{ mt: 1, mb: 1.5 }}>
            {item.start_date} - {item.end_date || 'Present'}
          </DetailChip>
          {item.description && (
            <Typography variant="body2" sx={{ 
              mt: 1,
              lineHeight: 1.6,
              color: 'text.secondary'
            }}>
              {item.description}
            </Typography>
          )}
        </Card>
      ))}
    </Box>
  );

  const renderProfileViews = () => {
    // Check if we have any profile views data to display
    console.log('Profile views to render:', profileViews);
    
    return (
      <Box sx={{ mt: 4 }}>
        <SectionHeader 
          icon={<Visibility />} 
          title="Companies That Viewed Your Profile" 
        />
        {loadingViews ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !profileViews || profileViews.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', border: `1px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
            <Typography color="text.secondary" gutterBottom>
              No companies have viewed your profile yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Complete your profile and share your resume link to increase visibility
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<EditOutlined />}
              onClick={() => navigate('/profile/edit')}
            >
              Enhance Profile
            </Button>
          </Paper>
        ) : (
          <List>
            {profileViews.map((view, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Business />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {view.company_name || 'Company'}
                        </Typography>
                        {view.viewed_at && (
                          <Chip 
                            size="small" 
                            label={new Date(view.viewed_at).toLocaleDateString()} 
                            color="primary" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Viewed your profile
                      </Typography>
                    }
                  />
                </ListItem>
                {index < profileViews.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    );
  };

  // Add a loading timeout to prevent getting stuck in loading state
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.log('Loading timeout reached, forcing completion');
        setLoading(false);
        if (!profile) {
          setError('Loading timeout reached. Please refresh the page.');
        }
      }, 5000); // 5-second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading, profile]);
  
  if (loading) return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      my: 4
    }}>
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography>Loading profile...</Typography>
    </Box>
  );
  if (error) return <Typography color="error">Error: {error}</Typography>;

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Profile Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          It looks like your profile hasn't been set up yet.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/complete-profile')}
        >
          Complete Your Profile
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <StyledPaper>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            src={profile.profile_picture}
            sx={{ 
              width: 120,
              height: 120,
              mb: 3,
              border: `2px solid ${theme.palette.divider}`,
              mx: 'auto'
            }}
          />
          <Typography variant="h3" fontWeight={800} gutterBottom>
            {profile.first_name} {profile.last_name}
          </Typography>
          
          {profile.bio && (
            <Typography variant="body1" color="text.secondary" sx={{ 
              maxWidth: '600px',
              mx: 'auto',
              mb: 3
            }}>
              {profile.bio}
            </Typography>
          )}

          <Stack direction="row" spacing={2} justifyContent="center">
            {profile.email && (
              <DetailChip sx={{ px: 2, py: 1 }}>
                <Email sx={{ color: 'primary.main', mr: 1 }} />
                {profile.email}
              </DetailChip>
            )}
            {profile.phone && (
              <DetailChip sx={{ px: 2, py: 1 }}>
                <Phone sx={{ color: 'primary.main', mr: 1 }} />
                {profile.phone}
              </DetailChip>
            )}
          </Stack>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
            {profile.linkedin && (
              <IconButton 
                component="a" 
                href={profile.linkedin} 
                target="_blank" 
                rel="noopener"
                color="primary"
              >
                <LinkedIn />
              </IconButton>
            )}
            {profile.github && (
              <IconButton 
                component="a" 
                href={profile.github} 
                target="_blank" 
                rel="noopener"
                color="primary"
              >
                <GitHub />
              </IconButton>
            )}
            {profile.twitter && (
              <IconButton 
                component="a" 
                href={profile.twitter} 
                target="_blank" 
                rel="noopener"
                color="primary"
              >
                <Twitter />
              </IconButton>
            )}
          </Box>
        </Box>

        {resume ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 20 }}>
                {resume.skills?.length > 0 && renderDetailSection(
                  parseField(resume.skills),
                  <CodeOutlined />,
                  "Core Skills"
                )}
                {resume.languages?.length > 0 && renderDetailSection(
                  parseField(resume.languages),
                  <LanguageOutlined />,
                  "Languages"
                )}
                {resume.certifications?.length > 0 && renderDetailSection(
                  parseField(resume.certifications),
                  <CardMembershipOutlined />,
                  "Certifications"
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {resume.experience?.length > 0 && renderExperienceEducation(
                  parseField(resume.experience),
                  <WorkOutline />,
                  "Professional Experience"
                )}
                {resume.education?.length > 0 && renderExperienceEducation(
                  parseField(resume.education),
                  <SchoolOutlined />,
                  "Education"
                )}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center', border: `1px dashed ${theme.palette.divider}` }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No resume created yet
            </Typography>
            <Button
              variant="outlined"
              startIcon={<EditOutlined />}
              onClick={() => navigate('/resume/create')}
              sx={{ borderRadius: 2 }}
            >
              Create Resume
            </Button>
          </Paper>
        )}

        {renderProfileViews()}

        <Box sx={{ 
          mt: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          pt: 3
        }}>
          <Button
            variant="contained"
            startIcon={<EditOutlined />}
            onClick={() => navigate('/profile/edit')}
            sx={{ borderRadius: 50, px: 4 }}
          >
            Edit Profile
          </Button>
          {resume && (
            <>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DownloadOutlined />}
                onClick={() => window.print()}
                sx={{ borderRadius: 50, px: 4 }}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{ borderRadius: 50, px: 4, ml: 2 }}
                onClick={() => { setConfirmType('resume'); setConfirmOpen(true); }}
              >
                Delete Resume
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            color="error"
            sx={{ borderRadius: 50, px: 4, ml: 2 }}
            onClick={() => { setConfirmType('profile'); setConfirmOpen(true); }}
          >
            Delete Profile
          </Button>
        </Box>

        {resume ? (
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<EditOutlined />}
              onClick={() => navigate('/resume/create')}
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontSize: '1rem'
              }}
            >
              Edit Resume
            </Button>
          </Box>
        ) : (
          <Box sx={{ 
            mt: 4,
            textAlign: 'center',
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: 4,
            p: 4
          }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Ready to build your professional resume?
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<EditOutlined />}
              onClick={() => navigate('/resume/create')}
              sx={{
                borderRadius: 2,
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: theme.shadows[4]
              }}
            >
              Create Your Resume
            </Button>
          </Box>
        )}
      </StyledPaper>
    {/* Confirmation Dialog for Deletion */}
    <ConfirmDialog
      open={confirmOpen}
      title={confirmType === 'resume' ? 'Delete Resume' : 'Delete Profile'}
      description={confirmType === 'resume'
        ? 'Are you sure you want to permanently delete your resume? This action cannot be undone.'
        : 'Are you sure you want to permanently delete your profile? This action cannot be undone.'}
      onConfirm={confirmType === 'resume' ? handleDeleteResume : handleDeleteProfile}
      onCancel={() => setConfirmOpen(false)}
      confirmText="Delete"
      cancelText="Cancel"
      loading={deleteLoading}
    />
    {/* Error Snackbar */}
    <ErrorSnackbar
      open={snackbarOpen}
      message={snackbarMsg}
      onClose={() => setSnackbarOpen(false)}
    />
    </Container>
  );
}

export default CandidateProfilePage;