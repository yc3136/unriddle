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

/**
 * Main message listener for handling unriddle requests from the background script
 * Processes selected text through LLM and displays results in popup
 */
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.action === "UNRIDDLE_SELECTED_TEXT") {
    const selectedText = msg.text;
    
    // Gather context around the selected text for better LLM prompts
    const context = gatherContext(selectedText);

    // Show loading popup while processing
    showUnriddlePopup(selectedText, true);
    
    const startTime = Date.now();
    try {
      // Process text through LLM API
      const result = await unriddleText(context);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      // Display successful result
      showUnriddlePopup(selectedText, false, `${result}\n\n⏱️ Time used: ${elapsed}s`, true);
    } catch (err) {
      // Display error message
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      showUnriddlePopup(selectedText, false, `Error: ${err.message || err}\n\n⏱️ Time used: ${elapsed}s`, true);
    }
  }
});