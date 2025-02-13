import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  CircularProgress, 
  Alert, 
  Snackbar, 
  Grid, 
  Box,
  Fab,
  useScrollTrigger,
  Zoom,
  Fade
} from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material'; // Import scroll-to-top icon
import SearchForm from '../components/SearchForm';
import ResumeCard from '../components/ResumeCard';
import PageHero from '../components/PageHero';

function ResumeRecommender() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Scroll-to-top functionality
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleSearch = async ({ jobDesc, topN }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/api/recommend/', {
        job_description: jobDesc,
        top_n: topN
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('API Error:', error);
      setError(error.response?.data?.message || 'An error occurred while fetching recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Box>
      {/* Hero Section */}
      <PageHero 
        
        title="Smart Recommendations" 
        subtitle="Find your perfect candidates with AI-powered matching"
        image="/PageHeader.jpg"
        gradientStart="rgb(250, 250, 250)"
        gradientEnd="rgba(219, 13, 51, 0.7)"
        titleColor="white"  // Custom prop (if supported)
        subtitleColor="white"  // Custom prop (if supported)
       
      
      />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Search Form */}
        <Box sx={{ mb: 6 }}>
          <SearchForm onSubmit={handleSearch} />
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 200,
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
            <Typography variant="body1" color="text.secondary">
              Analyzing resumes with AI...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={handleCloseError}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseError} 
              severity="error" 
              sx={{ 
                width: '100%', 
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              {error}
            </Alert>
          </Snackbar>
        )}

        {/* Results Section */}
        {!loading && recommendations.length > 0 && (
          <Box>
            <Typography variant="h4" sx={{ 
              mb: 6,
              fontWeight: 700,
              color: 'primary.main',
              textAlign: 'center'
            }}>
              Top Matches
            </Typography>
            <Grid container spacing={4}>
              {recommendations.map((resume) => (
                <Grid item xs={12} sm={6} md={4} key={resume.id}>
                  <Fade in timeout={500}>
                    <Box sx={{ 
                      height: '100%',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-8px)' }
                    }}>
                      <ResumeCard resume={resume} />
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Empty State */}
        {!loading && recommendations.length === 0 && !error && (
          <Box sx={{ 
            textAlign: 'center', 
            p: 8, 
            borderRadius: 4,
            bgcolor: 'background.paper',
            boxShadow: 3
          }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
              🕵️ No matches found yet...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search criteria or use broader terms
            </Typography>
          </Box>
        )}
      </Container>

      {/* Scroll-to-top Button */}
      <Zoom in={trigger}>
        <Box
          onClick={scrollToTop}
          role="presentation"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
          }}
        >
          <Fab 
            color="primary" 
            size="medium" 
            aria-label="scroll back to top"
            sx={{
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </Box>
      </Zoom>
    </Box>
  );
}

export default ResumeRecommender;