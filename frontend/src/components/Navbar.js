import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Slide,
  Toolbar,
  Typography,
  useScrollTrigger,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { AccountCircle, Notifications, WorkOutline } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// Hide AppBar on scroll
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
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Primary navigation links
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
  ];
  
  // Add recruiter-specific links
  const recruiterLinks = userRole === 'recruiter' ? [
    { label: "Find Candidates", path: "/recommend" }
  ] : [];
  
  // Combine all navigation links
  const allLinks = [...navLinks, ...recruiterLinks];

  // Fetch user data and set up auth listener
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

  // Handle auth actions
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      setProfileMenuAnchor(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Menu handlers
  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };
  
  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  // Style constants
  const buttonStyle = {
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.95rem',
    borderRadius: 2,
    px: 2,
    py: 0.8,
    transition: 'all 0.2s ease'
  };

  // Mobile Menu
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchor}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMobileMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1.5,
          minWidth: 200,
          borderRadius: 2,
          overflow: 'visible',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95))',
          backdropFilter: 'blur(10px)',
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 20,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {allLinks.map((link) => (
        <MenuItem
          key={link.path}
          component={Link}
          to={link.path}
          onClick={handleMobileMenuClose}
          sx={{
            color: location.pathname === link.path ? 'primary.main' : 'text.primary',
            fontWeight: location.pathname === link.path ? 600 : 500,
            py: 1.2,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha('#553d8e', 0.04),
              transform: 'translateX(5px)'
            }
          }}
        >
          {link.label}
        </MenuItem>
      ))}
      
      <Divider sx={{ my: 1.5 }} />
      
      <Box sx={{ px: 2, py: 1.5 }}>
        {user ? (
          <>
            <Button
              fullWidth
              variant="contained"
              component={Link}
              to="/profile"
              onClick={handleMobileMenuClose}
              sx={{
                mb: 1.5,
                background: 'linear-gradient(45deg, #553d8e 10%, #9575cd 90%)',
                color: 'white',
                fontWeight: 600,
                py: 1.2,
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(149, 117, 205, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(149, 117, 205, 0.4)'
                }
              }}
            >
              My Profile
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
                py: 1.2,
                borderRadius: 2,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: alpha('#553d8e', 0.04),
                  borderColor: 'primary.dark',
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
              variant="outlined"
              onClick={() => {
                handleMobileMenuClose();
                navigate('/login');
              }}
              sx={{
                mb: 1.5,
                fontWeight: 600,
                color: 'primary.main',
                borderColor: 'primary.main',
                py: 1.2,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: alpha('#553d8e', 0.04),
                  borderColor: 'primary.dark',
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
                background: 'linear-gradient(45deg, #553d8e 10%, #9575cd 90%)',
                color: 'white',
                fontWeight: 600,
                py: 1.2,
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(149, 117, 205, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(149, 117, 205, 0.4)'
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
  
  // Profile Menu (desktop)
  const renderProfileMenu = (
    <Menu
      anchorEl={profileMenuAnchor}
      open={Boolean(profileMenuAnchor)}
      onClose={handleProfileMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1.5,
          minWidth: 180,
          borderRadius: 2,
          overflow: 'visible',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95))',
          backdropFilter: 'blur(10px)',
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 20,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={() => {
        navigate('/profile');
        handleProfileMenuClose();
      }} sx={{ py: 1.2 }}>
        My Profile
      </MenuItem>
      
      <MenuItem onClick={() => {
        navigate('/settings');
        handleProfileMenuClose();
      }} sx={{ py: 1.2 }}>
        Account Settings
      </MenuItem>
      
      <Divider sx={{ my: 1 }} />
      
      <MenuItem onClick={handleLogout} sx={{ 
        py: 1.2,
        color: 'error.main',
        '&:hover': {
          backgroundColor: alpha('#f44336', 0.04)
        }
      }}>
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <HideOnScroll>
      <AppBar 
        position="sticky" 
        color="default"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.03)',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: { xs: 1, md: 0.5 } }}>
            {/* Logo */}
            <Box component={Link} to="/" sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none'
            }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Typography 
                  variant="h5" 
                  component="div"
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #553d8e 30%, #9575cd 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ResuMatch
                </Typography>
              </motion.div>
            </Box>

            {/* Desktop Links */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              gap: 2,
              alignItems: 'center',
              ml: 4
            }}>
              {allLinks.map((link) => (
                <motion.div
                  key={link.path}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    component={Link}
                    to={link.path}
                    sx={{
                      color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                      fontWeight: location.pathname === link.path ? 600 : 500,
                      textTransform: 'none',
                      fontSize: '1rem',
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: 'primary.main',
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
                      },
                      '&:hover::after': {
                        width: '100%'
                      }
                    }}
                  >
                    {link.label}
                  </Button>
                </motion.div>
              ))}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Auth Section */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              gap: 2, 
              alignItems: 'center'
            }}>
              {user ? (
                <>
                  {/* User is logged in */}
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{ 
                      ml: 2,
                      p: 1,
                      borderRadius: '50%',
                      border: '2px solid transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: alpha('#553d8e', 0.2),
                      }
                    }}
                  >
                    <Avatar 
                      alt={user.email} 
                      src="/avatar-placeholder.jpg"
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: 'primary.main',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {user.email?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </>
              ) : (
                <>
                  {/* User is not logged in */}
                  <motion.div whileHover={{ scale: 1.03 }}>
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => navigate('/login')}
                      sx={{
                        ...buttonStyle,
                        borderColor: alpha('#553d8e', 0.5),
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: alpha('#553d8e', 0.04)
                        }
                      }}
                    >
                      Login
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.03, y: -2 }}>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={() => navigate('/signup')}
                      sx={{
                        ...buttonStyle,
                        background: 'linear-gradient(45deg, #553d8e 10%, #9575cd 90%)',
                        boxShadow: '0 2px 10px rgba(149, 117, 205, 0.3)',
                        '&:hover': {
                          boxShadow: '0 4px 15px rgba(149, 117, 205, 0.4)'
                        }
                      }}
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </>
              )}
            </Box>

            {/* Mobile Menu Toggle */}
            <IconButton
              size="large"
              edge="end"
              onClick={handleMobileMenuOpen}
              color="primary"
              sx={{ 
                display: { md: 'none' },
                ml: 1
              }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
        
        {/* Menus */}
        {renderMobileMenu}
        {renderProfileMenu}
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;