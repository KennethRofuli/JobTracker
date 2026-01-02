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
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
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
      alert('✅ Token copied! Use this only if automatic login doesn\'t work in the extension.');
    }
  };

  const exportToCSV = () => {
    if (filteredAndSortedApplications.length === 0) {
      alert('No applications to export');
      return;
    }

    const headers = ['Company', 'Job Title', 'Location', 'Status', 'Source', 'Date Applied', 'URL'];
    const csvData = filteredAndSortedApplications.map(app => [
      app.company_name,
      app.job_title,
      app.location || '',
      app.status,
      app.source,
      new Date(app.date_applied).toLocaleDateString(),
      app.url || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filter and sort applications
  const filteredAndSortedApplications = React.useMemo(() => {
    let filtered = applications.filter(app => {
      const matchesSearch = 
        app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job_title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
      
      // Date filtering
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const appDate = new Date(app.date_applied);
        const now = new Date();
        const daysAgo = Math.floor((now - appDate) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === '7') matchesDate = daysAgo <= 7;
        else if (dateFilter === '30') matchesDate = daysAgo <= 30;
        else if (dateFilter === '90') matchesDate = daysAgo <= 90;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'date') {
        compareValue = new Date(a.date_applied) - new Date(b.date_applied);
      } else if (sortBy === 'company') {
        compareValue = a.company_name.localeCompare(b.company_name);
      } else if (sortBy === 'status') {
        compareValue = a.status.localeCompare(b.status);
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [applications, searchTerm, filterStatus, dateFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = filteredAndSortedApplications.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, dateFilter, sortBy, sortOrder]);

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

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="filter-select"
          >
            <option value="date-desc">📅 Newest First</option>
            <option value="date-asc">📅 Oldest First</option>
            <option value="company-asc">🏢 Company A-Z</option>
            <option value="company-desc">🏢 Company Z-A</option>
          </select>

          <button onClick={exportToCSV} className="export-btn" title="Export to CSV">
            📥 Export
          </button>

          <button onClick={fetchApplications} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading applications...</div>
        ) : (
          <>
            <div className="results-count">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedApplications.length)} of {filteredAndSortedApplications.length} applications
              {filteredAndSortedApplications.length !== applications.length && ` (filtered from ${applications.length} total)`}
            </div>
            <ApplicationTable
              applications={currentApplications}
              onDelete={deleteApplication}
              onUpdateStatus={updateStatus}
            />
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                
                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="app-footer">
        <p>Made by Kenneth John Rofuli</p>
        <div className="footer-links">
          <a href="https://github.com/KennethRofuli" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <span className="footer-separator">•</span>
          <a href="https://www.linkedin.com/in/kenneth-john-r-2674522a6" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
