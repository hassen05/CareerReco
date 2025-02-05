import React, { useState } from 'react';
import { TextField, Button, Box, Paper, Typography, Grid } from '@mui/material';

const SearchForm = ({ onSubmit }) => {
  const [jobDesc, setJobDesc] = useState('');
  const [topN, setTopN] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ jobDesc, topN });
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#5e35b1' }}>
        Enter Job Description
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                height: '56px',
                backgroundColor: '#5e35b1',
                '&:hover': { backgroundColor: '#4527a0' },
              }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SearchForm;