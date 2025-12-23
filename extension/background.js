// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveApplication') {
    saveToAPI(request.data);
  }
});

// Save to your backend API
async function saveToAPI(data) {
  try {
    const response = await fetch('http://localhost:5000/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
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
