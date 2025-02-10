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
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(8px)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  paddingBottom: 0,
}));

const ScoreBadge = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
  color: theme.palette.common.white,
  fontWeight: 700,
  fontSize: '0.9rem',
  padding: theme.spacing(1),
}));

const DetailChip = styled(Chip)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.text.primary,
  fontWeight: 500,
  padding: theme.spacing(0.5),
}));

const ResumeCard = ({ resume }) => {
  const theme = useTheme();

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
            <ScoreBadge label={`${resume.score.toFixed(1)} Match`} />
          </CardHeader>

          <Stack spacing={2} sx={{ p: 3 }}>
            <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />

            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
              <DetailChip label={`📧 ${resume.email}`} />
              <DetailChip label={`📱 ${resume.phone}`} />
              <DetailChip label={`🎂 ${resume.age} years`} />
            </Stack>

            <Section title="🎓 Education" content={resume.education} />
            
            <Section title="🛠️ Core Skills">
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {resume.skills.map((skill, index) => (
                  <DetailChip key={index} label={skill} />
                ))}
              </Stack>
            </Section>

            <Section title="💼 Professional Experience">
              {resume.experience.map((job, index) => (
                <Typography key={index} variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>{job.years}y</strong> as {job.position} @ {job.company}
                </Typography>
              ))}
            </Section>

            <Section title="🌍 Languages">
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {resume.languages.map((lang, index) => (
                  <DetailChip key={index} label={lang} />
                ))}
              </Stack>
            </Section>

            <Section title="🏆 Certifications">
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {resume.certifications.map((cert, index) => (
                  <DetailChip key={index} label={cert} />
                ))}
              </Stack>
            </Section>
          </Stack>
        </CardContent>
      </StyledCard>
    </motion.div>
  );
};

const Section = ({ title, content, children }) => (
  <Box>
    <Typography variant="subtitle1" sx={{ 
      fontWeight: 600, 
      mb: 1.5,
      color: 'primary.main'
    }}>
      {title}
    </Typography>
    {content && (
      <Typography variant="body2" sx={{ 
        color: 'text.secondary',
        lineHeight: 1.6 
      }}>
        {content}
      </Typography>
    )}
    {children}
  </Box>
);

export default ResumeCard;