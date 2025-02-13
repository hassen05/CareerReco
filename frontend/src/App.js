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
import Signup from './pages/Signup';


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
        <Route path="/Signup" element={<Signup />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
