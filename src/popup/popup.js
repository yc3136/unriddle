/**
 * Extension popup script for the Unriddle Chrome Extension
 * 
 * This is a simple informational popup that appears when users click
 * the extension icon in the browser toolbar.
 */

// Popup is currently informational only
// Future versions may include settings, history, or other features

// Add settings button functionality
document.addEventListener('DOMContentLoaded', async () => {
  const settingsButton = document.getElementById('open-settings');
  const warningSettingsButton = document.getElementById('open-settings-from-warning');
  const quotaWarning = document.getElementById('quota-warning');
  
  // Handle settings button clicks
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
  
  if (warningSettingsButton) {
    warningSettingsButton.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
  
  // Check if user has set their own API key
  try {
    const result = await chrome.storage.sync.get({ geminiApiKey: "" });
    const hasUserApiKey = result.geminiApiKey && result.geminiApiKey.trim() !== '';
    
    // Hide warning if user has set their own API key
    if (hasUserApiKey && quotaWarning) {
      quotaWarning.style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking API key status:', error);
  }
}); 