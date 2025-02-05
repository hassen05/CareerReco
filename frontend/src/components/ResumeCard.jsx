import React from 'react';
import { Card, CardContent, Typography, Chip, Stack, Divider, Box } from '@mui/material';

const ResumeCard = ({ resume }) => {
  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}>
      <CardContent>
        {/* Name and Score */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#5e35b1' }}>
            {resume.name}
          </Typography>
          <Chip
            label={`Score: ${resume.score.toFixed(2)}`}
            sx={{ backgroundColor: '#ffab40', color: 'white', fontWeight: 'bold' }}
          />
        </Box>

        {/* Personal Info */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Email: {resume.email}</Typography>
          <Typography variant="body2" color="text.secondary">Phone: {resume.phone}</Typography>
          <Typography variant="body2" color="text.secondary">Age: {resume.age}</Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Education */}
        <Typography variant="subtitle1" gutterBottom>
          <strong>Education:</strong> {resume.education}
        </Typography>

        {/* Skills */}
        <Typography variant="subtitle1" gutterBottom>
          <strong>Skills:</strong>
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {resume.skills.map((skill, index) => (
            <Chip key={index} label={skill} sx={{ backgroundColor: '#e0e0e0', color: '#333' }} />
          ))}
        </Stack>

        {/* Experience */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          <strong>Experience:</strong>
        </Typography>
        <Stack spacing={1} sx={{ pl: 2 }}>
          {resume.experience.map((job, index) => (
            <Typography key={index} variant="body2" color="text.secondary">
              {job.years} years as {job.position} at {job.company}
            </Typography>
          ))}
        </Stack>

        {/* Languages */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          <strong>Languages:</strong>
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {resume.languages.map((language, index) => (
            <Chip key={index} label={language} sx={{ backgroundColor: '#e0e0e0', color: '#333' }} />
          ))}
        </Stack>

        {/* Certifications */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          <strong>Certifications:</strong>
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {resume.certifications.map((certification, index) => (
            <Chip key={index} label={certification} sx={{ backgroundColor: '#e0e0e0', color: '#333' }} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ResumeCard;