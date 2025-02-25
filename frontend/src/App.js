import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import CompleteProfilePage from './pages/CompleteProfilePage';
import CreateResumePage from './pages/CreateResumePage';
import EditProfilePage from './pages/EditProfilePage';
import { supabase } from './supabaseClient';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && location.hash.includes('type=email')) {
        navigate('/complete-profile');
      }
    };
    handleAuthRedirect();
  }, [location, navigate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/recommend" 
          element={
            <ProtectedRoute requiredRole="recruiter">
              <ResumeRecommender />
            </ProtectedRoute>
          }
        />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/signup" element={<RoleSelection />} />
        <Route path="/signup/candidate" element={<CandidateSignup />} />
        <Route path="/signup/recruiter" element={<RecruiterSignup />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/edit" 
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/complete-profile" 
          element={
            <ProtectedRoute>
              <CompleteProfilePage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/resume/create" 
          element={
            <ProtectedRoute>
              <CreateResumePage />
            </ProtectedRoute>
          }
        />
        
      </Routes>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
