// ... existing imports ...
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Button, List, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import HomeHero from '../components/HomeHero';
import { CheckCircleOutline } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

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
      ],
      cta: "Upload Resume"
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
      ],
      cta: "Start Recruiting"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Successful Matches" },
    { value: "95%", label: "Candidate Satisfaction" },
    { value: "3x", label: "Faster Hiring" },
    { value: "50+", label: "Industries Served" }
  ];

  const testimonials = [
    {
      quote: "ResumeRec has completely transformed our hiring process. The AI matching is incredibly accurate and has saved us countless hours.",
      name: "John Doe",
      role: "HR Manager, TechCorp",
      avatar: "/path/to/avatar1.jpg"
    },
    {
      quote: "As a job seeker, ResumeRec helped me find the perfect role that matched my skills and career goals.",
      name: "Jane Smith",
      role: "Software Engineer",
      avatar: "/path/to/avatar2.jpg"
    },
    {
      quote: "The platform's intuitive interface and powerful matching algorithm have made recruitment a breeze for our team.",
      name: "Michael Johnson",
      role: "Talent Acquisition Lead",
      avatar: "/path/to/avatar3.jpg"
    },
    {
      quote: "I was amazed by how quickly ResumeRec connected me with relevant job opportunities. It's a game-changer!",
      name: "Sarah Williams",
      role: "Data Scientist",
      avatar: "/path/to/avatar4.jpg"
    }
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <HomeHero />
      
      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* User Type Section */}
      <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ 
            textAlign: 'center',
            mb: 8,
            fontWeight: 700,
            color: 'primary.main'
          }}>
            Designed for Everyone
          </Typography>
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
                      {feature.cta}
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
          background: 'url("/path/to/pattern.svg")',
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
            p:8, 
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

      {/* Testimonials Section */}
      <Box sx={{ 
        py: { xs: 8, md: 15 },
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '120%',
          height: '40%',
          background: 'linear-gradient(45deg, #553d8e22 0%, #9ba2c222 100%)',
          transform: 'rotate(-4deg)',
          zIndex: 0
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '120%',
          height: '40%',
          background: 'linear-gradient(45deg, #553d8e11 0%, #9ba2c211 100%)',
          transform: 'rotate(8deg)',
          zIndex: 0
        }
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            position: 'relative', 
            zIndex: 1,
            textAlign: 'center',
            mb: { xs: 6, md: 10 }
          }}>
            <Typography variant="h3" sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', md: '3rem' },
              lineHeight: 1.2,
              mb: 2,
              background: 'linear-gradient(45deg, #553d8e 30%, #9ba2c2 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: 4,
                background: 'linear-gradient(90deg, #553d8e 0%, #9ba2c2 100%)',
                borderRadius: 2
              }
            }}>
              What Our Users Are Saying
            </Typography>
            <Typography variant="subtitle1" sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.125rem' }
            }}>
              Discover how industry leaders are transforming their hiring processes
            </Typography>
          </Box>

          <Box sx={{
            position: 'relative',
            minHeight: 500,
            perspective: 1000,
            mx: { md: -6 }
          }}>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ 
                  opacity: 0,
                  x: index % 2 ? 100 : -100,
                  rotateY: index % 2 ? 10 : -10,
                  scale: 0.9
                }}
                animate={{ 
                  opacity: index === activeTestimonial ? 1 : 0,
                  x: 0,
                  rotateY: 0,
                  scale: 1
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1],
                  rotateY: { duration: 0.6 }
                }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  top: 0,
                  left: 0
                }}
              >
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'center',
                  gap: 4,
                  p: { md: 4 },
                  position: 'relative'
                }}>
                  {/* Content */}
                  <Box sx={{
                    flex: 1,
                    position: 'relative',
                    p: { xs: 2, md: 4 },
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    boxShadow: '0 32px 64px rgba(0,0,0,0.08)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 40,
                      left: { md: -24 },
                      width: { md: 48 },
                      height: { md: 48 },
                      bgcolor: 'background.paper',
                      transform: 'rotate(45deg)',
                      zIndex: -1
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      mb: 3 
                    }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Typography variant="h4" sx={{ 
                          color: 'white', 
                          lineHeight: 1 
                        }}>
                          “
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700,
                          color: 'text.primary',
                          lineHeight: 1.2
                        }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem'
                        }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h5" sx={{
                      fontWeight: 400,
                      color: 'text.primary',
                      lineHeight: 1.6,
                      position: 'relative',
                      pl: 6,
                      '&::before': {
                        content: '"“"',
                        position: 'absolute',
                        left: 0,
                        top: -8,
                        fontSize: '4rem',
                        color: 'primary.light',
                        fontFamily: 'serif',
                        lineHeight: 1
                      }
                    }}>
                      {testimonial.quote}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}

            {/* Modern Navigation */}
            <Box sx={{ 
              position: 'absolute',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
              display: 'flex',
              gap: 1.5
            }}>
              {testimonials.map((_, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box
                    onClick={() => setActiveTestimonial(index)}
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: index === activeTestimonial ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
                        opacity: index === activeTestimonial ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                      }
                    }}
                  />
                </motion.div>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;