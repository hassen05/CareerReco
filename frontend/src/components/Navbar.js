// components/Navbar.js
import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  Container,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(anchorEl);

  const handleMobileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Find Candidates", path: "/recommend" },
    { label: "Upload Resume", path: "/upload" },
    { label: "About", path: "/about" },
    { label: "Sign Up", path: "/signup" }
  ];

  const renderMobileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: {
          mt: 1,
          minWidth: 200,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          '& .MuiMenuItem-root': {
            py: 1.5,
            px: 3,
          }
        }
      }}
    >
      {navLinks.map((link) => (
        <MenuItem
          key={link.path}
          component={Link}
          to={link.path}
          onClick={handleMobileMenuClose}
          sx={{
            color: location.pathname === link.path ? 'primary.main' : 'text.primary',
            fontWeight: location.pathname === link.path ? 600 : 500
          }}
        >
          {link.label}
        </MenuItem>
      ))}
      <Divider sx={{ my: 1 }} />
      <Box sx={{ px: 2, py: 1 }}>
        <Button
          fullWidth
          variant="contained"
          component={Link}
          to="/signup"
          sx={{
            background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
            color: 'white',
            fontWeight: 600,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              background: 'linear-gradient(45deg, #4a3579 0%, #8a91b0 100%)'
            }
          }}
        >
          Sign Up Free
        </Button>
      </Box>
    </Menu>
  );

  return (
    <AppBar 
      position="sticky"
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        zIndex: 1200
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textDecoration: 'none',
              mr: 4
            }}
          >
            ResumeRec
          </Typography>

          {/* Desktop Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navLinks.map((link) => (
              <Button
                key={link.path}
                component={Link}
                to={link.path}
                sx={{
                  color: location.pathname === link.path ? 'primary.main' : 'text.primary',
                  fontWeight: location.pathname === link.path ? 600 : 500,
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Auth Buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            <Button
              component={Link}
              to="/login"
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/signup"
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a3579 0%, #8a91b0 100%)'
                }
              }}
            >
              Sign Up Free
            </Button>
          </Box>

          {/* Mobile Menu */}
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={handleMobileMenuOpen}
            sx={{ display: { md: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>
      {renderMobileMenu}
    </AppBar>
  );
};

export default Navbar;
