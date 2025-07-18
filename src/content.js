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
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.setAttribute("tabindex", "-1"); // Make focusable
  // Custom focus style to avoid default blue border
  popup.style.outline = "none";
  popup.style.boxShadow = "0 0 0 2px #a0c4ff"; // Subtle blue shadow for accessibility
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
  popup.style.flexDirection = "column";

  // Focus trap elements
  const focusTrapStart = document.createElement("div");
  focusTrapStart.tabIndex = 0;
  focusTrapStart.setAttribute("aria-hidden", "true");
  const focusTrapEnd = document.createElement("div");
  focusTrapEnd.tabIndex = 0;
  focusTrapEnd.setAttribute("aria-hidden", "true");
  popup.appendChild(focusTrapStart);

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
    spinner.setAttribute("role", "status");
    spinner.setAttribute("aria-live", "polite");
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
    let resultText = result;
    if (isHtml) {
      resultSpan.innerHTML = simpleMarkdownToHtml(resultText.replace(/\n?⏱️ Time used: [\d.]+s/, ""));
    } else {
      resultSpan.textContent = resultText.replace(/\n?⏱️ Time used: [\d.]+s/, "");
    }
    // LLM response text left-aligned
    resultSpan.style.textAlign = "left";
    resultSpan.style.width = "100%";
    resultSpan.style.display = "block";
    popup.appendChild(resultSpan);

    // --- Inline time spent and feedback button ---
    const metaRow = document.createElement("div");
    metaRow.style.display = "flex";
    metaRow.style.alignItems = "center";
    metaRow.style.justifyContent = "space-between";
    metaRow.style.gap = "8px";
    metaRow.style.marginTop = "10px";
    metaRow.style.width = "100%";

    // Time spent sentence (left-aligned)
    let timeText = "";
    if (typeof result === 'string') {
      const timeMatch = result.match(/⏱️ Time used: [\d.]+s/);
      if (timeMatch) {
        timeText = timeMatch[0];
      }
    }
    const timeSpan = document.createElement("span");
    timeSpan.textContent = timeText;
    timeSpan.style.fontSize = "0.95em";
    timeSpan.style.color = "#888";
    timeSpan.style.flex = "1 1 auto";
    metaRow.appendChild(timeSpan);

    // Feedback icon button (right-aligned, no border, icon color #888)
    const feedbackBtn = document.createElement("button");
    feedbackBtn.setAttribute("aria-label", "Send Feedback");
    feedbackBtn.title = "Send Feedback";
    feedbackBtn.style.width = "32px";
    feedbackBtn.style.height = "32px";
    feedbackBtn.style.display = "flex";
    feedbackBtn.style.alignItems = "center";
    feedbackBtn.style.justifyContent = "center";
    feedbackBtn.style.background = "transparent";
    feedbackBtn.style.border = "none";
    feedbackBtn.style.borderRadius = "50%";
    feedbackBtn.style.cursor = "pointer";
    feedbackBtn.style.boxShadow = "none";
    feedbackBtn.style.transition = "background 0.2s";
    feedbackBtn.onmouseover = () => feedbackBtn.style.background = "#e0e0e0";
    feedbackBtn.onmouseout = () => feedbackBtn.style.background = "transparent";
    feedbackBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 22V5a2 2 0 0 1 2-2h13l-1.34 5.36a2 2 0 0 0 0 1.28L19 17H6a2 2 0 0 1-2-2z"/>
        <line x1="4" y1="22" x2="4" y2="22"/>
      </svg>
    `; // flag icon, color #888
    feedbackBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdJUcgB0AbgSI59oE_O7DFBSKOivFWLNpCXXH4WMBsKrnHanw/viewform";
      const params = new URLSearchParams({
        "entry.378537756": "", // Feedback message (user will fill)
        "entry.784312090": window.location.href, // Page URL
        "entry.1050436188": text, // Selected Text
        "entry.572050706": typeof result === 'string' ? result : "" // LLM Output
      });
      window.open(`${baseUrl}?${params.toString()}`, "_blank");
    };
    metaRow.appendChild(feedbackBtn);

    // Insert metaRow after the result
    popup.appendChild(metaRow);
  }

  popup.appendChild(focusTrapEnd);
  document.body.appendChild(popup);

  // Focus the popup for accessibility
  setTimeout(() => { popup.focus(); }, 0);

  // Add spinner animation style
  if (!document.getElementById("unriddle-spinner-style")) {
    const style = document.createElement("style");
    style.id = "unriddle-spinner-style";
    style.textContent = `@keyframes unriddle-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }

  // Add focus-visible style for keyboard users
  if (!document.getElementById("unriddle-popup-focus-style")) {
    const style = document.createElement("style");
    style.id = "unriddle-popup-focus-style";
    style.textContent = `#unriddle-popup:focus-visible { outline: none; box-shadow: 0 0 0 2px #1976d2; }`;
    document.head.appendChild(style);
  }

  // Focus trap logic
  function trapFocus(e) {
    const focusable = popup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.target === focusTrapStart && e.shiftKey) {
      last.focus();
      e.preventDefault();
    } else if (e.target === focusTrapEnd && !e.shiftKey) {
      first.focus();
      e.preventDefault();
    }
  }
  focusTrapStart.addEventListener('focus', trapFocus);
  focusTrapEnd.addEventListener('focus', trapFocus);

  // Keyboard: Escape closes popup
  function handleKeydown(e) {
    if (e.key === "Escape") {
      removeUnriddlePopup();
      // Restore focus to previously focused element if needed
      if (window._unriddlePrevFocus && typeof window._unriddlePrevFocus.focus === 'function') {
        window._unriddlePrevFocus.focus();
        window._unriddlePrevFocus = null;
      }
    }
  }
  popup.addEventListener('keydown', handleKeydown);

  // Save previous focus
  window._unriddlePrevFocus = document.activeElement;
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