import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CandidateProfilePage from './CandidateProfilePage';
import RecruiterProfilePage from './RecruiterProfilePage';
import notificationService from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProfile(data);

        // Create notification if viewer is a recruiter
        if (user && user.role === 'recruiter' && data.id !== user.id) {
          await notificationService.createNotification(
            data.id,
            'profile_view',
            `${user.email} viewed your profile`,
            { viewer_id: user.id }
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user]);

  if (userRole === 'recruiter') {
    return <RecruiterProfilePage />;
  } else if (userRole === 'candidate') {
    return <CandidateProfilePage />;
  }

  return <div>Loading...</div>;
}

export default ProfilePage;