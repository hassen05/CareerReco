// components/SearchForm.jsx
import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Typography,
  styled,
  useTheme,
  CircularProgress,
  InputAdornment,
  Slider
} from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 4,
  padding: theme.spacing(4),
  background: theme.palette.background.paper,
  boxShadow: 'none',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: alpha(theme.palette.background.default, 0.8),
    transition: 'all 0.3s ease',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.default, 0.95),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.background.default, 1),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
    }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  }
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
      transition={{ duration: 0.5 }}
    >
      <StyledPaper>
        <Box component="form" onSubmit={handleSubmit}>
          <StyledTextField
            fullWidth
            multiline
            rows={4}
            placeholder="Paste your job description here..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', ml: 1 }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ 
            mt: 4, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <PeopleAltOutlinedIcon sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 180 }}>
              Number of candidates: {topN}
            </Typography>
            <Slider
              value={topN}
              onChange={(_, value) => setTopN(value)}
              min={1}
              max={20}
              sx={{
                color: theme.palette.primary.main,
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                },
                '& .MuiSlider-rail': {
                  opacity: 0.2
                }
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: theme.shape.borderRadius * 2,
              background: theme.palette.primary.main,
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: theme.palette.primary.dark,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&.Mui-disabled': {
                background: theme.palette.action.disabledBackground
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Find Matches'
            )}
          </Button>
        </Box>
      </StyledPaper>
    </motion.div>
  );
};

export default SearchForm;