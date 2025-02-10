import React from 'react';
import { Card, CardContent, Typography, Chip, Stack, Divider, Box, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';
import { alpha } from '@mui/system';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: theme.shadows[10],
  backgroundColor: theme.palette.background.paper, // Set card's background color to match the theme
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[15],
  },
  padding: '20px', // Added padding to the card for better content spacing
}));

const ScoreChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
  fontSize: '0.9rem',
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: '500',
}));

const ResumeCard = ({ resume }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledCard>
        <CardContent>
          {/* Name and Score */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                {resume.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {resume.name}
              </Typography>
            </Box>
            <ScoreChip label={`Score: ${resume.score.toFixed(2)}`} />
          </Box>

          {/* Personal Info */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">📧 {resume.email}</Typography>
            <Typography variant="body2" color="text.secondary">📞 {resume.phone}</Typography>
            <Typography variant="body2" color="text.secondary">🎂 {resume.age}</Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Education */}
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            🎓 Education
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {resume.education}
          </Typography>

          {/* Skills */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold', color: 'text.primary' }}>
            🛠️ Skills
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {resume.skills.map((skill, index) => (
              <SkillChip key={index} label={skill} />
            ))}
          </Stack>

          {/* Experience */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold', color: 'text.primary' }}>
            💼 Experience
          </Typography>
          <Stack spacing={1} sx={{ pl: 2 }}>
            {resume.experience.map((job, index) => (
              <Typography key={index} variant="body2" color="text.secondary">
                {job.years} years as <strong>{job.position}</strong> at {job.company}
              </Typography>
            ))}
          </Stack>

          {/* Languages */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold', color: 'text.primary' }}>
            🌍 Languages
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {resume.languages.map((language, index) => (
              <SkillChip key={index} label={language} />
            ))}
          </Stack>

          {/* Certifications */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold', color: 'text.primary' }}>
            🏅 Certifications
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {resume.certifications.map((certification, index) => (
              <SkillChip key={index} label={certification} />
            ))}
          </Stack>
        </CardContent>
      </StyledCard>
    </motion.div>
  );
};

export default ResumeCard;
