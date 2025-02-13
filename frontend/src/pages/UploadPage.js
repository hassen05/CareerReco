import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { motion } from 'framer-motion';
import PageHero from '../components/PageHero';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    setOpenSnackbar(true);
  };

  return (
    <Box>
      {/* Hero Section */}
      <PageHero 
        title="Upload Your Resume" 
        subtitle="Boost your chances with AI-powered matching"
        
        gradientStart="rgba(182, 255, 240, 0.9)"
        gradientEnd="rgba(219, 13, 51, 0.7)"
      />

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 6 }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
            Upload Your Resume and Get Matched!
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
            {/* File Input Hidden, Styled Button */}
            <input 
              type="file" 
              id="resume-upload" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <label htmlFor="resume-upload">
              <Button 
                variant="contained" 
                component="span"
                color="secondary"
                sx={{ fontWeight: 'bold', py: 1.5, px: 4 }}
              >
                {file ? file.name : "Choose a File"}
              </Button>
            </label>

            {/* Upload Button */}
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleUpload} 
              disabled={!file}
              sx={{ fontWeight: 'bold', py: 1.5, px: 4 }}
            >
              Upload
            </Button>
          </Box>
        </motion.div>
      </Container>

      {/* Snackbar Feedback */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={4000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          File "{file?.name}" uploaded successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UploadPage;
