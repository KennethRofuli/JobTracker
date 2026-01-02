// Check auth status on load
document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.local.get(['authToken']);
  const token = result.authToken;
  
  if (token) {
    // Verify token is still valid
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const user = await response.json();
        showLoggedIn(user.name);
      } else {
        showLoggedOut();
        chrome.storage.local.remove('authToken');
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
  chrome.tabs.create({ url: 'http://localhost:3000/login' });
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
    const response = await fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const user = await response.json();
      await chrome.storage.local.set({ authToken: token });
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
  await chrome.storage.local.remove('authToken');
  showLoggedOut();
  showMessage('Logged out', 'success');
});

// Form submission - Manual entry
document.getElementById('jobForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const result = await chrome.storage.local.get(['authToken']);
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
    const response = await fetch('http://localhost:5000/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (response.status === 401) {
      showMessage('❌ Session expired. Please log in again.', 'error');
      await chrome.storage.local.remove('authToken');
      showLoggedOut();
      return;
    }
    
    if (response.ok) {
      showMessage('✅ Application saved!', 'success');
      document.getElementById('jobForm').reset();
    } else if (response.status === 409) {
      const errorData = await response.json();
      showMessage('⚠️ Already saved: ' + errorData.error, 'warning');
    } else {
      showMessage('❌ Failed to save', 'error');
    }
  } catch (error) {
    showMessage('❌ Error: ' + error.message, 'error');
  }
});

// Auto-capture button
document.getElementById('autoCapture').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Check if we're on a supported site
  const supportedSites = ['indeed.com', 'linkedin.com', 'glassdoor.com', 'onlinejobs.ph'];
  const isSupported = supportedSites.some(site => tab.url.includes(site));
  
  if (!isSupported) {
    showMessage('⚠️ This site is not supported. Use manual entry.', 'warning');
    return;
  }
  
  // Show loading message
  showMessage('🔄 Extracting data...', 'success');
  
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
    showMessage('⚠️ Tab was inactive. Please refresh the page (F5) and try again.', 'warning');
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
    
    showMessage('✅ Data captured! Click Save.', 'success');
  } else {
    showMessage('⚠️ Could not extract data from this page', 'warning');
  }
});

function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = `message ${type}`;
  setTimeout(() => msg.textContent = '', 3000);
}
