import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Stats from './components/Stats';
import ApplicationTable from './components/ApplicationTable';

const API_URL = 'http://localhost:5000/api/applications';

function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Fetch applications on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setApplications(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load applications. Make sure backend is running on port 5000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      setApplications(applications.filter(app => app._id !== id));
    } catch (err) {
      alert('Failed to delete application');
      console.error(err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, { status: newStatus });
      setApplications(applications.map(app => 
        app._id === id ? response.data.data : app
      ));
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
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

  return (
    <div className="App">
      <header className="app-header">
        <h1>📋 Job Tracker Dashboard</h1>
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
