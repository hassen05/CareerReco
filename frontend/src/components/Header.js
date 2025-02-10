// src/components/Header.js
import React from 'react';
import { AppBar, Toolbar, Tabs, Tab, Box, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const currentTab = ['/', '/recommend', '/upload', '/login'].indexOf(location.pathname);

  return (
    <Box sx={{ 
      backgroundImage: `url(${process.env.PUBLIC_URL}/header.jpeg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white',
      boxShadow: 3,
      mb: 4
    }}>
      <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Toolbar sx={{ 
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backdropFilter: 'blur(2px)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}>
          <Typography 
            variant="h2" 
            sx={{ 
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              mb: 2,
              textAlign: 'center'
            }}
          >
            Resume Recommender
          </Typography>
          <Tabs 
            value={currentTab} 
            textColor="inherit"
            sx={{
              '.MuiTabs-indicator': {
                backgroundColor: 'white',
                height: 3
              }
            }}
          >
            <Tab 
              label="Home" 
              component={Link} 
              to="/" 
              sx={{ 
                fontSize: '1.1rem',
                '&:hover': { color: 'white !important' } 
              }}
            />
            <Tab 
              label="Recommend" 
              component={Link} 
              to="/recommend" 
              sx={{ 
                fontSize: '1.1rem',
                '&:hover': { color: 'white !important' } 
              }}
            />
            <Tab 
              label="Upload" 
              component={Link} 
              to="/upload" 
              sx={{ 
                fontSize: '1.1rem',
                '&:hover': { color: 'white !important' } 
              }}
            />
            <Tab 
              label="Profile" 
              component={Link} 
              to="/login" 
              sx={{ 
                fontSize: '1.1rem',
                '&:hover': { color: 'white !important' } 
              }}
            />
          </Tabs>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Header; // Ensure this line is present