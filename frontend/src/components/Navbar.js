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

  const candidateLinks = [
    { label: "Home", path: "/" },
    { label: "Upload Resume", path: "/upload" },
    { label: "My Profile", path: "/profile" },
  ];

  const recruiterLinks = [
    { label: "Find Candidates", path: "/recommend" },
    { label: "View Database", path: "/candidates" },
  ];

  return (
    <AppBar 
      position="fixed" 
      elevation={isScrolled ? 2 : 0}
      sx={{ 
        backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
        transition: 'all 0.3s ease',
        backdropFilter: isScrolled ? 'blur(8px)' : 'none',
        height: '64px',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: '64px !important',
            py: 0,
            gap: 1.5
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h5"
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
                fontSize: '1.5rem',
              }}
            >
              Recruiter.ai
            </Typography>
          </motion.div>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ 
            display: 'flex', 
            gap: 0.75,
            alignItems: 'center'
          }}>
            {/* Candidate Links */}
            {candidateLinks.map((link) => (
              <NavButton 
                key={link.path}
                to={link.path} 
                label={link.label} 
                scrollProgress={scrollProgress} 
              />
            ))}

            {/* Divider */}
            <Box 
              sx={{ 
                height: 20,
                width: 1,
                bgcolor: scrollProgress > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                my: 'auto',
                mx: 1.5
              }} 
            />

            {/* Recruiter Links */}
            {recruiterLinks.map((link) => (
              <NavButton 
                key={link.path}
                to={link.path} 
                label={link.label} 
                scrollProgress={scrollProgress} 
              />
            ))}

            {/* Auth Buttons */}
            <Button
              component={Link}
              to="/login"
              size="small"
              sx={{
                color: scrollProgress > 0.5 ? '#2C3E50' : '#fff',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                py: 1.5,
                fontWeight: 500,
              }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/signup"
              variant="contained"
              size="small"
              sx={{
                background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
                color: 'white',
                fontWeight: 600,
                py: 0.75,
                px: 2.5,
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: scrollProgress > 0.5 
                  ? '0 4px 12px rgba(85, 61, 142, 0.2)' 
                  : '0 4px 12px rgba(255, 255, 255, 0.2)',
                border: scrollProgress > 0.5 
                  ? 'none'
                  : '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a3579 0%, #8a91b0 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: scrollProgress > 0.5 
                    ? '0 6px 16px rgba(85, 61, 142, 0.25)' 
                    : '0 6px 16px rgba(255, 255, 255, 0.25)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Sign Up Free
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
    size="small"
    sx={{
      color: scrollProgress > 0.5 ? '#2C3E50' : '#fff',
      fontWeight: 500,
      position: 'relative',
      transition: 'color 0.3s ease',
      py: 0.5,
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '0%',
        height: '2px',
        bottom: -2,
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
