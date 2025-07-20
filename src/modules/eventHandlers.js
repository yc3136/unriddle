/**
 * Event handling module for the unriddle Chrome Extension
 * Manages user interactions and popup behavior
 */

import { removeUnriddlePopup } from '../popup/inPagePopup.js';

/**
 * Sets up global event handlers for popup interactions
 * Handles click-outside-to-close functionality
 */
export function setupEventHandlers() {
  // Close popup when clicking outside of it
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#unriddle-popup")) {
      removeUnriddlePopup();
    }
  });
} 