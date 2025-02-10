// pages/HomePage.js
import React from 'react';
import { Container, Box, Typography, Grid, Button } from '@mui/material';
import { motion } from 'framer-motion';
import HomeHero from '../components/HomeHero';

const HomePage = () => {
  const features = [
    {
      title: "AI-Powered Matching",
      description: "Deep learning algorithms that understand context and skills",
      icon: "🤖"
    },
    {
      title: "Smart Filters",
      description: "Dynamic filtering based on your specific needs",
      icon: "🎯"
    },
    {
      title: "Real-time Analysis",
      description: "Instant insights and candidate comparisons",
      icon: "⚡"
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <HomeHero />
      
      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ 
            textAlign: 'center', 
            mb: 6,
            fontWeight: 700,
            color: 'primary.main'
          }}>
            Why Choose Us?
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <Box sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    bgcolor: 'background.default',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}>
                    <Typography variant="h2" sx={{ mb: 2 }}>
                      {feature.icon}
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Demo Section */}
      <Box sx={{ py: 8, background: 'linear-gradient(45deg, #FFB6C1 0%, #FF8FA3 100%)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <Typography variant="h3" sx={{ 
                  mb: 3, 
                  color: 'white',
                  fontWeight: 700
                }}>
                  See It in Action
                </Typography>
                <Typography variant="h6" sx={{ 
                  mb: 4,
                  color: 'rgba(255,255,255,0.9)' 
                }}>
                  Watch how ResumeRec transforms your hiring process
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <Box sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: 6,
                  position: 'relative',
                  pt: '56.25%' // 16:9 aspect ratio
                }}>
                  {/* Add your video embed here */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Typography variant="h4">Video Demo Coming Soon!</Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            p: 8, 
            borderRadius: 4,
            bgcolor: 'background.paper',
            boxShadow: 3
          }}>
            <Typography variant="h3" sx={{ 
              mb: 3,
              fontWeight: 700,
              color: 'primary.main'
            }}>
              Ready to Transform Your Hiring?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
              Join hundreds of companies already using ResumeRec
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Get Started Free
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
export default HomePage;