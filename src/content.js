import { unriddleText } from "./llmApi.js";

function getSelectionCoords() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;
  const range = selection.getRangeAt(0).cloneRange();
  const rect = range.getBoundingClientRect();
  return { x: rect.left + window.scrollX, y: rect.bottom + window.scrollY };
}

function showUnriddlePopup(text, loading = true, result = "", isHtml = false) {
  let popup = document.getElementById("unriddle-popup");
  if (popup) popup.remove();

  popup = document.createElement("div");
  popup.id = "unriddle-popup";
  popup.style.position = "absolute";
  popup.style.zIndex = 99999;
  popup.style.background = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  popup.style.padding = "16px";
  popup.style.fontSize = "16px";
  popup.style.maxWidth = "320px";
  popup.style.minWidth = "200px";
  popup.style.color = "#222";
  popup.style.display = "flex";
  popup.style.alignItems = "center";
  popup.style.gap = "12px";

  const coords = getSelectionCoords();
  if (coords) {
    popup.style.left = `${coords.x}px`;
    popup.style.top = `${coords.y + 8}px`;
  } else {
    popup.style.left = `50%`;
    popup.style.top = `50%`;
    popup.style.transform = "translate(-50%, -50%)";
  }

  if (loading) {
    const spinner = document.createElement("span");
    spinner.className = "unriddle-spinner";
    spinner.style.border = "4px solid #f3f3f3";
    spinner.style.borderTop = "4px solid #3498db";
    spinner.style.borderRadius = "50%";
    spinner.style.width = "24px";
    spinner.style.height = "24px";
    spinner.style.animation = "unriddle-spin 1s linear infinite";
    popup.appendChild(spinner);
    const loadingText = document.createElement("span");
    loadingText.textContent = "Unriddling...";
    popup.appendChild(loadingText);
  } else {
    const resultSpan = document.createElement("span");
    if (isHtml) {
      resultSpan.innerHTML = simpleMarkdownToHtml(result);
    } else {
      resultSpan.textContent = result;
    }
    popup.appendChild(resultSpan);
  }

  document.body.appendChild(popup);

  // Add spinner animation style
  if (!document.getElementById("unriddle-spinner-style")) {
    const style = document.createElement("style");
    style.id = "unriddle-spinner-style";
    style.textContent = `@keyframes unriddle-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
}

function removeUnriddlePopup() {
  const popup = document.getElementById("unriddle-popup");
  if (popup) popup.remove();
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("#unriddle-popup")) {
    removeUnriddlePopup();
  }
});

// --- unriddleText function (updated for speed and brevity) ---

// --- Simple Markdown to HTML converter ---
function simpleMarkdownToHtml(md) {
  if (!md) return "";
  // Bold **text** or __text__
  let html = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  // Italic *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  // Links [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  return html;
}
// --- end markdown converter ---

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.action === "UNRIDDLE_SELECTED_TEXT") {
    // --- Context Expansion Logic ---
    // 1. Get the current selection (if available)
    let selection = window.getSelection();
    let selectedText = msg.text;
    let contextSnippet = selectedText;
    let sectionHeading = "";
    let pageTitle = document.title;

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Expand to containing paragraph or block
      let node = range.commonAncestorContainer;
      while (node && node.nodeType !== Node.ELEMENT_NODE) node = node.parentNode;
      let block = node && (node.closest('p,li,blockquote,td,th,div,section,article') || node);
      if (block && block.innerText) {
        // Limit context to 500 characters for cost/privacy
        contextSnippet = block.innerText.trim().slice(0, 500);
      }
      // Find nearest heading
      let headingNode = node;
      while (headingNode && !/^H[1-6]$/.test(headingNode.tagName)) headingNode = headingNode.previousElementSibling;
      if (headingNode && headingNode.innerText) {
        sectionHeading = headingNode.innerText.trim();
      }
    }

    // Fallback: try to find a heading above the selection
    if (!sectionHeading) {
      let headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      let bestHeading = headings.reverse().find(h => h.compareDocumentPosition(selection.anchorNode) & Node.DOCUMENT_POSITION_PRECEDING);
      if (bestHeading) sectionHeading = bestHeading.innerText.trim();
    }

    // Compose context object
    const context = {
      page_title: pageTitle,
      section_heading: sectionHeading,
      context_snippet: contextSnippet,
      user_selection: selectedText
    };

    showUnriddlePopup(selectedText, true);
    const startTime = Date.now();
    try {
      const result = await unriddleText(context);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      showUnriddlePopup(selectedText, false, `${result}\n\n⏱️ Time used: ${elapsed}s`, true);
    } catch (err) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      showUnriddlePopup(selectedText, false, `Error: ${err.message || err}\n\n⏱️ Time used: ${elapsed}s`, true);
    }
  }
});