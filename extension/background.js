// Listen for messages from content script and web app
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === 'setToken' && request.token) {
    // Save token from web app
    // First, get user info to store with token
    fetch('https://jobtracker-backend-hqzq.onrender.com/api/auth/me', {
      headers: { 'Authorization': `Bearer ${request.token}` }
    })
    .then(res => res.json())
    .then(user => {
      chrome.storage.local.set({ 
        authToken: request.token,
        userId: user._id,
        userName: user.name
      }, () => {
        console.log('Token and user info received from web app and saved');
        sendResponse({ success: true });
        
        // Show success notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Login Successful!',
          message: `Welcome ${user.name}! You are now logged in to Job Tracker`
        });
      });
    })
    .catch(err => {
      console.error('Failed to get user info:', err);
      // Still save the token
      chrome.storage.local.set({ authToken: request.token }, () => {
        sendResponse({ success: true });
      });
    });
    return true; // Keep the message channel open for sendResponse
  }
  
  if (request.action === 'logout') {
    // Clear all user data from extension
    chrome.storage.local.remove(['authToken', 'userId', 'userName'], () => {
      console.log('Logged out from extension - all user data cleared');
      sendResponse({ success: true });
      
      // Show logout notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Logged Out',
        message: 'You have been logged out of Job Tracker'
      });
    });
    return true;
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveApplication') {
    saveToAPI(request.data);
  }
});

// Save to your backend API
async function saveToAPI(data) {
  try {
    // Get token from storage
    const result = await chrome.storage.local.get(['authToken']);
    const token = result.authToken;

    if (!token) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Authentication Required',
        message: 'Please log in to Job Tracker to save applications'
      });
      return;
    }

    const response = await fetch('https://jobtracker-backend-hqzq.onrender.com/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (response.status === 401) {
      // Token expired or invalid
      chrome.storage.local.remove('authToken');
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Session Expired',
        message: 'Please log in again to Job Tracker'
      });
      return;
    }

    if (response.ok) {
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Job Saved!',
        message: `${data.company_name} - ${data.job_title}`
      });
    }
  } catch (error) {
    console.error('Failed to save:', error);
  }
}
