/**
 * Main content script for the unriddle Chrome Extension
 * Handles communication with the background script and orchestrates popup display
 */

/// <reference types="chrome"/>

import { unriddleText, unriddleTextStream } from "./llmApi.js";
// Uses template-based popup rendering (see inPagePopupTemplate.js for template approach details)
import { showUnriddlePopup } from "./popup/inPagePopup.js";
import { gatherContext } from "./modules/contextGatherer.js";
import { setupEventHandlers } from "./modules/eventHandlers.js";
import { simpleMarkdownToHtml } from "./modules/markdownProcessor.js";

// Type definitions
interface UserSettings {
  language: string;
  contextWindowSize: number;
  selectedModel: string;
}

interface UnriddleMessage {
  action: "UNRIDDLE_SELECTED_TEXT";
  text: string;
}

/**
 * Helper function to unescape quotes in LLM output
 * @param text - Text that may contain escaped quotes
 * @returns Text with escaped quotes converted to regular quotes
 */
function unescapeQuotes(text: string): string {
  return text.replace(/\\"/g, '"').replace(/\\'/g, "'");
}

// Initialize event handlers for popup interactions
setupEventHandlers();

// Note: Settings cache will be initialized on first LLM call
// This avoids circular import issues and still provides the performance benefit

// Default settings - hardcode the default language to avoid import issues
const DEFAULT_SETTINGS: UserSettings = {
  language: "English",
  contextWindowSize: 40,
  selectedModel: "gemini-2.5-flash"
};

/**
 * Loads user settings from Chrome storage
 * @returns User settings
 */
async function loadSettings(): Promise<UserSettings> {
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
chrome.runtime.onMessage.addListener(async (msg: UnriddleMessage, _sender, _sendResponse) => {
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
      console.log("Starting unriddle process...");
      
      // Try streaming first, with fallback to non-streaming
      let resultText = "";
      let resultSpan: HTMLElement | null = null;
      let firstChunk = true;
      let gotChunk = false;
      
      try {
        console.log("Attempting streaming...");
        // Attempt streaming
        for await (const chunk of unriddleTextStream(context, { language: settings.language, model: settings.selectedModel })) {
          console.log("Received chunk:", chunk);
          if (firstChunk) {
            console.log("First chunk received, switching to result popup...");
            // Switch from loading to result popup on first chunk
            const basePrompt = `Rewrite the following text in plain, simple words for a general audience. Do not use phrases like 'it means' or 'it describes'—just give the transformed meaning directly. Be concise and clear. Respond in ${settings.language || 'English'}.`;
            const fullPrompt = `${basePrompt}\nPage Title: ${context.page_title || ""}\nSection Heading: ${context.section_heading || ""}\nContext Snippet: ${context.context_snippet || ""}\nUser Selection: "${context.user_selection || ""}"`;
            await showUnriddlePopup(selectedText, false, "", true, fullPrompt, settings.language);
            const popup = document.getElementById("unriddle-popup");
            if (!popup) {
              console.log("Popup not found after first chunk");
              return;
            }
            resultSpan = popup.querySelector(".unriddle-result") as HTMLElement;
            if (!resultSpan) {
              resultSpan = document.createElement("span");
              resultSpan.className = "unriddle-result";
              popup.appendChild(resultSpan);
            }
            firstChunk = false;
          }
          resultText += chunk;
          gotChunk = true;
          // During streaming, just show raw text to avoid DOM manipulation errors
          if (resultSpan) {
            resultSpan.textContent = resultText;
          }
        }
        console.log("Streaming completed successfully");
      } catch (streamError) {
        console.log("Streaming failed, falling back to non-streaming:", streamError);
        gotChunk = false;
      }
      
      if (!gotChunk) {
        // Fallback: use non-streaming method
        console.log("Using non-streaming fallback...");
        const unriddleResult = await unriddleText(context, { language: settings.language, model: settings.selectedModel, returnPrompt: true });
        console.log("Got unriddle result:", unriddleResult);
        
        if (typeof unriddleResult === 'object' && 'result' in unriddleResult) {
          resultText = unriddleResult.result;
        } else {
          resultText = unriddleResult as string;
        }
        
        console.log("Final result text:", resultText);
        
        // Show the result popup
        const basePrompt = `Rewrite the following text in plain, simple words for a general audience. Do not use phrases like 'it means' or 'it describes'—just give the transformed meaning directly. Be concise and clear. Respond in ${settings.language || 'English'}.`;
        const fullPrompt = `${basePrompt}\nPage Title: ${context.page_title || ""}\nSection Heading: ${context.section_heading || ""}\nContext Snippet: ${context.context_snippet || ""}\nUser Selection: "${context.user_selection || ""}"`;
        await showUnriddlePopup(selectedText, false, resultText, false, fullPrompt, settings.language);
        
        // Get the popup and result span
        const popup = document.getElementById("unriddle-popup");
        console.log("Popup found:", !!popup);
        
        if (popup) {
          resultSpan = popup.querySelector(".unriddle-result") as HTMLElement;
          console.log("Result span found:", !!resultSpan);
        }
      }
      
      // Final processing for both streaming and non-streaming paths
      if (resultSpan) {
        // Unescape quotes and apply markdown processing
        const unescapedResult = unescapeQuotes(resultText);
        console.log("Unescaped result:", unescapedResult);
        resultSpan.innerHTML = simpleMarkdownToHtml(unescapedResult);
      }
      
      // Update the time spent in the meta row
      const popup = document.getElementById("unriddle-popup");
      if (popup) {
        const timeSpan = popup.querySelector(".unriddle-time-text");
        if (timeSpan) {
          timeSpan.textContent = `⏱️ Time used: ${((Date.now() - startTime) / 1000).toFixed(2)}s`;
        }
        
        // Update feedback button data attributes with the final result
        const feedbackBtn = popup.querySelector('.unriddle-feedback-btn') as HTMLElement;
        if (feedbackBtn) {
          feedbackBtn.dataset.result = resultText;
        }
      }
    } catch (err: any) {
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