// components/PageHero.js
import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';

const PageHero = ({ title, subtitle, image }) => {
  return (
    <Box sx={{
      height: { xs: 300, md: 400 },
      display: 'flex',
      alignItems: 'center',
      background: `linear-gradient(45deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%), url(${image || '/default-header.png'})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Typography variant="h2" gutterBottom>{title}</Typography>
          {subtitle && <Typography variant="h5" color="text.secondary">{subtitle}</Typography>}
        </motion.div>
      </Container>
    </Box>
  );
};

export default PageHero;