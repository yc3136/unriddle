/**
 * Background script for the Unriddle Chrome Extension
 * Handles context menu creation and message routing to content scripts
 */

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "unriddle-context-menu",
    title: "In other words",
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