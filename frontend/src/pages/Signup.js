import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  TextField, 
  Box, 
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  Link,
  FormControl,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { motion } from 'framer-motion';
import { alpha, styled } from '@mui/material/styles';
import { Visibility, VisibilityOff, Email, Lock, Business, Person, Google, GitHub } from '@mui/icons-material';
import PageHero from '../components/PageHero';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: alpha(theme.palette.background.default, 0.8),
    transition: 'all 0.3s ease',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.default, 0.95),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.background.default, 1),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
    }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  },
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.default, 0.95),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  '&.Mui-focused': {
    backgroundColor: alpha(theme.palette.background.default, 1),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
  }
}));

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    planType: 'basic'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Subscribing with:', formData);
  };

  return (
    <Box>
      <PageHero 
        title="Get Started Today" 
        subtitle="Join thousands of professionals using AI-powered recruitment"
        image="/SubscribeHeader.jpg"
      />

      <Container maxWidth="sm" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: (theme) => `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
              boxShadow: (theme) => `0 10px 40px -10px ${alpha(theme.palette.primary.main, 0.2)}`,
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            }}
          >
            {/* Social Login Buttons */}
            <Box sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Google />}
                sx={{
                  mb: 2,
                  py: 1.5,
                  borderRadius: 3,
                  borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                  backgroundColor: '#fff',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#f8f8f8',
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                  }
                }}
              >
                Continue with Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHub />}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                  backgroundColor: '#fff',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#f8f8f8',
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                  }
                }}
              >
                Continue with GitHub
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                OR
              </Typography>
            </Divider>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <StyledTextField
                  label="First Name"
                  name="firstName"
                  fullWidth
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <StyledTextField
                  label="Last Name"
                  name="lastName"
                  fullWidth
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Box>

              <StyledTextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <StyledTextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth>
                <StyledSelect
                  value={formData.planType}
                  name="planType"
                  onChange={handleChange}
                >
                  <MenuItem value="basic">Basic Plan - $99/month</MenuItem>
                  <MenuItem value="pro">Pro Plan - $199/month</MenuItem>
                  <MenuItem value="enterprise">Enterprise Plan - Custom</MenuItem>
                </StyledSelect>
                <FormHelperText>Select your subscription plan</FormHelperText>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                Start Free Trial
              </Button>

              <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                By signing up, you agree to our Terms of Service and Privacy Policy
              </Typography>

              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Already have an account?
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Link 
                  href="/login" 
                  sx={{ 
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign in here
                </Link>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Signup;
