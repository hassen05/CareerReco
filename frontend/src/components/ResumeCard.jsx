// components/ResumeCard.js
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Stack, 
  Divider, 
  Box, 
  Avatar,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { styled, alpha } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: `0 10px 40px -10px ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  backdropFilter: 'blur(20px)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px -20px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  paddingBottom: 0,
}));

const ScoreBadge = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
  color: theme.palette.common.white,
  fontWeight: 700,
  fontSize: '0.95rem',
  padding: theme.spacing(1),
  height: 32,
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const DetailChip = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.8rem',
}));

const AndMoreChip = styled(Box)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: theme.palette.text.secondary,
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '0.7rem',
  fontStyle: 'italic',
}));

const ResumeCard = ({ resume }) => {
  const theme = useTheme();
  const MAX_SKILLS = 3;  // Maximum number of skills to show
  const MAX_CERTS = 2;   // Maximum number of certifications to show

  // Handle undefined or null score
  const formattedScore = resume.score !== undefined ? resume.score.toFixed(3) : '0.000';

  // Convert education object to a string
  const educationText = resume.education && resume.education.length > 0
    ? `${resume.education[0].degree} at ${resume.education[0].institution}`
    : 'No education information available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ height: '100%' }}
    >
      <StyledCard>
        <CardContent sx={{ flex: 1 }}>
          <CardHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                color: 'primary.main',
                width: 56, 
                height: 56,
                fontSize: '1.5rem',
                fontWeight: 700 
              }}>
                {resume.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {resume.name}
              </Typography>
            </Box>
            <ScoreBadge label={`${formattedScore} Match`} />
          </CardHeader>

          <Stack spacing={2} sx={{ p: 3 }}>
            <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />

            <Section title="🎓 Education">
              <Typography variant="body2">{educationText}</Typography>
            </Section>
            
            <Section title="🛠️ Core Skills">
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {resume.skills.slice(0, MAX_SKILLS).map((skill, index) => (
                  <DetailChip key={index}>{skill}</DetailChip>
                ))}
                {resume.skills.length > MAX_SKILLS && (
                  <AndMoreChip>+{resume.skills.length - MAX_SKILLS} more</AndMoreChip>
                )}
              </Stack>
            </Section>

            <Section title="💼 Professional Experience">
              {resume.experience.map((job, index) => {
                const startDate = new Date(job.start_date);
                const endDate = job.end_date ? new Date(job.end_date) : new Date();
                const years = (endDate.getFullYear() - startDate.getFullYear()) + 
                             (endDate.getMonth() - startDate.getMonth()) / 12;
                const formattedYears = Math.round(years * 10) / 10; // Round to 1 decimal
                
                return (
                  <Typography key={index} variant="body2" sx={{ color: 'text.secondary' }}>
                    <strong>{formattedYears}y</strong> as {job.position} at {job.company}
                  </Typography>
                );
              })}
            </Section>

            <Section title="🌍 Languages">
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {resume.languages.map((lang, index) => (
                  <DetailChip key={index}>{lang}</DetailChip>
                ))}
              </Stack>
            </Section>

            <Section title="🏆 Certifications">
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {resume.certifications.slice(0, MAX_CERTS).map((cert, index) => (
                  <DetailChip key={index}>{cert}</DetailChip>
                ))}
                {resume.certifications.length > MAX_CERTS && (
                  <AndMoreChip>+{resume.certifications.length - MAX_CERTS} more</AndMoreChip>
                )}
              </Stack>
            </Section>
          </Stack>
        </CardContent>
      </StyledCard>
    </motion.div>
  );
};

const Section = ({ title, children }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

export default ResumeCard;