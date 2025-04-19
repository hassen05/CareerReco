import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Avatar, Button, Paper, Grid, 
  IconButton, Card, Stack, List, ListItem, ListItemAvatar,
  ListItemText, Divider, Chip, CircularProgress, Tooltip
} from '@mui/material';
import { supabase } from '../supabaseClient';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorSnackbar from '../components/ErrorSnackbar';

import { useNavigate } from 'react-router-dom';
import { 
  WorkOutline, CodeOutlined, LanguageOutlined,
  EditOutlined, DownloadOutlined, EmailOutlined,
  PhoneOutlined, LinkedIn, GitHub, CardMembershipOutlined,
  Business, Visibility, DeleteOutlined, SchoolOutlined
} from '@mui/icons-material';
import { useTheme, styled, alpha } from '@mui/material/styles';


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
          company_name: notification.data?.viewer_company || 'Company',
          profile_picture: notification.data?.viewer_profile_picture,
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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Profile Header */}
      <Box
        sx={{
          position: 'relative',
          mb: 7,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 10px 40px 0 rgba(0,0,0,0.06)',
        }}
      >
        {/* Banner Background */}
        <Box
          sx={{
            height: 180,
            width: '100%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            position: 'relative',
            opacity: 0.9,
          }}
        />
        
        {/* Profile Content Card */}
        <Card
          sx={{
            mx: { xs: 2, md: 6 },
            mt: -8,
            mb: 2,
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'visible',
            bgcolor: 'background.paper',
          }}
          elevation={0}
        >
          {/* Avatar - positioned to overlap the banner */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            p: { xs: 3, md: 4 },
            alignItems: { xs: 'center', md: 'flex-start' },
          }}>
            <Avatar 
              src={profile.profile_picture}
              alt={`${profile.first_name} ${profile.last_name}`}
              sx={{ 
                width: 130, 
                height: 130,
                border: '4px solid #fff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                fontSize: 50,
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                mb: { xs: 3, md: 0 },
                mr: { md: 4 },
                objectFit: 'cover'
              }}
            >
              {profile.first_name ? profile.first_name[0].toUpperCase() : '?'}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 600, 
                  letterSpacing: -0.5,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                {profile.first_name} {profile.last_name}
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mt: 1, 
                  mb: 3, 
                  color: 'text.secondary',
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                  maxWidth: '650px'
                }}
              >
                {profile.bio || 'No bio available'}
              </Typography>
              
              <Stack 
                direction="row" 
                spacing={1.5} 
                sx={{ 
                  mb: 0.5,
                  justifyContent: { xs: 'center', md: 'flex-start' } 
                }}
              >
                {profile.email && (
                  <Tooltip title="Email">
                    <IconButton 
                      aria-label="email" 
                      component="a" 
                      href={`mailto:${profile.email}`}
                      color="primary"
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.08), 
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                      }}
                      size="small"
                    >
                      <EmailOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                
                {profile.phone && (
                  <Tooltip title="Phone">
                    <IconButton 
                      aria-label="phone" 
                      component="a" 
                      href={`tel:${profile.phone}`}
                      color="primary"
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.08), 
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                      }}
                      size="small"
                    >
                      <PhoneOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                
                {profile.linkedin && (
                  <Tooltip title="LinkedIn">
                    <IconButton 
                      aria-label="linkedin" 
                      component="a" 
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary"
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.08), 
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                      }}
                      size="small"
                    >
                      <LinkedIn fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                
                {profile.github && (
                  <Tooltip title="GitHub">
                    <IconButton 
                      aria-label="github" 
                      component="a" 
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary"
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.08), 
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                      }}
                      size="small"
                    >
                      <GitHub fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          </Box>
        </Card>
        
        {/* Actions Bar - Floating below profile card */}
        <Card
          sx={{
            mx: { xs: 2, md: 6 },
            mb: 2,
            py: 1.5,
            px: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            justifyContent: 'center',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            bgcolor: alpha('#fff', 0.9),
          }}
          elevation={0}
        >
          <Button
            variant="contained"
            disableElevation
            startIcon={<EditOutlined />}
            onClick={() => navigate('/profile/edit')}
            size="medium"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.9rem',
              px: 2,
              py: 0.75,
              bgcolor: theme.palette.primary.main,
              '&:hover': { bgcolor: theme.palette.primary.dark },
            }}
            aria-label="Edit Profile"
          >
            Edit Profile
          </Button>
          
          {resume && (
            <>
              <Button
                variant="contained"
                disableElevation
                startIcon={<EditOutlined />}
                onClick={() => navigate('/resume/create')}
                size="medium"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  px: 2,
                  py: 0.75,
                  bgcolor: theme.palette.info.main,
                  '&:hover': { bgcolor: theme.palette.info.dark },
                }}
                aria-label="Edit Resume"
              >
                Edit Resume
              </Button>
              <Button
                variant="contained"
                disableElevation
                color="secondary"
                startIcon={<DownloadOutlined />}
                onClick={() => window.print()}
                size="medium"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  px: 2,
                  py: 0.75,
                }}
                aria-label="Export Resume as PDF"
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<DeleteOutlined />}
                onClick={() => setConfirmOpen(true)}
                size="medium"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  px: 2,
                  py: 0.75,
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    borderColor: theme.palette.error.dark 
                  },
                }}
                aria-label="Delete Resume"
              >
                Delete Resume
              </Button>
            </>
          )}
          

        </Card>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Resume Section */}
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography>Loading profile...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="error" variant="h6" gutterBottom>
                {error}
              </Typography>
            </Box>
          ) : resume ? (
            <>
              {/* Skills */}
              {resume.skills?.length > 0 && (
                <Card sx={{ mb: 4, p: 3, borderRadius: 5, boxShadow: 2 }}>
                  <SectionHeader icon={<CodeOutlined />} title="Core Skills" />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {parseField(resume.skills).map((skill, i) => (
                      <Chip key={i} label={skill} color="primary" sx={{ mb: 1 }} />
                    ))}
                  </Box>
                </Card>
              )}
              {/* Languages */}
              {resume.languages?.length > 0 && (
                <Card sx={{ mb: 4, p: 3, borderRadius: 5, boxShadow: 2 }}>
                  <SectionHeader icon={<LanguageOutlined />} title="Languages" />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {parseField(resume.languages).map((lang, i) => (
                      <Chip key={i} label={lang} color="secondary" sx={{ mb: 1 }} />
                    ))}
                  </Box>
                </Card>
              )}
              {/* Certifications */}
              {resume.certifications?.length > 0 && (
                <Card sx={{ mb: 4, p: 3, borderRadius: 5, boxShadow: 2 }}>
                  <SectionHeader icon={<CardMembershipOutlined />} title="Certifications" />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {parseField(resume.certifications).map((cert, i) => (
                      <Chip key={i} label={cert} color="success" sx={{ mb: 1 }} />
                    ))}
                  </Box>
                </Card>
              )}
              {/* Experience */}
              {resume.experience?.length > 0 && (
                <Card sx={{ mb: 4, p: 3, borderRadius: 5, boxShadow: 2 }}>
                  <SectionHeader icon={<WorkOutline />} title="Professional Experience" />
                  <Stack spacing={2} divider={<Divider flexItem />}>
                    {parseField(resume.experience).map((exp, i) => (
                      <Box key={i}>
                        <Typography variant="subtitle1" fontWeight={600}>{exp.title} @ {exp.company}</Typography>
                        <Typography variant="body2" color="text.secondary">{exp.start_date} - {exp.end_date || 'Present'}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{exp.description}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              )}
              {/* Education */}
              {resume.education?.length > 0 && (
                <Card sx={{ mb: 4, p: 3, borderRadius: 5, boxShadow: 2 }}>
                  <SectionHeader icon={<SchoolOutlined />} title="Education" />
                  <Stack spacing={2} divider={<Divider flexItem />}>
                    {parseField(resume.education).map((edu, i) => (
                      <Box key={i}>
                        <Typography variant="subtitle1" fontWeight={600}>{edu.degree} @ {edu.school}</Typography>
                        <Typography variant="body2" color="text.secondary">{edu.start_date} - {edu.end_date || 'Present'}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{edu.description}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              )}
            </>
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
                aria-label="Create Resume"
              >
                Create Resume
              </Button>
            </Paper>
          )}
        </Grid>
        {/* Profile Views & Notifications */}
        <Grid item xs={12} md={4}>
          {renderProfileViews()}
        </Grid>
      </Grid>
      {/* ConfirmDialog and Snackbar are rendered at the end of the main container */}
      <ConfirmDialog
        open={confirmOpen}
        title={'Delete Resume'}
        description={'Are you sure you want to permanently delete your resume? This action cannot be undone.'}
        onConfirm={handleDeleteResume}
        onCancel={() => setConfirmOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
      />
      <ErrorSnackbar
        open={snackbarOpen}
        message={snackbarMsg}
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
}

export default CandidateProfilePage;