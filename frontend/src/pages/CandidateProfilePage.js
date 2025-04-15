import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Avatar, Button, Paper, Grid, 
  IconButton, Card, Stack, List, ListItem, ListItemAvatar,
  ListItemText, Divider, Chip, CircularProgress
} from '@mui/material';
import { supabase } from '../supabaseClient';
import notificationService from '../services/notificationService';


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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // Fetch resume
        const { data: resumeData, error: resumeError } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (resumeError) throw resumeError;

        setProfile(profileData || {
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
        });

        setResume(resumeData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchProfileViews = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found');
          return;
        }

        console.log('Fetching profile views for user:', user.id);

        // Fetch notifications of type 'profile_view' for the current user
        const { data: notifications, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'profile_view')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }

        console.log('Found notifications:', notifications);

        // Get unique companies that viewed the profile
        const uniqueCompanies = new Map();
        for (const notification of notifications) {
          console.log('Processing notification:', notification);
          const viewerId = notification.data?.viewer_id;
          console.log('Viewer ID from notification:', viewerId);

          if (!viewerId) {
            console.warn('No viewer ID found in notification data');
            continue;
          }

          if (!uniqueCompanies.has(viewerId)) {
            try {
              // Get the viewer's profile
              const { data: viewerProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', viewerId)
                .single();

              if (profileError) {
                console.error('Error fetching viewer profile:', profileError);
                continue;
              }

              console.log('Viewer profile:', viewerProfile);

              if (viewerProfile) {
                uniqueCompanies.set(viewerId, {
                  company_name: notification.data?.viewer_company || 'Unknown Company',
                  profile_picture: notification.data?.viewer_profile_picture || viewerProfile.profile_picture || null,
                  viewed_at: notification.created_at
                });
              }
            } catch (err) {
              console.error('Error processing viewer profile:', err);
              continue;
            }
          }
        }

        const views = Array.from(uniqueCompanies.values());
        console.log('Processed profile views:', views);
        setProfileViews(views);
      } catch (error) {
        console.error('Error in fetchProfileViews:', error);
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

  const renderProfileViews = () => (
    <Box sx={{ mt: 4 }}>
      <SectionHeader 
        icon={<Visibility sx={{ color: 'primary.main', mr: 2, fontSize: 24 }} />} 
        title="Companies That Viewed Your Profile" 
      />
      {loadingViews ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : profileViews.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No companies have viewed your profile yet
          </Typography>
        </Paper>
      ) : (
        <List>
          {profileViews.map((company, index) => (
            <React.Fragment key={`${company.company_name}-${index}`}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar 
                    src={company.profile_picture} 
                    alt={company.company_name}
                    sx={{ 
                      width: 56, 
                      height: 56,
                      bgcolor: 'primary.main',
                      '& img': {
                        objectFit: 'cover'
                      }
                    }}
                  >
                    {!company.profile_picture && (
                      <Business sx={{ fontSize: 32 }} />
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {company.company_name}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={new Date(company.viewed_at).toLocaleDateString()} 
                        color="primary" 
                        variant="outlined"
                      />
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

  if (loading) return <Typography>Loading profile...</Typography>;
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
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DownloadOutlined />}
              onClick={() => window.print()}
              sx={{ borderRadius: 50, px: 4 }}
            >
              Export PDF
            </Button>
          )}
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
    </Container>
  );
}

export default CandidateProfilePage;