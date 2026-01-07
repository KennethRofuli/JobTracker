import React from 'react';
import NotesModal from './NotesModal';

function ApplicationTable({ applications, onDelete, onUpdateStatus, onUpdateNotes }) {
  const [selectedApp, setSelectedApp] = React.useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      'Applied': 'status-applied',
      'Interviewing': 'status-interviewing',
      'Offered': 'status-offered',
      'Rejected': 'status-rejected',
      'Accepted': 'status-accepted'
    };
    return statusClasses[status] || '';
  };

  const getSourceIcon = (source) => {
    const icons = {
      'LinkedIn': '💼',
      'Indeed': '🔍',
      'Email': '📧',
      'Manual': '✍️'
    };
    return icons[source] || '📄';
  };

  if (applications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No applications found</h3>
        <p>Start tracking jobs with the browser extension!</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="applications-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Job Title</th>
            <th>Location</th>
            <th>Date Applied</th>
            <th>Source</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app._id}>
              <td className="company-name">
                {app.url ? (
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="job-link">
                    {app.company_name}
                  </a>
                ) : (
                  app.company_name
                )}
              </td>
              <td className="job-title">
                <span 
                  className="job-title-link"
                  onClick={() => setSelectedApp(app)}
                  title={app.notes ? "Click to view/edit notes" : "Click to add notes"}
                >
                  {app.job_title}
                  {app.notes && ' 📝'}
                </span>
              </td>
              <td className="location">{app.location || '-'}</td>
              <td>{formatDate(app.date_applied)}</td>
              <td>
                <span className="source-badge">
                  {getSourceIcon(app.source)} {app.source}
                </span>
              </td>
              <td>
                <select
                  value={app.status}
                  onChange={(e) => onUpdateStatus(app._id, e.target.value)}
                  className={`status-select ${getStatusClass(app.status)}`}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Accepted">Accepted</option>
                </select>
              </td>
              <td>
                <button
                  onClick={() => onDelete(app._id)}
                  className="delete-btn"
                  title="Delete application"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <NotesModal 
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onSave={onUpdateNotes}
      />
    </div>
  );
}

export default ApplicationTable;
