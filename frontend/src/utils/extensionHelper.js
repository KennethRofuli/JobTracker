// Helper to communicate with the Job Tracker extension
// The extension ID is dynamically determined at runtime

export const sendMessageToExtension = async (message) => {
  // Try to find the extension by trying common methods
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.log('Chrome extension API not available');
    return { success: false, error: 'Chrome API not available' };
  }

  try {
    // Method 1: Try to send via postMessage which extension can listen to
    window.postMessage({ 
      type: 'JOB_TRACKER_FROM_WEBPAGE',
      ...message 
    }, '*');
    
    // Method 2: Try direct extension communication if ID is known
    // The extension can be found in chrome://extensions
    // Users need to note their extension ID for this to work
    const extensionId = localStorage.getItem('jobTrackerExtensionId');
    
    if (extensionId) {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          extensionId,
          message,
          (response) => {
            if (chrome.runtime.lastError) {
              console.log('Extension not found with stored ID:', chrome.runtime.lastError);
              resolve({ success: false, error: chrome.runtime.lastError.message });
            } else {
              console.log('Message sent to extension successfully');
              resolve({ success: true, response });
            }
          }
        );
      });
    }
    
    return { success: true, method: 'postMessage' };
  } catch (e) {
    console.log('Error communicating with extension:', e);
    return { success: false, error: e.message };
  }
};

export const getExtensionId = () => {
  return localStorage.getItem('jobTrackerExtensionId');
};

export const setExtensionId = (id) => {
  localStorage.setItem('jobTrackerExtensionId', id);
};
