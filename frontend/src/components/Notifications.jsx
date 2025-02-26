import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Box, List, ListItem, Typography, Chip, IconButton } from '@mui/material';
import { CircleNotifications } from '@mui/icons-material';

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios.get('/api/notifications/')
      .then(res => setNotifications(res.data));
  }, []);

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        <CircleNotifications sx={{ mr: 1 }} />
        Profile Views
      </Typography>
      <List>
        {notifications.map(notification => (
          <ListItem key={notification.id}>
            <Typography>
              {notification.recruiter?.company_name} viewed your profile
            </Typography>
            {!notification.read && <Chip label="New" />}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Notifications; 