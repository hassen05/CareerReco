import React, { useState } from 'react';
import { Container, Typography, Button, TextField, Box } from '@mui/material';

function UploadPage() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    alert(`File uploaded: ${file?.name || 'No file selected'}`);
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Upload Your Resume
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField type="file" onChange={handleFileChange} />
        <Button variant="contained" color="primary" onClick={handleUpload} disabled={!file}>
          Upload
        </Button>
      </Box>
    </Container>
  );
}

export default UploadPage;
