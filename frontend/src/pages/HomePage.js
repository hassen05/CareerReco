import React from 'react';
import { Container, Box, Typography, Grid, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import HomeHero from '../components/HomeHero';
import { CheckCircleOutline } from '@mui/icons-material';

const HomePage = () => {
  const features = [
    {
      title: "For Job Seekers",
      description: "Create your professional profile and let AI match you with the perfect opportunities.",
      icon: "👤",
      gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
      items: [
        "Free resume upload",
        "AI-powered job matching",
        "Professional profile creation",
        "Increased visibility to recruiters"
      ]
    },
    {
      title: "For Recruiters",
      description: "Access our extensive database of candidates and find the perfect match using AI.",
      icon: "🎯",
      gradient: "linear-gradient(135deg, #4ECDC4 0%, #556270 100%)",
      items: [
        "Advanced candidate search",
        "AI-powered recommendations",
        "Large talent database",
        "Quick candidate matching"
      ]
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <HomeHero />
      
      {/* User Type Section */}
      <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Box sx={{
                    p: 4,
                    borderRadius: 4,
                    background: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    }
                  }}>
                    <Box sx={{
                      fontSize: '3rem',
                      mb: 2
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                      {feature.description}
                    </Typography>
                    <List>
                      {feature.items.map((item, idx) => (
                        <ListItem key={idx} sx={{ p: 0, mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleOutline sx={{ color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        mt: 3,
                        background: feature.gradient,
                        '&:hover': {
                          background: feature.gradient,
                          filter: 'brightness(0.9)'
                        }
                      }}
                    >
                      {feature.title === "For Job Seekers" ? "Upload Resume" : "Start Recruiting"}
                    </Button>
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
