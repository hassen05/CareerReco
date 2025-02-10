import React, { useState } from 'react';
import { Container, Typography, Button, TextField, Box } from '@mui/material';

function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    alert(`Logging in with: ${credentials.email}`);
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Login
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          name="email"
          variant="outlined"
          fullWidth
          onChange={handleChange}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          variant="outlined"
          fullWidth
          onChange={handleChange}
        />
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
      </Box>
    </Container>
  );
}

export default LoginPage;
