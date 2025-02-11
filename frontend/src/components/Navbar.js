// components/Navbar.js
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: isScrolled ? 'rgba(159,158,192,255)' : 'transparent', // Transparent initially, slightly transparent light purple when scrolled
        boxShadow: 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ py: 2 }}>
        <Typography
          variant="h4"
          component={motion.div}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            color: '#FFFFFF',
          }}
        >
          ResumeRec
        </Typography>

        <Box sx={{ display: 'flex', gap: 4 }}>
          <Button component={Link} to="/" sx={{ color: '#FFFFFF', '&:hover': { color: 'primary.dark' } }}>Home</Button>
          <Button component={Link} to="/recommend" sx={{ color: '#FFFFFF', '&:hover': { color: 'primary.dark' } }}>Recommend</Button>
          <Button component={Link} to="/upload" sx={{ color: '#FFFFFF', '&:hover': { color: 'primary.dark' } }}>Upload</Button>
          <Button component={Link} to="/login" sx={{ color: '#FFFFFF', '&:hover': { color: 'primary.dark' } }}>Login</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
