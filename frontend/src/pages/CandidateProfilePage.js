import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Typography, Box, Avatar, Button, Paper, Grid, 
  IconButton, Card, Stack, List, ListItem, ListItemAvatar,
  ListItemText, Divider, Chip, CircularProgress, Tooltip
} from '@mui/material';
import { supabase } from '../supabaseClient';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorSnackbar from '../components/ErrorSnackbar';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  WorkOutline, CodeOutlined, LanguageOutlined,
  EditOutlined, DownloadOutlined, EmailOutlined,
  PhoneOutlined, LinkedIn, GitHub, CardMembershipOutlined,
  Business, Visibility, DeleteOutlined, SchoolOutlined
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

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
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileViews, setProfileViews] = useState([]);
  const [loadingViews, setLoadingViews] = useState(true);
  
  // Store stable references to avoid unnecessary re-renders
  const profileRef = React.useRef(null);
  const resumeRef = React.useRef(null);
  const dataFetchedRef = React.useRef(false);
  const viewsFetchedRef = React.useRef(false);
  
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Dialog & error state for destructive actions
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Debug user object - only log once on mount
  useEffect(() => {
    if (user) {
      console.log('[CandidateProfilePage] User loaded:', user.id);
    }
  }, [user]); // Added user dependency

  // Delete resume handler
  const handleDeleteResume = async () => {
    if (deleteLoading) return; // Prevent double-clicks
    
    setDeleteLoading(true);
    try {
      if (!user) throw new Error('Not authenticated');
      
      const { error: deleteError } = await supabase
        .from('resumes')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) throw deleteError;
      
      setResume(null);
      resumeRef.current = null;
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

  // Primary data fetching function with proper memoization
  const fetchData = useCallback(async () => {
    // Prevent redundant fetches when data is already loaded
    if (dataFetchedRef.current || !user?.id || authLoading) return;
    
    setLoading(true);
    setError(null);
    console.log('Starting profile data fetch');
    
    try {
      const userId = user.id;
      const userEmail = user.email;
      const firstName = user.user_metadata?.first_name;
      const lastName = user.user_metadata?.last_name;
      
      console.log('[CandidateProfilePage] fetchData for:', {userId, userEmail, firstName, lastName});
      
      // Fetch profile with a single clean query
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error('[CandidateProfilePage] Profile fetch error:', profileError);
        throw new Error('Unable to load profile. Please try again later.');
      }
      
      console.log('[CandidateProfilePage] Profile data fetched:', profileData ? 'success' : 'empty');
      
      // Fetch resume data
      let resumeData = null;
      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', userId)
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
      const finalProfileData = profileData || {
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
      
      // Update refs first, then state to avoid race conditions
      profileRef.current = finalProfileData;
      resumeRef.current = resumeData;
      
      setProfile(finalProfileData);
      setResume(resumeData);
      dataFetchedRef.current = true;
      
      console.log('Profile data loading complete');
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, user?.user_metadata?.first_name, user?.user_metadata?.last_name, authLoading]); // Added all user dependencies

  // Fetch profile views separately to avoid unnecessary re-renders
  const fetchProfileViews = useCallback(async () => {
    // Prevent duplicate fetches
    if (viewsFetchedRef.current || !user?.id || authLoading) return;
    
    try {
      setLoadingViews(true);
      console.log('Starting profile views fetch');
      
      // Try to fetch from notifications table, fall back to mock data
      try {
        const { count, error: tableError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true });
        
        if (tableError) {
          console.error('Notifications table error:', tableError);
          
          // Create mock data for demo purposes
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
          viewsFetchedRef.current = true;
          return;
        }
        
        console.log('Notifications table exists, count:', count);
        
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
          return;
        }

        console.log('Found notifications:', notifications?.length || 0);
        
        if (!notifications || notifications.length === 0) {
          console.log('No profile view notifications found');
          setProfileViews([]);
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
      } catch (tableCheckError) {
        console.error('Error checking notifications table:', tableCheckError);
        setProfileViews([]);
      }
    } catch (error) {
      console.error('Error in fetchProfileViews:', error);
      setProfileViews([]);
    } finally {
      setLoadingViews(false);
      viewsFetchedRef.current = true;
    }
  }, [user?.id, authLoading]); // Only depend on user ID and auth loading state

  // Effect to fetch data when user is available
  useEffect(() => {
    if (user?.id && !authLoading && !dataFetchedRef.current) {
      fetchData();
    }
  }, [user?.id, authLoading, fetchData]);
  
  // Separate effect for profile views
  useEffect(() => {
    if (user?.id && !authLoading && !viewsFetchedRef.current) {
      fetchProfileViews();
    }
  }, [user?.id, authLoading, fetchProfileViews]);

  // Safety timeout to prevent stuck loading state
  useEffect(() => {
    let timeoutId;
    
    if (loading) {
      timeoutId = setTimeout(() => {
        // Only force-exit loading state if we're still loading after timeout
        if (loading) {
          console.warn('Loading timeout exceeded, forcing state update');
          setLoading(false);
          
          // Use cached data if available
          if (!profile && profileRef.current) {
            setProfile(profileRef.current);
          }
          
          if (!profile && !profileRef.current) {
            setError('Loading timed out. Please refresh the page to try again.');
          }
        }
      }, 10000); // 10-second timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, profile]);
  
  // Handle tab visibility changes to prevent data loss
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible again, restore from refs if needed
        console.log('Tab visible again, checking cached data');
        if (profileRef.current && !profile) {
          setProfile(profileRef.current);
        }
        if (resumeRef.current && !resume) {
          setResume(resumeRef.current);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [profile, resume]);

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

  // Render the main profile page UI after auth checks
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
        {/* Actions Bar */}
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