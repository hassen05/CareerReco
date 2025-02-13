import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Avatar,
  Card,
  Stack,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/system';
import PageHero from '../components/PageHero';

// Team member data
const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    image: "/team/sarah.jpg", // Add actual image paths
    bio: "Former HR executive with 15 years of experience in talent acquisition",
  },
  {
    name: "Michael Chen",
    role: "Chief Technology Officer",
    image: "/team/michael.jpg",
    bio: "AI researcher and full-stack developer with expertise in ML algorithms",
  },
  {
    name: "Emma Williams",
    role: "Head of Product",
    image: "/team/emma.jpg",
    bio: "Product strategist focused on creating intuitive HR tech solutions",
  },
];

// Company values
const values = [
  {
    title: "Innovation",
    icon: "💡",
    description: "Pushing boundaries in AI and recruitment technology"
  },
  {
    title: "Fairness",
    icon: "⚖️",
    description: "Ensuring unbiased and equitable hiring practices"
  },
  {
    title: "Privacy",
    icon: "🔒",
    description: "Maintaining the highest standards of data protection"
  },
  {
    title: "Excellence",
    icon: "🌟",
    description: "Delivering outstanding results for our clients"
  },
];

const AboutUs = () => {
  return (
    <Box>
      <PageHero 
        title="About Us" 
        subtitle="Revolutionizing recruitment through AI innovation"
        image="/AboutUs.jpg"
      />

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ 
            textAlign: 'center',
            maxWidth: 800,
            mx: 'auto',
            mb: 8
          }}>
            <Typography variant="h4" gutterBottom sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              mb: 3
            }}>
              Our Mission
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}>
              At ResumeRec, we're dedicated to transforming the hiring process through 
              cutting-edge AI technology. Our mission is to connect organizations with 
              their ideal candidates while eliminating bias and reducing time-to-hire.
            </Typography>
          </Box>
        </motion.div>

        {/* Values Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {values.map((value, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 4,
                  background: (theme) => `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                  boxShadow: (theme) => `0 10px 40px -10px ${alpha(theme.palette.primary.main, 0.1)}`,
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: (theme) => `0 20px 40px -20px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }
                }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    {value.icon}
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Team Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{ 
            textAlign: 'center',
            fontWeight: 700,
            color: 'primary.main',
            mb: 6
          }}>
            Meet Our Team
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    background: (theme) => `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                    boxShadow: (theme) => `0 10px 40px -10px ${alpha(theme.palette.primary.main, 0.1)}`,
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: (theme) => `0 20px 40px -20px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }
                  }}>
                    <Stack spacing={3} alignItems="center">
                      <Avatar
                        src={member.image}
                        sx={{
                          width: 120,
                          height: 120,
                          border: (theme) => `4px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                          boxShadow: (theme) => `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                      />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                          {member.name}
                        </Typography>
                        <Typography variant="subtitle1" color="primary.main" gutterBottom>
                          {member.role}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          {member.bio}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUs; 