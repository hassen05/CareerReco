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
        subtitle="The team behind QuirkHire – Innovating how hiring works"
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
              At QuirkHire, we're revolutionizing talent acquisition through advanced AI technology. Our mission is to create a 
              world where every candidate finds their ideal career path, and every employer discovers perfect-fit talent. 
              By combining natural language processing with innovative LLM technology, we've built a recommendation system that 
              understands the nuances of skills, experiences, and cultural fit beyond simple keyword matching.
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
{/* What Makes Us Different Section */}
<Box sx={{ mt: 8 }}>
          <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
            What Makes Us Different
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            QuirkHire stands out by blending advanced AI with a deep commitment to fairness and transparency in hiring. We don’t just match keywords—we understand context, potential, and the unique qualities that make every candidate and employer different.
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            <ul style={{ textAlign: 'left', margin: '16px auto', maxWidth: 500 }}>
              <li><strong>Hybrid Intelligence:</strong> Combining NLP and LLMs for unmatched accuracy and insight</li>
              <li><strong>Explainable AI:</strong> Transparent recommendations with clear, actionable reasoning</li>
              <li><strong>User-Centric Design:</strong> Built for both job seekers and recruiters, with intuitive workflows</li>
              <li><strong>Commitment to Inclusion:</strong> Promoting diversity and equal opportunity in every match</li>
              <li><strong>Continuous Innovation:</strong> Always evolving to deliver smarter, more meaningful connections</li>
            </ul>
            QuirkHire is more than a tool—it's your partner in building better careers and teams.
          </Typography>
        </Box>        
      </Container>
    </Box>
  );
};

export default AboutUs;
