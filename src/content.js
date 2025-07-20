/**
 * Main content script for the unriddle Chrome Extension
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
  language: "English",
  contextWindowSize: 40
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
    
    // Load user settings
    const settings = await loadSettings();
    let contextWindowSize = settings.contextWindowSize;
    if (contextWindowSize === undefined || contextWindowSize === null) contextWindowSize = 40;

    // Gather context around the selected text for better LLM prompts
    const context = gatherContext(selectedText, contextWindowSize);

    // Show loading popup while processing
    showUnriddlePopup(selectedText, true, undefined, undefined, undefined, settings.language);
    
    const startTime = Date.now();
    try {
      // Process text through LLM API with user's language preference
      const unriddleResult = await unriddleText(context, { language: settings.language, returnPrompt: true });
      const result = unriddleResult.result;
      const prompt = unriddleResult.prompt;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      // Display successful result
      showUnriddlePopup(selectedText, false, `${result}\n\n⏱️ Time used: ${elapsed}s`, true, prompt, settings.language);
    } catch (err) {
      console.error('Content: Error in unriddleText:', err);
      
      // Check if it's an API key validation error
      let errorMessage = err.message || err;
      if (errorMessage.includes('Gemini API error: 400')) {
        errorMessage = `Invalid API key. Please check your Gemini API key in <a href="#" class="error-link">Settings</a> and try again.`;
      } else if (errorMessage.includes('Gemini API error: 429') || 
                 errorMessage.includes('quota') || 
                 errorMessage.includes('rate limit') ||
                 errorMessage.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = `API quota limit reached. The shared API key has been used up. Please set your own Gemini API key in <a href=\"#\" class=\"error-link\">Settings</a> to avoid exceeding API quota.`;
      }
      
      // Display error message
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      showUnriddlePopup(selectedText, false, `Error: ${errorMessage}\n\n⏱️ Time used: ${elapsed}s`, true, undefined, settings.language);
    }
  }
});