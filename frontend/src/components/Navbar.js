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
  Divider,
  useScrollTrigger,
  Slide
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import { supabase } from '../supabaseClient';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(anchorEl);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
  ];

  const handleMobileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setUserRole(user.user_metadata?.role || 'candidate');
      } else {
        setUser(null);
        setUserRole(null);
      }
    };
    fetchUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserRole(session.user.user_metadata?.role || 'candidate');
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
          borderRadius: 3,
          boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255,255,255,0.8)',
          '& .MuiMenuItem-root': {
            py: 1.5,
            px: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.05)'
            }
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
        {user ? (
          <>
            <Button
              fullWidth
              variant="contained"
              component={Link}
              to="/profile"
              onClick={handleMobileMenuClose}
              sx={{
                mb: 1,
                background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
                color: 'white',
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(86, 61, 142, 0.3)'
                }
              }}
            >
              Profile
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                handleMobileMenuClose();
                handleLogout();
              }}
              sx={{
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              fullWidth
              variant="text"
              onClick={() => {
                handleMobileMenuClose();
                navigate('/login');
              }}
              sx={{
                mb: 1,
                fontWeight: 600,
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'primary.dark'
                }
              }}
            >
              Login
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                handleMobileMenuClose();
                navigate('/signup');
              }}
              sx={{
                background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
                color: 'white',
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(86, 61, 142, 0.3)'
                }
              }}
            >
              Sign Up
            </Button>
          </>
        )}
      </Box>
    </Menu>
  );

  return (
    <HideOnScroll>
      <AppBar 
        position="sticky"
        elevation={0}
        sx={{ 
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 1200,
          transition: 'all 0.3s ease'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1.5 }}>
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                mr: 4,
                '&:hover': {
                  opacity: 0.9
                }
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #553d8e 0%, #9ba2c2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}
              >
                ResumeRec
              </Typography>
            </Box>

            {/* Desktop Links */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              gap: 2,
              alignItems: 'center',
              ml: 4
            }}>
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  component={Link}
                  to={link.path}
                  sx={{
                    color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                    fontWeight: location.pathname === link.path ? 600 : 500,
                    textTransform: 'none',
                    fontSize: '1rem',
                    position: 'relative',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent',
                      '&::after': {
                        width: '100%'
                      }
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -2,
                      left: 0,
                      width: location.pathname === link.path ? '100%' : '0',
                      height: '2px',
                      backgroundColor: 'primary.main',
                      transition: 'width 0.3s ease'
                    }
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Auth Buttons */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              gap: 2, 
              alignItems: 'center'
            }}>
              {user && userRole === 'recruiter' && (
                <Button
                  color="primary"
                  variant="text"
                  onClick={() => navigate('/recommend')}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'primary.dark'
                    }
                  }}
                >
                  Find Candidates
                </Button>
              )}
              {user ? (
                <>
                  <Button
                    color="primary"
                    variant="text"
                    onClick={() => navigate('/profile')}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: 'primary.dark'
                      }
                    }}
                  >
                    Profile
                  </Button>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={handleLogout}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText'
                      }
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="primary"
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: 'primary.dark'
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => navigate('/signup')}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        backgroundColor: 'primary.dark'
                      }
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>

            {/* Mobile Menu */}
            <IconButton
              size="large"
              edge="end"
              color="primary"
              onClick={handleMobileMenuOpen}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
        {renderMobileMenu}
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;