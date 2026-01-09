import React from 'react';

function Stats({ applications, filterStatus, onFilterChange }) {
  // Exclude 'Ignored' status from total count
  const activeApplications = applications.filter(app => app.status !== 'Ignored');
  const total = activeApplications.length;
  const applied = activeApplications.filter(app => app.status === 'Applied').length;
  const interviewing = activeApplications.filter(app => app.status === 'Interviewing').length;
  const offered = activeApplications.filter(app => app.status === 'Offered').length;
  const rejected = activeApplications.filter(app => app.status === 'Rejected').length;

  const stats = [
    { label: 'Total', value: total, icon: '📊', color: '#0066cc', filterValue: 'All' },
    { label: 'Applied', value: applied, icon: '📝', color: '#666', filterValue: 'Applied' },
    { label: 'Interviewing', value: interviewing, icon: '💬', color: '#ff9800', filterValue: 'Interviewing' },
    { label: 'Offered', value: offered, icon: '🎉', color: '#4caf50', filterValue: 'Offered' },
    { label: 'Rejected', value: rejected, icon: '❌', color: '#f44336', filterValue: 'Rejected' }
  ];

  return (
    <div className="stats-container">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`stat-card ${filterStatus === stat.filterValue ? 'stat-card-active' : ''}`}
          style={{ borderLeftColor: stat.color }}
          onClick={() => onFilterChange(stat.filterValue)}
          title={`Click to filter by ${stat.label}`}
        >
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Stats;
