/**
 * Main content script for the unriddle Chrome Extension
 * Handles communication with the background script and orchestrates popup display
 */

import { unriddleText, unriddleTextStream } from "./llmApi.js";
// Uses template-based popup rendering (see inPagePopupTemplate.js for template approach details)
import { showUnriddlePopup } from "./popup/inPagePopup.js";
import { gatherContext } from "./modules/contextGatherer.js";
import { setupEventHandlers } from "./modules/eventHandlers.js";
import { simpleMarkdownToHtml } from "./modules/markdownProcessor.js";

// Initialize event handlers for popup interactions
setupEventHandlers();

// Note: Settings cache will be initialized on first LLM call
// This avoids circular import issues and still provides the performance benefit

// Default settings - hardcode the default language to avoid import issues
const DEFAULT_SETTINGS = {
  language: "English",
  contextWindowSize: 40,
  selectedModel: "gemini-2.5-flash"
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
      // Streaming LLM response
      let resultText = "";
      let prompt = "";
      let resultSpan = null;
      // Keep loading popup until first chunk arrives
      // Stream chunks
      let firstChunk = true;
      let gotChunk = false;
      for await (const chunk of unriddleTextStream(context, { language: settings.language, model: settings.selectedModel })) {
        if (firstChunk) {
          // Switch from loading to result popup on first chunk
          // Create the prompt for the meta row (robot button)
          const basePrompt = `Rewrite the following text in plain, simple words for a general audience. Do not use phrases like 'it means' or 'it describes'—just give the transformed meaning directly. Be concise and clear. Respond in ${settings.language || 'English'}.`;
          const fullPrompt = `${basePrompt}\nPage Title: ${context.page_title || ""}\nSection Heading: ${context.section_heading || ""}\nContext Snippet: ${context.context_snippet || ""}\nUser Selection: "${context.user_selection || ""}"`;
          await showUnriddlePopup(selectedText, false, "", true, fullPrompt, settings.language);
          const popup = document.getElementById("unriddle-popup");
          if (!popup) {
            return;
          }
          resultSpan = popup.querySelector(".unriddle-result");
          if (!resultSpan) {
            resultSpan = document.createElement("span");
            resultSpan.className = "unriddle-result";
            popup.appendChild(resultSpan);
          }
          firstChunk = false;
        }
        resultText += chunk;
        gotChunk = true;
        // Process the full accumulated text with markdown to handle newlines properly
        resultSpan.innerHTML = simpleMarkdownToHtml(resultText);
      }
      if (!gotChunk) {
        // Fallback: use non-streaming method if no chunks received
        const unriddleResult = await unriddleText(context, { language: settings.language, model: settings.selectedModel, returnPrompt: true });
        resultText = unriddleResult.result;
        prompt = unriddleResult.prompt;
        resultSpan.innerHTML = simpleMarkdownToHtml(resultText);
        // Update the time spent in the meta row
        const popup = document.getElementById("unriddle-popup");
        if (popup) {
          const timeSpan = popup.querySelector(".unriddle-time-text");
          if (timeSpan) {
            timeSpan.textContent = `⏱️ Time used: ${((Date.now() - startTime) / 1000).toFixed(2)}s`;
          }
        }
        return;
      }
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      // Show final result with markdown rendered
      // Update the final result without recreating the popup (to preserve meta row)
      resultSpan.innerHTML = simpleMarkdownToHtml(resultText);
      // Update the time spent in the meta row
      const popup = document.getElementById("unriddle-popup");
      if (popup) {
        const timeSpan = popup.querySelector(".unriddle-time-text");
        if (timeSpan) {
          timeSpan.textContent = `⏱️ Time used: ${elapsed}s`;
        }
      }
    } catch (err) {
      let errorMessage = err.message || err;
      if (errorMessage.includes('Gemini API error: 400')) {
        errorMessage = `Invalid API key. Please check your Gemini API key in <a href=\"#\" class=\"error-link\">Settings</a> and try again.`;
      } else if (errorMessage.includes('Gemini API error: 429') || 
                 errorMessage.includes('quota') || 
                 errorMessage.includes('rate limit') ||
                 errorMessage.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = `API quota limit reached. The shared API key has been used up. Please set your own Gemini API key in <a href=\"#\" class=\"error-link\">Settings</a> to avoid exceeding API quota.`;
      }
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      showUnriddlePopup(selectedText, false, `Error: ${errorMessage}\n\n⏱️ Time used: ${elapsed}s`, true, undefined, settings.language);
    }
  }
});