// components/Navbar.js
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Container } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress (0 to 1) over the first 100px of scroll
      const progress = Math.min(window.scrollY / 100, 1);
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate opacity based on scroll progress
  const bgOpacity = 0.8 * scrollProgress;
  const isScrolled = scrollProgress > 0;

  return (
    <AppBar 
      position="fixed" 
      elevation={isScrolled ? 2 : 0}
      sx={{ 
        backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
        transition: 'all 0.3s ease',
        backdropFilter: isScrolled ? 'blur(8px)' : 'none',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          disableGutters 
          sx={{ 
            py: 1.5,
            gap: 2
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                background: scrollProgress > 0.5
                  ? 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)'
                  : 'linear-gradient(45deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textDecoration: 'none',
                mr: 4
              }}
            >
              Recruiter.ai
            </Typography>
          </motion.div>

          <Box sx={{ flexGrow: 1 }} />

          <Box 
            component={motion.div}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ 
              display: 'flex', 
              gap: 1
            }}
          >
            <NavButton to="/" label="Home" scrollProgress={scrollProgress} />
            <NavButton to="/about" label="About" scrollProgress={scrollProgress} />
            <NavButton to="/upload" label="Upload" scrollProgress={scrollProgress} />
            <NavButton to="/recommend" label="Recommend" scrollProgress={scrollProgress} />
            <NavButton to="/login" label="Login" scrollProgress={scrollProgress} />
            <Button
              component={Link}
              to="/demo"
              variant="contained"
              sx={{
                ml: 2,
                px: 3,
                background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a3579 0%, #8a91b0 100%)',
                },
                boxShadow: isScrolled ? 2 : 'none',
              }}
            >
              Request Demo
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

// Helper component for nav buttons
const NavButton = ({ to, label, scrollProgress }) => (
  <Button
    component={Link}
    to={to}
    sx={{
      color: scrollProgress > 0.5 ? '#2C3E50' : '#fff',
      fontWeight: 500,
      position: 'relative',
      transition: 'color 0.3s ease',
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '0%',
        height: '2px',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
        transition: 'width 0.3s ease',
      },
      '&:hover::after': {
        width: '80%',
      },
    }}
  >
    {label}
  </Button>
);

export default Navbar;
