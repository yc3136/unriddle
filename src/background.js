/**
 * Background script for the unriddle Chrome Extension
 * Handles context menu creation and message routing to content scripts
 */

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "unriddle-context-menu",
    title: "unriddle",
    contexts: ["selection"]
  });
});

// Handle context menu clicks and route messages to content scripts
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "unriddle-context-menu" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "UNRIDDLE_SELECTED_TEXT",
      text: info.selectionText
    });
  }
});

// Handle keyboard shortcut commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "trigger-unriddle") {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        return;
      }

      // Execute script to get selected text from the page
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return window.getSelection().toString().trim();
        }
      });

      const selectedText = results[0]?.result;
      
      if (selectedText) {
        // Send message to content script with the selected text
        chrome.tabs.sendMessage(tab.id, {
          action: "UNRIDDLE_SELECTED_TEXT",
          text: selectedText
        });
      }
    } catch (error) {
      //
    }
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "OPEN_OPTIONS_PAGE") {
    chrome.runtime.openOptionsPage();
  }
}); 