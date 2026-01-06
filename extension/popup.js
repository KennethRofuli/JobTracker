// Check auth status on load
document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.local.get(['authToken', 'userId']);
  const token = result.authToken;
  
  // Migration: If token exists but no userId, clear everything (old version data)
  if (token && !result.userId) {
    console.log('Migrating: Clearing old token without user info');
    await chrome.storage.local.clear();
    showLoggedOut();
    showMessage('⚠️ Please log in again (security update)', 'warning');
    return;
  }
  
  if (token) {
    // Verify token is still valid
    try {
      const response = await fetch('https://jobtracker-backend-hqzq.onrender.com/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const user = await response.json();
        // Check if this is a different user and update stored info
        const stored = await chrome.storage.local.get(['userId']);
        if (!stored.userId || stored.userId !== user._id) {
          // Different user detected! Clear and require re-login
          console.log('Different user detected, clearing storage');
          await chrome.storage.local.clear();
          showLoggedOut();
          showMessage('⚠️ User changed - please log in again', 'warning');
          return;
        }
        showLoggedIn(user.name);
      } else {
        showLoggedOut();
        chrome.storage.local.remove(['authToken', 'userId', 'userName']);
      }
    } catch (error) {
      showLoggedOut();
    }
  } else {
    showLoggedOut();
  }
});

function showLoggedIn(userName) {
  document.getElementById('loggedOut').style.display = 'none';
  document.getElementById('loggedIn').style.display = 'block';
  document.getElementById('formSection').style.display = 'block';
  document.getElementById('userName').textContent = userName;
}

function showLoggedOut() {
  document.getElementById('loggedOut').style.display = 'block';
  document.getElementById('loggedIn').style.display = 'none';
  document.getElementById('formSection').style.display = 'none';
}

// Login button
document.getElementById('loginBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://job-tracker-seven-lake.vercel.app/login' });
});

// Toggle manual login section
document.getElementById('showManualLogin').addEventListener('click', (e) => {
  e.preventDefault();
  const manualSection = document.getElementById('manualLoginSection');
  const toggleLink = document.getElementById('showManualLogin');
  
  if (manualSection.style.display === 'none') {
    manualSection.style.display = 'block';
    toggleLink.textContent = 'Hide manual login';
  } else {
    manualSection.style.display = 'none';
    toggleLink.textContent = 'Having trouble? Use manual login';
  }
});

// Save token button
document.getElementById('saveTokenBtn').addEventListener('click', async () => {
  const token = document.getElementById('tokenInput').value.trim();
  
  if (!token) {
    showMessage('Please enter a token', 'error');
    return;
  }
  
  // Verify token
  try {
    const response = await fetch('https://jobtracker-backend-hqzq.onrender.com/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const user = await response.json();
      await chrome.storage.local.set({ 
        authToken: token,
        userId: user._id,
        userName: user.name
      });
      showLoggedIn(user.name);
      showMessage('✅ Logged in successfully!', 'success');
      document.getElementById('tokenInput').value = '';
    } else {
      showMessage('❌ Invalid token', 'error');
    }
  } catch (error) {
    showMessage('❌ Error: ' + error.message, 'error');
  }
});

// Logout button
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await chrome.storage.local.remove(['authToken', 'userId', 'userName']);
  showLoggedOut();
  showMessage('Logged out', 'success');
});

// Form submission - Manual entry
document.getElementById('jobForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const result = await chrome.storage.local.get(['authToken', 'userId', 'userName']);
  const token = result.authToken;
  
  if (!token) {
    showMessage('❌ Please log in first', 'error');
    return;
  }
  
  const data = {
    company_name: document.getElementById('company').value,
    job_title: document.getElementById('jobTitle').value,
    location: document.getElementById('location').value,
    url: document.getElementById('url').value,
    source: document.getElementById('source').value,
    status: document.getElementById('status').value,
    date_applied: new Date()
  };
  
  try {
    const response = await fetch('https://jobtracker-backend-hqzq.onrender.com/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (response.status === 401) {
      showMessage('❌ Session expired. Please log in again.', 'error');
      await chrome.storage.local.clear();
      showLoggedOut();
      return;
    }
    
    if (response.ok) {
      showMessage('✅ Application saved!', 'success');
      document.getElementById('jobForm').reset();
    } else if (response.status === 409) {
      const errorData = await response.json();
      showMessage('⚠️ Already saved in your tracker!', 'warning');
    } else {
      showMessage('❌ Failed to save', 'error');
    }
  } catch (error) {
    showMessage('❌ Error: ' + error.message, 'error');
  }
});

