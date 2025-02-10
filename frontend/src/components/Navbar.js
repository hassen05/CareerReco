import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, MenuItem, Box, Typography } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import UploadIcon from '@mui/icons-material/Upload';
import RecommendIcon from '@mui/icons-material/ThumbUp';
import LoginIcon from '@mui/icons-material/Login';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const NavButton = styled(MenuItem)(({ theme }) => ({
  borderRadius: '8px',
  margin: '0 8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-2px)',
  },
}));

function Navbar() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/recommender', label: 'Recommender', icon: <RecommendIcon /> },
    { path: '/upload', label: 'Upload', icon: <UploadIcon /> },
    { path: '/login', label: 'Login', icon: <LoginIcon /> },
  ];

  return (
    <StyledAppBar elevation={0}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mr: 4 }}>
            🔍 Recruiter.ai
          </Typography>
          {links.map((link) => (
            <NavButton
              key={link.path}
              component={Link}
              to={link.path}
              selected={location.pathname === link.path}
              sx={{ color: location.pathname === link.path ? 'primary.main' : 'text.primary' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {link.icon}
                {link.label}
              </Box>
            </NavButton>
          ))}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
}

export default Navbar;