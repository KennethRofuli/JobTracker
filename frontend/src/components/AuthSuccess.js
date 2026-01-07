import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AuthSuccess() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // With cookie-based auth, token is automatically sent in cookies
    // Just verify authentication worked
    const verifyAuth = async () => {
      try {
        // This will use the cookie automatically
        const response = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true
        });
        
        console.log('Authentication successful:', response.data);
        
        // Get JWT token for extension
        try {
          const tokenResponse = await axios.get(`${API_URL}/auth/token`, {
            withCredentials: true
          });
          
          const token = tokenResponse.data.token;
          
          // Send token to extension via postMessage (extension content script will listen)
          window.postMessage({ 
            type: 'JOB_TRACKER_LOGIN',
            token: token,
            source: 'job-tracker-dashboard'
          }, '*');
          
          console.log('Login token broadcast to extension');
        } catch (err) {
          console.log('Could not send token to extension:', err.message);
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
