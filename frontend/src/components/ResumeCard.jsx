// components/ResumeCard.js
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Stack, 
  Divider, 
  Box, 
  Avatar,
  useTheme,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import { styled, alpha } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { InfoOutlined, Check } from '@mui/icons-material';

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

const InfoButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  backgroundColor: alpha(theme.palette.info.main, 0.1),
  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
  color: theme.palette.info.main,
  width: 32,
  height: 32,
  '&:hover': {
    backgroundColor: alpha(theme.palette.info.main, 0.2),
  },
}));

const MatchReasonsList = styled(List)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(8px)',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  padding: theme.spacing(1.5),
  margin: theme.spacing(2, 0),
}));

const ResumeCard = ({ resume }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showReasons, setShowReasons] = useState(false);
  const MAX_SKILLS = 3;  // Maximum number of skills to show
  const MAX_CERTS = 2;   // Maximum number of certifications to show

  // Safe access functions with fallbacks
  const safeName = () => {
    if (!resume) return 'Candidate';
    if (typeof resume.name === 'string' && resume.name) return resume.name;
    return 'Unnamed Candidate';
  };
  
  const safeInitial = () => {
    const name = safeName();
    return name && typeof name === 'string' && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  };
  
  // Handle undefined or null score
  const formattedScore = resume?.score !== undefined ? 
    parseFloat(resume.score).toFixed(3) : '0.000';

  // Convert education object to a string
  const educationText = resume?.education && Array.isArray(resume.education) && resume.education.length > 0
    ? `${resume.education[0].degree || 'Degree'} at ${resume.education[0].institution || 'Institution'}`
    : 'No education information available';
    
  // Safe access to arrays
  const skills = Array.isArray(resume?.skills) ? resume.skills : [];
  const experience = Array.isArray(resume?.experience) ? resume.experience : [];
  const languages = Array.isArray(resume?.languages) ? resume.languages : [];
  const certifications = Array.isArray(resume?.certifications) ? resume.certifications : [];
  const matchReasons = Array.isArray(resume?.match_reasons) ? resume.match_reasons : [];

  const handleCardClick = () => {
    if (resume?.user_id) {
      try {
        navigate(`/profile/${resume.user_id}`);
      } catch (err) {
        console.error("Navigation error:", err);
        // Show a tooltip or alert that profile isn't available
        alert("Profile navigation is not available at this time.");
      }
    }
  };
  
  const toggleReasons = (e) => {
    e.stopPropagation(); // Prevent card click
    setShowReasons(!showReasons);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ height: '100%' }}
    >
      <StyledCard 
        onClick={handleCardClick}
        sx={{ 
          cursor: 'pointer',
          '&:hover': {
            boxShadow: `0 12px 45px -10px ${alpha(theme.palette.primary.main, 0.3)}`
          },
          position: 'relative', // For absolute positioning of the info button
        }}
      >
        {/* Info Button */}
        {matchReasons.length > 0 && (
          <Tooltip title="Why this match?">
            <InfoButton 
              size="small" 
              onClick={toggleReasons}
              aria-label="Show match reasons"
            >
              <InfoOutlined fontSize="small" />
            </InfoButton>
          </Tooltip>
        )}
        
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
                {safeInitial()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {safeName()}
              </Typography>
            </Box>
            <ScoreBadge label={`${formattedScore} Match`} />
          </CardHeader>

          <Stack spacing={2} sx={{ p: 3 }}>
            <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />
            
            {/* Match Reasons Collapsible Section */}
            {matchReasons.length > 0 && (
              <Collapse in={showReasons} timeout="auto" unmountOnExit>
                <MatchReasonsList>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                    Why This Match:
                  </Typography>
                  {matchReasons.map((reason, idx) => (
                    <ListItem 
                      key={idx} 
                      dense 
                      disableGutters 
                      disablePadding 
                      sx={{ mb: 0.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <Check color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={reason} 
                        primaryTypographyProps={{ 
                          variant: 'body2', 
                          color: 'text.secondary' 
                        }} 
                      />
                    </ListItem>
                  ))}
                </MatchReasonsList>
              </Collapse>
            )}

            <Section title="🎓 Education">
              <Typography variant="body2">{educationText}</Typography>
            </Section>
            
            <Section title="🛠️ Core Skills">
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {skills.slice(0, MAX_SKILLS).map((skill, index) => (
                  <DetailChip key={index}>{skill}</DetailChip>
                ))}
                {skills.length > MAX_SKILLS && (
                  <AndMoreChip>+{skills.length - MAX_SKILLS} more</AndMoreChip>
                )}
              </Stack>
            </Section>

            <Section title="💼 Professional Experience">
              {experience.map((job, index) => {
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
                {languages.map((lang, index) => (
                  <DetailChip key={index}>{lang}</DetailChip>
                ))}
              </Stack>
            </Section>

            <Section title="🏆 Certifications">
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {certifications.slice(0, MAX_CERTS).map((cert, index) => (
                  <DetailChip key={index}>{cert}</DetailChip>
                ))}
                {certifications.length > MAX_CERTS && (
                  <AndMoreChip>+{certifications.length - MAX_CERTS} more</AndMoreChip>
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