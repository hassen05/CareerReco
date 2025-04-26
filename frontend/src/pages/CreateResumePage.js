import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Grid, Paper, 
  IconButton, Divider, useTheme, Autocomplete, Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AddCircleOutline, DeleteOutline, WorkOutline, SchoolOutlined, LanguageOutlined, CodeOutlined, CardMembershipOutlined } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import axios from 'axios';

const predefinedLanguages = [
  'English', 'Spanish', 'French', 'German', 'Mandarin',
  'Arabic', 'Hindi', 'Portuguese', 'Russian', 'Japanese',
  

];

const CreateResumePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState({
    education: [{ institution: '', degree: '' }],
    skills: [],
    experience: [{
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      description: ''
    }],
    languages: [],
    certifications: ['']
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Use environment variable for API base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: resume, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (!error && resume) {
            setResumeData({
              education: resume.education || [{ institution: '', degree: '' }],
              skills: resume.skills || [],
              experience: resume.experience || [{
                company: '',
                position: '',
                start_date: '',
                end_date: '',
                description: ''
              }],
              languages: resume.languages || [],
              certifications: resume.certifications || ['']
            });
          }
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    };

    fetchResume();
  }, []);

  const handleChange = (field, index, subField) => (e) => {
    if (index !== undefined && subField) {
      setResumeData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => 
          i === index ? { ...item, [subField]: e.target.value } : item
        )
      }));
    } else if (index !== undefined) {
      setResumeData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => 
          i === index ? e.target.value : item
        )
      }));
    } else {
      setResumeData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    }
  };

  const handleAddItem = (field) => (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setResumeData(prev => ({
        ...prev,
        [field]: [...prev[field], e.target.value.trim()]
      }));
      e.target.value = '';
    }
  };

  const handleAddCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const handleAddExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        description: ''
      }]
    }));
  };

  const handleRemoveItem = (field, index) => {
    setResumeData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleAddEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '' }]
    }));
  };

  const handleAddSkill = () => {
    const input = document.getElementById('skill-input');
    if (input.value.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, input.value.trim()]
      }));
      input.value = '';
    }
  };

  const handleLanguageChange = (event, values) => {
    setResumeData(prev => ({
      ...prev,
      languages: values
    }));
  };

  const generateEmbedding = async (resumeData) => {
    try {
      // Prepare data for embedding generation
      const embeddingData = {
        education: resumeData.education.map(edu => ({
          degree: edu.degree,
          institution: edu.institution
        })),
        skills: resumeData.skills,
        experience: resumeData.experience,
        languages: resumeData.languages,
        certifications: resumeData.certifications
      };

      const response = await axios.post(`${API_BASE_URL}/generate-embedding/`, {
        resume_data: embeddingData,
      });

      // Decode Base64 string to binary
      const embedding = atob(response.data.embedding);
      return new Uint8Array(embedding.split('').map(char => char.charCodeAt(0)));
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const embedding = await generateEmbedding(resumeData);
      await saveResumeToSupabase({ ...resumeData, embedding });
    } catch (error) {
      console.error("Error saving resume:", error);
      setError(error.message || 'Failed to save resume');
    } finally {
      setSubmitting(false);
    }
  };

  const saveResumeToSupabase = async (resumeData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Convert embedding to Base64 string
      const embeddingBase64 = btoa(String.fromCharCode(...new Uint8Array(resumeData.embedding)));

      // Prepare resume data for Supabase
      const supabaseResume = {
        user_id: user.id,
        ...resumeData,
        embedding: embeddingBase64,  // Store as Base64 string
        updated_at: new Date().toISOString()
      };

      // Upsert to Supabase (update if exists, insert if not)
      const { data, error } = await supabase
        .from('resumes')
        .upsert([supabaseResume], {
          onConflict: 'user_id',
          returning: 'representation'
        })
        .select('*')
        .single();

      if (error) throw error;

      // Handle success
      navigate('/profile');
    } catch (error) {
      console.error('Error saving resume:', error);
      setError(error.message || 'Failed to save resume');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{
        borderRadius: 4,
        bgcolor: 'background.paper',
        p: { xs: 2, md: 4 },
        boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            mb: 1
          }}>
            Build Your Professional Resume
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Showcase your skills and experience with our modern resume builder
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Education Section */}
          <Paper sx={{ mb: 4, p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SchoolOutlined sx={{ 
                fontSize: 32, 
                color: 'primary.main',
                mr: 2 
              }}/>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Education
              </Typography>
            </Box>
            
            {resumeData.education.map((edu, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Institution Name"
                      variant="outlined"
                      value={edu.institution}
                      onChange={(e) => handleChange('education', index, 'institution')(e)}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Degree"
                      variant="outlined"
                      value={edu.degree}
                      onChange={(e) => handleChange('education', index, 'degree')(e)}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={12} sx={{ textAlign: 'right' }}>
                    <IconButton 
                      onClick={() => handleRemoveItem('education', index)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              startIcon={<AddCircleOutline />}
              onClick={handleAddEducation}
              sx={{
                mt: 1,
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              Add Education
            </Button>
          </Paper>

          {/* Experience Section */}
          <Paper sx={{ mb: 4, p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <WorkOutline sx={{ 
                fontSize: 32, 
                color: 'primary.main',
                mr: 2 
              }}/>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Work Experience
              </Typography>
            </Box>

            {resumeData.experience.map((exp, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      variant="outlined"
                      value={exp.company}
                      onChange={(e) => handleChange('experience', index, 'company')(e)}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      variant="outlined"
                      value={exp.position}
                      onChange={(e) => handleChange('experience', index, 'position')(e)}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      variant="outlined"
                      value={exp.start_date}
                      onChange={(e) => handleChange('experience', index, 'start_date')(e)}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      variant="outlined"
                      value={exp.end_date}
                      onChange={(e) => handleChange('experience', index, 'end_date')(e)}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      variant="outlined"
                      multiline
                      rows={3}
                      value={exp.description}
                      onChange={(e) => handleChange('experience', index, 'description')(e)}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: 'right' }}>
                    <IconButton 
                      onClick={() => handleRemoveItem('experience', index)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              startIcon={<AddCircleOutline />}
              onClick={handleAddExperience}
              sx={{
                mt: 1,
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              Add Experience
            </Button>
          </Paper>

          {/* Skills & Languages Section */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CodeOutlined sx={{ 
                    fontSize: 32, 
                    color: 'primary.main',
                    mr: 2 
                  }}/>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Technical Skills
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  {resumeData.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => handleRemoveItem('skills', index)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    id="skill-input"
                    variant="outlined"
                    label="Add Skill"
                    InputProps={{
                      sx: { borderRadius: 2 },
                      endAdornment: (
                        <IconButton onClick={handleAddSkill}>
                          <AddCircleOutline sx={{ color: 'text.secondary' }} />
                        </IconButton>
                      )
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LanguageOutlined sx={{ 
                    fontSize: 32, 
                    color: 'primary.main',
                    mr: 2 
                  }}/>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Languages
                  </Typography>
                </Box>

                <Autocomplete
                  multiple
                  options={predefinedLanguages}
                  value={resumeData.languages}
                  onChange={handleLanguageChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Select Languages"
                      placeholder="Choose from list"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        onDelete={() => handleRemoveItem('languages', index)}
                        sx={{ m: 0.5 }}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  sx={{ mb: 2 }}
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Certifications Section */}
          <Paper sx={{ mb: 4, p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CardMembershipOutlined sx={{ 
                fontSize: 32, 
                color: 'primary.main',
                mr: 2 
              }}/>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Certifications
              </Typography>
            </Box>
            
            {resumeData.certifications.map((cert, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={10}>
                    <TextField
                      fullWidth
                      label={`Certification ${index + 1}`}
                      variant="outlined"
                      value={cert}
                      onChange={handleChange('certifications', index)}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <IconButton 
                      onClick={() => handleRemoveItem('certifications', index)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              startIcon={<AddCircleOutline />}
              onClick={handleAddCertification}
              sx={{
                mt: 1,
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              Add Certification
            </Button>
          </Paper>

          {/* Form Actions */}
          <Box sx={{ 
            mt: 6, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            pt: 4
          }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/profile')}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              Save & Preview
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateResumePage;