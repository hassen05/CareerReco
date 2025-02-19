import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Avatar, Button, Paper, Grid, 
  List, ListItem, ListItemIcon, ListItemText, Divider, Chip, IconButton } from '@mui/material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import { 
  WorkOutline, SchoolOutlined, CodeOutlined, LanguageOutlined,
  CardMembershipOutlined, EditOutlined, DownloadOutlined
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

const SectionHeader = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
    {React.cloneElement(icon, { 
      sx: { 
        fontSize: 32, 
        color: 'primary.main',
        mr: 2 
      }
    })}
    <Typography variant="h5" sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
  </Box>
);

const ResumeSection = ({ resume, navigate }) => {
  const theme = useTheme();

  if (!resume) return null;

  return (
    <Paper elevation={0} sx={{ 
      p: 4,
      mb: 4,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      background: theme.palette.background.paper
    }}>
      {/* Education */}
      {resume.education?.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            mb: 3,
            fontWeight: 600,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <SchoolOutlined fontSize="small" />
            Education
          </Typography>
          {resume.education.map((edu, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                {edu.institution}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {edu.degree}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            mb: 3,
            fontWeight: 600,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <WorkOutline fontSize="small" />
            Experience
          </Typography>
          {resume.experience.map((exp, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                {exp.position}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {exp.company} • {exp.start_date} - {exp.end_date}
              </Typography>
              {exp.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {exp.description}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Skills */}
      {resume.skills?.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            fontWeight: 600,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <CodeOutlined fontSize="small" />
            Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {resume.skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  borderRadius: 1,
                  bgcolor: 'action.selected',
                  color: 'text.primary'
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ 
        mt: 4,
        display: 'flex',
        gap: 2,
        justifyContent: 'flex-end',
        borderTop: `1px solid ${theme.palette.divider}`,
        pt: 3
      }}>
        <Button
          variant="outlined"
          startIcon={<EditOutlined />}
          onClick={() => navigate('/resume/create')}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadOutlined />}
          onClick={() => alert('Download functionality coming soon!')}
        >
          PDF
        </Button>
      </Box>
    </Paper>
  );
};

function ProfilePage() {
  const [profile, setProfile] = useState({
    id: null,
    email: '',
    first_name: '',
    last_name: '',
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

  const handleCreateResume = async (file) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      // Upload the resume
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // Update profile with resume URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ resume_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => ({ ...prev, resume_url: publicUrl }));
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

          if (profileError) {
            console.error('Profile error:', profileError);
            throw profileError;
          }

          // Fetch resume data separately
          const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (resumeError && resumeError.code !== 'PGRST116') { // Ignore "No rows found" error
            console.error('Resume error:', resumeError);
            throw resumeError;
          }

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
              width: 80,
              height: 80,
              border: `2px solid ${theme.palette.divider}`
            }}
          />
          <IconButton
            component="label"
            sx={{
              position: 'absolute',
              bottom: -8,
              right: -8,
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <EditIcon fontSize="small" />
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
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={600}>
            {profile.first_name || 'New User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.email}
          </Typography>
        </Box>

        {/* Resume Section */}
        {profile.resume ? (
          <ResumeSection resume={profile.resume} navigate={navigate} />
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
              variant="text"
              startIcon={<EditOutlined />}
              onClick={() => navigate('/resume/create')}
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