import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        setUserRole(user.user_metadata?.role || 'candidate');
        setLoading(false);
      }
    };
    fetchUserRole();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  if (requiredRole && userRole !== requiredRole) {
    return <div>Access Denied</div>;
  }

  return children;
}

export default ProtectedRoute; 