import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AuthSuccess() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Extract token from URL fragment (for mobile/cross-origin compatibility)
        const hash = window.location.hash;
        let token = null;
        
        if (hash && hash.includes('token=')) {
          token = hash.split('token=')[1].split('&')[0];
          console.log('Token extracted from URL fragment');
          
          // Store in localStorage for mobile/cross-origin scenarios
          localStorage.setItem('auth_token', token);
          
          // Clear the URL fragment for security
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          // Try to get token from localStorage (if already stored)
          token = localStorage.getItem('auth_token');
        }
        
        // Verify authentication with token
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers,
          withCredentials: true // Still try cookies as fallback
        });
        
        console.log('Authentication successful:', response.data);
        
        // Send token to extension via postMessage (extension content script will listen)
        if (token) {
          window.postMessage({ 
            type: 'JOB_TRACKER_LOGIN',
            token: token,
            source: 'job-tracker-dashboard'
          }, '*');
          
          console.log('Login token broadcast to extension');
        }
        
        // Redirect to dashboard
        setTimeout(() => navigate('/'), 100);
      } catch (err) {
        console.error('Authentication verification failed:', err);
        setError('Authentication failed');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    verifyAuth();
  }, [navigate]);

  return (
    <div className="auth-loading">
      <div className="loading">
        {error ? error : 'Completing authentication...'}
      </div>
    </div>
  );
}

export default AuthSuccess;
