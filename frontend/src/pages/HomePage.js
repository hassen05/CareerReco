import React from 'react';
import { Typography } from '@mui/material';

function HomePage() {
  return (
    <Typography variant="h4" sx={{ textAlign: 'center', mt: 4 }}>
      Welcome to Resume Recommender! Use the tabs above to navigate.
    </Typography>
  );
}

export default HomePage;
