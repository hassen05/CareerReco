import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, CircularProgress, Alert, Box, Paper, Chip, Avatar, Link } from '@mui/material';
import { LinkedIn, GitHub, Twitter, Language, School } from '@mui/icons-material';

const MOCK_PROFILE_DATA = {
  profile: {
    id: "sample-user-id",
    first_name: "Sample",
    last_name: "User",
    email: "sample@example.com",
    phone: "123-456-7890",
    bio: "This is a sample profile used when the backend is unavailable.",
    profile_picture: "",
    website: "https://example.com",
    linkedin: "https://linkedin.com/in/sample",
    github: "https://github.com/sample",
    twitter: "https://twitter.com/sample"
  },
  resume: {
    skills: ["JavaScript", "React", "Node.js", "Python"],
    certifications: ["AWS Certified Developer", "Google Cloud Professional"],
    experience: [
      {
        position: "Frontend Developer",
        company: "Sample Corp",
        start_date: "2020-01-01",
        end_date: "2022-01-01",
        description: "Worked on various frontend projects using React."
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "Sample University",
        start_date: "2016-01-01", 
        end_date: "2020-01-01"
      }
    ]
  }
};

function PublicProfilePage() {
  const { user_id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        try {
          const response = await axios.get(`http://localhost:8000/api/profile/${user_id}/`);
          setProfileData(response.data);
        } catch (networkErr) {
          console.warn("Backend unavailable, using mock data:", networkErr);
          // Use mock data if API fails
          setProfileData(MOCK_PROFILE_DATA);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error in profile handling:", err);
        setError(`Failed to load profile: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user_id]);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />;
  }

  if (error) {
    return <Alert severity="error" sx={{ margin: 2 }}>{error}</Alert>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar 
            src={profileData.profile.profile_picture} 
            sx={{ 
              width: 120, 
              height: 120, 
              fontSize: '2.5rem',
              bgcolor: 'primary.main' 
            }}
          >
            {profileData.profile.first_name?.charAt(0)}{profileData.profile.last_name?.charAt(0)}
          </Avatar>
          <Typography variant="h4" gutterBottom>
            {profileData.profile.first_name} {profileData.profile.last_name}
          </Typography>
        </Box>

        {profileData.profile.bio && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>About Me</Typography>
            <Typography variant="body1">{profileData.profile.bio}</Typography>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary">
            {profileData.profile.email} | {profileData.profile.phone}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Links</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {profileData.profile.website && (
              <Link href={profileData.profile.website} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Language /> Website
              </Link>
            )}
            {profileData.profile.linkedin && (
              <Link href={profileData.profile.linkedin} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LinkedIn /> LinkedIn
              </Link>
            )}
            {profileData.profile.github && (
              <Link href={profileData.profile.github} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <GitHub /> GitHub
              </Link>
            )}
            {profileData.profile.twitter && (
              <Link href={profileData.profile.twitter} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Twitter /> Twitter
              </Link>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Skills</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {profileData.resume.skills?.map((skill, index) => (
              <Chip key={index} label={skill} color="primary" />
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Certifications</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {profileData.resume.certifications?.length > 0 ? (
              profileData.resume.certifications.map((cert, index) => (
                <Chip 
                  key={index} 
                  label={cert} 
                  color="secondary" 
                  icon={<School />} 
                  sx={{ '& .MuiChip-icon': { color: 'inherit' } }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No certifications listed
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Experience</Typography>
          {profileData.resume.experience?.map((exp, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography fontWeight="bold">{exp.position} at {exp.company}</Typography>
              <Typography variant="body2" color="text.secondary">
                {exp.start_date} - {exp.end_date || 'Present'}
              </Typography>
              {exp.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {exp.description}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Paper>
    </Container>
  );
}

export default PublicProfilePage; 