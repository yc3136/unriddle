/**
 * Extension popup script for the unriddle Chrome Extension
 * 
 * This is a simple informational popup that appears when users click
 * the extension icon in the browser toolbar.
 */

/// <reference types="chrome"/>

// Popup is currently informational only
// Future versions may include settings, history, or other features

// Add settings button functionality
document.addEventListener('DOMContentLoaded', () => {
  const settingsButton = document.getElementById('open-settings');
  
  // Handle settings button clicks
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
}); 