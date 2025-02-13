// components/PageHero.js
import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';

const PageHero = ({ title, subtitle, image = '/PageHeader.jpg', titleColor = 'white', subtitleColor = 'white' }) => {
  return (
    <Box sx={{
      height: { xs: 300, md: 400 },
      display: 'flex',
      alignItems: 'center',
      background: `url(${image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h2" gutterBottom sx={{ color: titleColor }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="h5" sx={{ color: subtitleColor }}>
              {subtitle}
            </Typography>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default PageHero;