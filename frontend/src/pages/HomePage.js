import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Grid, styled } from '@mui/material';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  overflow: 'hidden',
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: theme.shadows[3],
  textAlign: 'center',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const ParticlesBackground = () => {
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  return (
    <Particles
      init={particlesInit}
      options={{
        particles: {
          number: { value: 50 },
          color: { value: '#7C4DFF' },
          opacity: { value: 0.5 },
          size: { value: 3 },
          move: { enable: true, speed: 1 },
        },
      }}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  );
};

function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Smart Recommendations',
      description: 'Get the best resumes matched to your job description using advanced AI.',
      icon: '📊',
    },
    {
      title: 'Easy to Use',
      description: 'Intuitive interface designed for recruiters and hiring managers.',
      icon: '🖥️',
    },
    {
      title: 'Customizable Filters',
      description: 'Filter resumes by experience, skills, education, and more.',
      icon: '🔍',
    },
  ];

  return (
    <Box>
      <HeroSection>
        <ParticlesBackground />
        <Container>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <Typography variant="h1" gutterBottom>
              Next-Gen Talent Acquisition
            </Typography>
            <Typography variant="h4" sx={{ mb: 4 }}>
              AI-powered resume matching with <Box component="span" color="primary.main">95% accuracy</Box>
            </Typography>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/recommender')}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  background: `linear-gradient(45deg, #7C4DFF 30%, #00E5FF 90%)`,
                }}
              >
                Start Matching →
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </HeroSection>

      <Box sx={{ py: 10, position: 'relative' }}>
        <Container>
          <Grid container spacing={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <FeatureCard>
                    <Typography variant="h3" sx={{ mb: 2 }}>
                      {feature.icon}
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1">{feature.description}</Typography>
                  </FeatureCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;