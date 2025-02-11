// components/HomeHero.js
import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HomeHero = () => {
  return (
    <Box sx={{
      height: { xs: '90vh', md: '100vh' },
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: ' url(/header.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      pb: 8
    }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h1" gutterBottom sx={{ 
            mb: 3, 
            maxWidth: 800,
            color: 'white',
            fontWeight: 800,
            lineHeight: 1.2
          }}>
            Smarter Hiring Starts Here
          </Typography>
          
          <Typography variant="h4" sx={{ 
            mb: 4, 
            color: 'rgba(255,255,255,0.9)',
            maxWidth: 600,
            fontWeight: 400
          }}>
            Transform resumes into perfect matches with AI-powered insights
          </Typography>
          
          <Button
            component={Link}
            to="/recommend"
            variant="contained"
            size="large"
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)'
              }
            }}
          >
            Try It Free →
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HomeHero;