import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ResumeRecommender from './pages/ResumeRecommender';
import UploadPage from './pages/UploadPage';
import Footer from './components/Footer';
import AboutUs from './pages/AboutUs';
import RoleSelection from './pages/RoleSelection';
import CandidateSignup from './pages/CandidateSignup';
import RecruiterSignup from './pages/RecruiterSignup';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recommend" element={<ResumeRecommender />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/signup" element={<RoleSelection />} />
        <Route path="/signup/candidate" element={<CandidateSignup />} />
        <Route path="/signup/recruiter" element={<RecruiterSignup />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
