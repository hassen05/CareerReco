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

// Real Team Members
const teamMembers = [
  {
    name: "Amira Chérif",
    role: "UI/UX Designer",
    image: "/team/amira.jpg",
    bio: "Creative designer responsible for the visual interface and user experience of the platform."
  },
  {
    name: "Hassen Ben Ameur",
    role: "Backend Developer",
    image: "/team/hassen.jpg",
    bio: "In charge of server-side logic, APIs, and database management for scalable performance."
  },
  {
    name: "Meriem Zouid",
    role: "Machine Learning Engineer",
    image: "/team/meriem.jpg",
    bio: "Developed and trained ranking algorithms that power the intelligent CV evaluation engine."
  },
  {
    name: "Mohamed Ali Bouzir",
    role: "QA & Testing Lead",
    image: "/team/mohamed.jpg",
    bio: "Ensured platform stability, functionality, and performance through iterative testing cycles."
  },
  {
    name: "Omar Bacha",
    role: "Project Manager & Group Creator",
    image: "/team/omar.jpg",
    bio: "Led the Career Center Platform project, overseeing planning, coordination, and execution."
  },
  {
    name: "Yazid Slim",
    role: "Frontend Developer",
    image: "/team/yazid.jpg",
    bio: "Implemented responsive and dynamic user interfaces using modern web technologies."
  }
];

// Company values
const values = [
  {
    title: "Innovation",
    icon: "💡",
    description: "Pushing boundaries in AI-driven recruitment and user-centered design."
  },
  {
    title: "Fairness",
    icon: "⚖️",
    description: "Building technology that promotes unbiased and inclusive hiring decisions."
  },
  {
    title: "Privacy",
    icon: "🔒",
    description: "Ensuring data protection and confidentiality at every stage of the recruitment process."
  },
  {
    title: "Excellence",
    icon: "🌟",
    description: "Delivering top-tier solutions that empower recruiters and job seekers alike."
  },
];

const AboutUs = () => {
  return (
    <Box>
      <PageHero 
        title="About Us"
        subtitle="The team behind the Career Center Platform – Innovating how hiring works"
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
              We are the minds behind the Career Center Platform — an AI-powered recruitment solution designed
              to reduce hiring bias, streamline CV ranking, and accelerate the hiring process. Through the CRYSPDM methodology,
              our team has delivered a smart and efficient tool that transforms how recruiters find the right talent.
            </Typography>
          </Box>
        </motion.div>

        {/* Values Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {values.map((value) => (
            <Grid item xs={12} sm={6} md={3} key={value.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
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
            {teamMembers.map((member) => (
              <Grid item xs={12} md={4} key={member.name}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
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
                        alt={member.name}
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
