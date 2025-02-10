// components/SearchForm.jsx
import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  styled,
  useTheme,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/system';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(4),
  background: alpha(theme.palette.background.paper, 0.95),
  boxShadow: theme.shadows[6],
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  backdropFilter: 'blur(12px)',
}));

const SearchForm = ({ onSubmit, loading }) => {
  const theme = useTheme();
  const [jobDesc, setJobDesc] = useState('');
  const [topN, setTopN] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ jobDesc, topN: Number(topN) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <StyledPaper>
        <Typography variant="h5" gutterBottom sx={{ 
          fontWeight: 700, 
          mb: 3,
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <span role="img" aria-label="search">🔍</span>
          Find Ideal Candidates
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Job Description"
                multiline
                rows={5}
                fullWidth
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                required
                variant="filled"
                sx={{
                  '& .MuiFilledInput-root': {
                    borderRadius: theme.shape.borderRadius,
                    background: alpha(theme.palette.background.default, 0.8),
                    '&:hover': { background: alpha(theme.palette.background.default, 0.9) }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Number of Results"
                type="number"
                value={topN}
                onChange={(e) => setTopN(e.target.value)}
                fullWidth
                variant="filled"
                inputProps={{ 
                  min: 1, 
                  max: 20,
                }}
                sx={{
                  '& .MuiFilledInput-root': {
                    background: alpha(theme.palette.background.default, 0.8),
                    borderRadius: theme.shape.borderRadius,
                    '&:hover': { background: alpha(theme.palette.background.default, 0.9) }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Button 
                type="submit" 
                fullWidth
                disabled={loading}
                sx={{
                  height: 56,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: theme.palette.common.white,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: theme.shadows[4],
                  },
                  '&:disabled': {
                    background: theme.palette.action.disabledBackground,
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Generate Matches'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
    </motion.div>
  );
};

export default SearchForm;