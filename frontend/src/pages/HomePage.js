import React from 'react';
import { Container, Box, Typography, Grid, Button } from '@mui/material';
import { motion } from 'framer-motion';
import HomeHero from '../components/HomeHero';

const HomePage = () => {
  const features = [
    {
      title: "AI-Powered Matching",
      description: "Our advanced AI algorithms analyze resumes with 99% accuracy, understanding context, skills, and experience to find your perfect candidates.",
      icon: "🧠",
      gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)"
    },
    {
      title: "Smart Filtering System",
      description: "Filter candidates by skills, experience, location, and more with our intelligent ranking system that learns from your preferences.",
      icon: "🎯",
      gradient: "linear-gradient(135deg, #4ECDC4 0%, #556270 100%)"
    },
    {
      title: "Real-time Analytics",
      description: "Get instant insights with our powerful analytics dashboard. Compare candidates, track hiring metrics, and make data-driven decisions.",
      icon: "📊",
      gradient: "linear-gradient(135deg, #6C63FF 0%, #3F3D56 100%)"
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <HomeHero />
      
      {/* Enhanced Features Section */}
      <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" sx={{ 
              textAlign: 'center', 
              mb: 2,
              fontWeight: 700,
              color: 'primary.main'
            }}>
              Why Choose Us?
            </Typography>
            <Typography variant="h6" sx={{ 
              textAlign: 'center', 
              mb: 8,
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto'
            }}>
              Revolutionize your hiring process with our cutting-edge AI technology
            </Typography>
          </motion.div>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <Box sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    background: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      '& .feature-icon': {
                        transform: 'scale(1.1)',
                      }
                    }
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: feature.gradient
                    }} />
                    <Box className="feature-icon" sx={{
                      fontSize: '3rem',
                      mb: 2,
                      transition: 'transform 0.3s ease'
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Demo Section */}
      <Box sx={{ 
        py: 12, 
        background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/path/to/pattern.svg")', // Add a subtle pattern overlay
          opacity: 0.1
        }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography variant="h3" sx={{ 
                  mb: 3, 
                  color: 'white',
                  fontWeight: 700,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -10,
                    left: 0,
                    width: 80,
                    height: 4,
                    background: 'linear-gradient(90deg, #fff, transparent)',
                    borderRadius: 2
                  }
                }}>
                  See It in Action
                </Typography>
                <Typography variant="h6" sx={{ 
                  mb: 4,
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: 1.8
                }}>
                  Watch how our AI-powered platform streamlines your recruitment process, 
                  saving you hours of manual resume screening and helping you find the 
                  perfect candidates faster than ever.
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)'
                    }
                  }}
                >
                  Watch Demo
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box sx={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  position: 'relative',
                  pt: '56.25%', // 16:9 aspect ratio
                  background: '#1a1a1a'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2,
                    color: 'white'
                  }}>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Demo Coming Soon!
                      </Typography>
                    </motion.div>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      We're putting the finishing touches on something amazing
                    </Typography>
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
                background: 'linear-gradient(45deg, #b69ac1 0%, #c7dde7 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
                }
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
