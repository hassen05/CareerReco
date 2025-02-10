import React, { useState } from 'react';
import { TextField, Button, Box, Paper, Typography, Grid, styled } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/system'; // Importing alpha
import theme from '../styles/theme';


// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(4),
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
}));

const StyledButton = styled(Button)(({ theme }) => ({
  height: '56px',
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  color: theme.palette.common.white,
  fontWeight: 'bold',
  fontSize: '1rem',
  '&:hover': {
    opacity: 0.9,
  },
}));

const SearchForm = ({ onSubmit }) => {
  const [jobDesc, setJobDesc] = useState('');
  const [topN, setTopN] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ jobDesc, topN });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledPaper>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          🔍 Enter Job Description
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Job Description"
                multiline
                rows={4}
                fullWidth
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                required
                variant="outlined"
                sx={{ background: theme.palette.background.default }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Number of Results"
                type="number"
                value={topN}
                onChange={(e) => setTopN(e.target.value)}
                fullWidth
                inputProps={{ min: 1, max: 20 }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledButton type="submit" fullWidth>
                Search
              </StyledButton>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
    </motion.div>
  );
};

export default SearchForm;
