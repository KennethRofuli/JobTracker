import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Stats from './components/Stats';
import ApplicationTable from './components/ApplicationTable';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [user, setUser] = useState(null);

  // Check authentication and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        fetchApplications();
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchApplications = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load applications. Make sure backend is running on port 5000.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
      await axios.delete(`${API_URL}/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(applications.filter(app => app._id !== id));
    } catch (err) {
      alert('Failed to delete application');
      console.error(err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.put(
        `${API_URL}/applications/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(applications.map(app => 
        app._id === id ? response.data.data : app
      ));
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    
    // Notify extension to logout as well
    try {
      // eslint-disable-next-line no-undef
      chrome.runtime.sendMessage(
        'lbeihaoanhokdoneifjndckafifjiied',
        { action: 'logout' },
        (response) => {
          console.log('Logout signal sent to extension');
        }
      );
    } catch (e) {
      console.log('Chrome extension API not available');
    }
    
    navigate('/login');
  };

  const copyTokenForExtension = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigator.clipboard.writeText(token);
      alert('✅ Token copied! Now paste it into the extension.');
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>📋 Job Tracker Dashboard</h1>
          <div className="user-info">
            {user.picture && <img src={user.picture} alt={user.name} className="user-avatar" />}
            <span className="user-name">{user.name}</span>
            <button onClick={copyTokenForExtension} className="extension-token-btn" title="Copy token for browser extension">
              🔑 Extension Token
            </button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="container">
        <div className="info-banner">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <strong>Browser Extension Required:</strong> To auto-capture jobs from Indeed, LinkedIn, and Glassdoor, 
            you need to install the Job Tracker browser extension. 
            <a href="chrome://extensions/" className="info-link">Install Extension →</a>
          </div>
        </div>

        <Stats 
          applications={applications} 
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        <div className="controls">
          <input
            type="text"
            placeholder="🔍 Search company or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
            <option value="Accepted">Accepted</option>
          </select>

          <button onClick={fetchApplications} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading applications...</div>
        ) : (
          <ApplicationTable
            applications={filteredApplications}
            onDelete={deleteApplication}
            onUpdateStatus={updateStatus}
          />
        )}
      </div>
    </div>
  );
}

export default App;