// Check page status on load
async function checkPageStatus() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    // Check if on supported site
    const supportedSites = ['indeed.com', 'linkedin.com', 'glassdoor.com', 'onlinejobs.ph'];
    const isSupported = supportedSites.some(site => tab.url.includes(site));
    
    if (!isSupported) {
      statusDot.className = 'status-dot inactive';
      statusText.textContent = 'Not on a supported job site';
      return { active: false, reason: 'unsupported_site' };
    }
    
    // Try to ping content script
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
      statusDot.className = 'status-dot active';
      statusText.textContent = 'Ready to capture';
      return { active: true };
    } catch (error) {
      statusDot.className = 'status-dot inactive';
      statusText.textContent = 'Page needs refresh (F5)';
      return { active: false, reason: 'script_not_loaded' };
    }
  } catch (error) {
    return { active: false, reason: 'unknown' };
  }
}

// Auto-capture function (used by both buttons)
async function performAutoCapture() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Check if we're on a supported site
  const supportedSites = ['indeed.com', 'linkedin.com', 'glassdoor.com', 'onlinejobs.ph'];
  const isSupported = supportedSites.some(site => tab.url.includes(site));
  
  if (!isSupported) {
    showMessage('⚠️ Not on a supported job site. Supported: Indeed, LinkedIn, Glassdoor, OnlineJobs.ph', 'warning');
    document.getElementById('retryCapture').style.display = 'none';
    return;
  }
  
  // Show loading message
  showMessage('🔄 Extracting data...', 'success');
  document.getElementById('retryCapture').style.display = 'none';
  
  // Retry logic for inactive tabs
  const sendMessageWithRetry = async (retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractJobData' });
        return { success: true, data: response };
      } catch (error) {
        if (i === retries) {
          return { success: false, error };
        }
        // Wait before retry (tab might be waking up)
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };
  
  const result = await sendMessageWithRetry();
  
  if (!result.success || chrome.runtime.lastError) {
    console.error('Extension error:', result.error || chrome.runtime.lastError);
    showMessage('❌ Content script not loaded. Please refresh the page (F5) first.', 'error');
    document.getElementById('retryCapture').style.display = 'block';
    // Update status
    document.getElementById('statusDot').className = 'status-dot inactive';
    document.getElementById('statusText').textContent = 'Page needs refresh (F5)';
    return;
  }
  
  const response = result.data;
  
  if (response && response.company && response.title) {
    document.getElementById('company').value = response.company;
    document.getElementById('jobTitle').value = response.title;
    
    // Fill location if available
    if (response.location) {
      document.getElementById('location').value = response.location;
    }
    
    // Auto-fill URL with current tab URL
    document.getElementById('url').value = tab.url;
    
    // Auto-detect source from URL
    if (tab.url.includes('linkedin.com')) {
      document.getElementById('source').value = 'LinkedIn';
    } else if (tab.url.includes('indeed.com')) {
      document.getElementById('source').value = 'Indeed';
    } else if (tab.url.includes('glassdoor.com')) {
      document.getElementById('source').value = 'Glassdoor';
    } else if (tab.url.includes('onlinejobs.ph')) {
      document.getElementById('source').value = 'OnlineJobs.ph';
    }
    
    showMessage('✅ Data captured! Review and click Save.', 'success');
    document.getElementById('retryCapture').style.display = 'none';
    // Update status
    document.getElementById('statusDot').className = 'status-dot active';
    document.getElementById('statusText').textContent = 'Capture successful';
  } else {
    showMessage('⚠️ Could not find job details on this page. Try a different page or use manual entry.', 'warning');
    document.getElementById('retryCapture').style.display = 'block';
  }
}

// Auto-capture button
document.getElementById('autoCapture').addEventListener('click', performAutoCapture);

// Retry button
document.getElementById('retryCapture').addEventListener('click', performAutoCapture);

// Check page status when form section becomes visible
const formObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target.id === 'formSection' && mutation.target.style.display === 'block') {
      checkPageStatus();
    }
  });
});

if (document.getElementById('formSection')) {
  formObserver.observe(document.getElementById('formSection'), {
    attributes: true,
    attributeFilter: ['style']
  });
}

function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = `message ${type}`;
  setTimeout(() => msg.textContent = '', 3000);
}
