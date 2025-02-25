import React, { useState, useEffect, useCallback } from 'react';
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
import ResumeCard from '../components/ResumeCard.jsx';
import PageHero from '../components/PageHero';

// Debounce function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Scroll-to-top component
function ScrollTop(props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector('#back-to-top-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

function ResumeRecommender() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [topN, setTopN] = useState(5);
  const debouncedJobDesc = useDebounce(jobDesc, 300);  // 300ms delay

  // Fetch recommendations when debouncedJobDesc changes
  useEffect(() => {
    if (debouncedJobDesc) {
      console.log("Fetching recommendations for:", debouncedJobDesc);  // Debug
      setLoading(true);
      setError(null);

      axios.post("http://localhost:8000/api/recommend/", { 
        job_description: debouncedJobDesc,
        top_n: topN,
      })
        .then((response) => {
          console.log("API Response:", response.data);  // Debug
          setRecommendations(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("API Error:", error);  // Debug
          setError("An error occurred while fetching recommendations.");
          setLoading(false);
        });
    }
  }, [debouncedJobDesc, topN]);

  // Handle search form submission
  const handleSearch = useCallback(({ jobDesc, topN }) => {
    setJobDesc(jobDesc);
    setTopN(topN);
  }, []);

  // Close error alert
  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box>
      {/* Hero Section */}
      <PageHero 
        title="Smart Recommendations" 
        subtitle="Find your perfect candidates with AI-powered matching"
        image="/PageHeader.jpg"
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
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
            <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        )}

        {/* Recommendations */}
        <Grid container spacing={4}>
          {recommendations.map((resume, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <ResumeCard resume={resume} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Scroll-to-top Button */}
      <ScrollTop>
        <Fab color="primary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </Box>
  );
}

export default ResumeRecommender;