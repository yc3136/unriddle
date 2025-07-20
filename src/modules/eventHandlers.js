/**
 * Event handling module for the unriddle Chrome Extension
 * Manages user interactions and popup behavior
 */

/**
 * Sets up global event handlers for popup interactions
 * Handles click-outside-to-close functionality
 */
export function setupEventHandlers() {
  // Close popup when clicking outside of it
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#unriddle-popup")) {
      // Remove popup directly instead of importing the function
      const popup = document.getElementById("unriddle-popup");
      if (popup) {
        popup.remove();
      }
    }
  });
} 