import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, AppBar, Tabs, Tab, Box } from '@mui/material';
import HomePage from './pages/HomePage';
import ResumeRecommender from './pages/ResumeRecommender';
import UploadPage from './pages/UploadPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <AppBar position="static" color="default">
          <Tabs centered>
            <Tab label="Home" component={Link} to="/" />
            <Tab label="Resume Recommender" component={Link} to="/recommender" />
            <Tab label="Upload Resume" component={Link} to="/upload" />
            <Tab label="Login" component={Link} to="/login" />
          </Tabs>
        </AppBar>

        <Box sx={{ mt: 3 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recommender" element={<ResumeRecommender />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
}

export default App;
