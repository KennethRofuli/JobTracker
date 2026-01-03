// This script runs on the Job Tracker dashboard to listen for logout events
console.log('Job Tracker extension: Dashboard listener loaded');

// Listen for logout messages from the dashboard
window.addEventListener('message', (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;
  
  if (event.data.type === 'JOB_TRACKER_LOGOUT' && event.data.source === 'job-tracker-dashboard') {
    console.log('Job Tracker extension: Received logout message from dashboard');
    
    // Clear extension storage
    chrome.storage.local.clear(() => {
      console.log('Job Tracker extension: Storage cleared on logout');
      
      // Notify background to show notification
      chrome.runtime.sendMessage({ 
        action: 'showNotification',
        title: 'Logged Out',
        message: 'Extension logged out. Please log in again to track jobs.'
      });
    });
  }
});

console.log('Job Tracker extension: Listening for logout events');
