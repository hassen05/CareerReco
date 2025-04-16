import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      // If there's no user, navigate to the login page.
      if (!user) {
        navigate('/login');
      } else {
        // Query the profiles table for the user's role using the user ID.
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user role from profiles:', error);
          // In case of error, you can optionally set a default role.
          setUserRole('candidate');
        } else {
          setUserRole(profile.role);
        }
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  // Allow access if the required role matches or if the user is an admin.
  if (requiredRole && !(userRole === requiredRole || userRole === 'admin')) {
    return <div>Access Denied</div>;
  }

  return children;
}

export default ProtectedRoute;
