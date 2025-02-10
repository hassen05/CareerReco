import React, { useState } from 'react';
import axios from 'axios';
import SearchForm from '../components/SearchForm';
import ResumeCard from '../components/ResumeCard';
import { Container, Typography, CircularProgress, Alert, Snackbar, Grid, Box } from '@mui/material';
import { Fade } from '@mui/material';


function ResumeRecommender() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        Resume Recommender
      </Typography>

      <SearchForm onSubmit={handleSearch} />

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <CircularProgress sx={{ color: '#5e35b1' }} />
        </div>
      )}

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%', borderRadius: 2 }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {!loading && recommendations.length > 0 && (
        <div>
          <Typography variant="h5" sx={{ mt: 4, fontWeight: 'bold' }}>
            Top Matches
          </Typography>
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {recommendations.map((resume) => (
              <Grid item xs={12} sm={6} md={4} key={resume.id}>
                <Fade in timeout={500}>
                  <Box sx={{ boxShadow: 2, borderRadius: 2, backgroundColor: 'transparent' }}>
                    <ResumeCard resume={resume} />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </div>
      )}

      {!loading && recommendations.length === 0 && !error && (
        <Typography variant="body1" sx={{ mt: 4, textAlign: 'center' }}>
          No recommendations found. Try a different search!
        </Typography>
      )}
    </Container>
  );
}

export default ResumeRecommender;
