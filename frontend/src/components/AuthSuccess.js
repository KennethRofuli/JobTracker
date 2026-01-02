import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthSuccess() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    console.log('AuthSuccess - Token from URL:', token);

    if (token) {
      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('Token stored, redirecting to dashboard...');
      
      // Try to send token to extension if installed
      try {
        chrome.runtime.sendMessage(
          'lbeihaoanhokdoneifjndckafifjiied',
          { action: 'setToken', token: token },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log('Extension not installed or not reachable');
            } else {
              console.log('Token sent to extension successfully');
            }
          }
        );
      } catch (e) {
        console.log('Chrome extension API not available');
      }
      
      // Redirect to dashboard
      setTimeout(() => navigate('/'), 100);
    } else {
      // No token, redirect to login
      console.error('No token found in URL');
      setError('No authentication token received');
      setTimeout(() => navigate('/login'), 2000);
    }
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
