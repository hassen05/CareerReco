import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Avatar, Button, Paper, Grid, 
   IconButton, Card, 
} from '@mui/material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  WorkOutline, SchoolOutlined, CodeOutlined, LanguageOutlined,
  CardMembershipOutlined, EditOutlined, DownloadOutlined, Email, 
  Phone, LinkedIn, GitHub, Twitter} from '@mui/icons-material';
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

const ResumeSection = ({ resume, userProfile, navigate }) => {
  const theme = useTheme();

  if (!resume) {
    return (
      <Paper elevation={0} sx={{ 
        p: 4,
        textAlign: 'center',
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: 2
      }}>
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
    );
  }

  // Field parsing helper function
  const parseField = (field) => {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return field.split(',').map(item => typeof field[0] === 'object' ? { ...item } : { value: item.trim() });
      }
    }
    return field;
  };

  const languages = parseField(resume.languages);
  const certifications = parseField(resume.certifications);

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
            {item.language || item.name || item.value || item}
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
          {item.field_of_study && (
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Field of Study: {item.field_of_study}
            </Typography>
          )}
        </Card>
      ))}
    </Box>
  );

  return (
    <StyledPaper>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.5px' }}>
          {[userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ') || 'Your Name'}
        </Typography>
        
        {/* Bio */}
        {userProfile?.bio && (
          <Typography variant="body1" color="text.secondary" sx={{ 
            maxWidth: '600px',
            mx: 'auto',
            mb: 3
          }}>
            {userProfile.bio}
          </Typography>
        )}

        {/* Contact Info */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2,
          flexWrap: 'wrap',
          mt: 3
        }}>
          {userProfile?.email && (
            <DetailChip sx={{ px: 2, py: 1 }}>
              <Email sx={{ color: 'primary.main', mr: 1 }} />
              {userProfile.email}
            </DetailChip>
          )}
          {userProfile?.phone && (
            <DetailChip sx={{ px: 2, py: 1 }}>
              <Phone sx={{ color: 'primary.main', mr: 1 }} />
              {userProfile.phone}
            </DetailChip>
          )}
          {userProfile?.website && (
            <DetailChip 
              component="a" 
              href={userProfile.website} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ px: 2, py: 1 }}
            >
              <LanguageOutlined sx={{ color: 'primary.main', mr: 1 }} />
              Website
            </DetailChip>
          )}
        </Box>

        {/* Social Links */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2,
          mt: 2
        }}>
          {userProfile?.linkedin && (
            <IconButton 
              component="a" 
              href={userProfile.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ color: 'text.secondary' }}
            >
              <LinkedIn />
            </IconButton>
          )}
          {userProfile?.github && (
            <IconButton 
              component="a" 
              href={userProfile.github} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ color: 'text.secondary' }}
            >
              <GitHub />
            </IconButton>
          )}
          {userProfile?.twitter && (
            <IconButton 
              component="a" 
              href={userProfile.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ color: 'text.secondary' }}
            >
              <Twitter />
            </IconButton>
          )}
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            {resume.skills?.length > 0 && renderDetailSection(resume.skills, <CodeOutlined />, "Core Skills")}
            {languages.length > 0 && renderDetailSection(languages, <LanguageOutlined />, "Languages")}
            {certifications.length > 0 && renderDetailSection(certifications, <CardMembershipOutlined />, "Certifications")}
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {resume.experience?.length > 0 && renderExperienceEducation(resume.experience, <WorkOutline />, "Professional Experience")}
            {resume.education?.length > 0 && renderExperienceEducation(resume.education, <SchoolOutlined />, "Education")}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ 
        mt: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        pt: 3
      }}>
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date(resume.updated_at).toLocaleDateString()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<EditOutlined />}
            onClick={() => navigate('/resume/create')}
            sx={{ borderRadius: 50, px: 4 }}
          >
            Edit Resume
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadOutlined />}
            onClick={() => alert('Download functionality coming soon!')}
            sx={{ borderRadius: 50, px: 4 }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>
    </StyledPaper>
  );
};

function ProfilePage() {
  const [profile, setProfile] = useState({
    id: null,
    email: '',
    full_name: '',
    profile_picture: '',
    resume: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

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
          // Fetch profile data
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          // Fetch resume data - handle case where no resume exists
          const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();  // Use maybeSingle instead of single

          // If no resume exists, set resume to null
          setProfile({
            id: user.id,
            email: user.email,
            ...profile,
            resume: resume || null
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
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading profile...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 3
      }}>
        {/* Avatar Section */}
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={profile?.profile_picture}
            sx={{ 
              width: 120,
              height: 120,
              border: `2px solid ${theme.palette.divider}`
            }}
          />
          <IconButton
            component="label"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <EditOutlined fontSize="small" />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </IconButton>
        </Box>

        {/* Profile Info */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.5px' }}>
            {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Your Name'}
          </Typography>
          
          {/* Bio */}
          {profile.bio && (
            <Typography variant="body1" color="text.secondary" sx={{ 
              maxWidth: '600px',
              mx: 'auto',
              mb: 3
            }}>
              {profile.bio}
            </Typography>
          )}

          {/* Contact Info */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            flexWrap: 'wrap',
            mt: 3
          }}>
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
            {profile.website && (
              <DetailChip 
                component="a" 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ px: 2, py: 1 }}
              >
                <LanguageOutlined sx={{ color: 'primary.main', mr: 1 }} />
                Website
              </DetailChip>
            )}
          </Box>

          {/* Social Links */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            mt: 2
          }}>
            {profile.linkedin && (
              <IconButton 
                component="a" 
                href={profile.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ color: 'text.secondary' }}
              >
                <LinkedIn />
              </IconButton>
            )}
            {profile.github && (
              <IconButton 
                component="a" 
                href={profile.github} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ color: 'text.secondary' }}
              >
                <GitHub />
              </IconButton>
            )}
            {profile.twitter && (
              <IconButton 
                component="a" 
                href={profile.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ color: 'text.secondary' }}
              >
                <Twitter />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Resume Section */}
        {profile.resume ? (
          <ResumeSection resume={profile.resume} userProfile={profile} navigate={navigate} />
        ) : (
          <Paper elevation={0} sx={{ 
            p: 4,
            width: '100%',
            textAlign: 'center',
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 2
          }}>
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

        {/* Profile Actions */}
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          mt: 4,
          pt: 3,
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Button
            variant="text"
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </Button>
          <Button
            variant="text"
            color="error"
            onClick={() => {
              supabase.auth.signOut();
              navigate('/');
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default ProfilePage;