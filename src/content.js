/**
 * Main content script for the Unriddle Chrome Extension
 * Handles communication with the background script and orchestrates popup display
 */

import { unriddleText } from "./llmApi.js";
import { showUnriddlePopup } from "./popup/inPagePopup.js";
import { gatherContext } from "./modules/contextGatherer.js";
import { setupEventHandlers } from "./modules/eventHandlers.js";

// Initialize event handlers for popup interactions
setupEventHandlers();

// Default settings - hardcode the default language to avoid import issues
const DEFAULT_SETTINGS = {
  language: "English"
};

/**
 * Loads user settings from Chrome storage
 * @returns {Promise<Object>} User settings
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    const settings = { ...DEFAULT_SETTINGS, ...result };
    return settings;
  } catch (error) {
    console.error('Content: Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Main message listener for handling unriddle requests from the background script
 * Processes selected text through LLM and displays results in popup
 */
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.action === "UNRIDDLE_SELECTED_TEXT") {
    const selectedText = msg.text;
    
    // Gather context around the selected text for better LLM prompts
    const context = gatherContext(selectedText);

    // Load user settings
    const settings = await loadSettings();

    // Show loading popup while processing
    showUnriddlePopup(selectedText, true);
    
    const startTime = Date.now();
    try {
      // Process text through LLM API with user's language preference
      const result = await unriddleText(context, { language: settings.language });
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      // Display successful result
      showUnriddlePopup(selectedText, false, `${result}\n\n⏱️ Time used: ${elapsed}s`, true);
    } catch (err) {
      console.error('Content: Error in unriddleText:', err);
      // Display error message
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      showUnriddlePopup(selectedText, false, `Error: ${err.message || err}\n\n⏱️ Time used: ${elapsed}s`, true);
    }
  }
});