// Form submission - Manual entry
document.getElementById('jobForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
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
