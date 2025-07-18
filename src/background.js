chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "unriddle-context-menu",
    title: "unriddle: Explain/Simplify/Translate",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "unriddle-context-menu" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "UNRIDDLE_SELECTED_TEXT",
      text: info.selectionText
    });
  }
}); 