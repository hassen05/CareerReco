import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CandidateProfilePage from './CandidateProfilePage';
import RecruiterProfilePage from './RecruiterProfilePage';

function ProfilePage() {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserRole(user.user_metadata?.role || 'candidate');
      }
    };
    getUserRole();
  }, []);

  if (userRole === 'recruiter') {
    return <RecruiterProfilePage />;
  } else if (userRole === 'candidate') {
    return <CandidateProfilePage />;
  }

  return <div>Loading...</div>;
}

export default ProfilePage;