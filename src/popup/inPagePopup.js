/**
 * In-page popup management module for the Unriddle Chrome Extension
 * Handles creation, styling, and interaction of in-page popups
 *
 * NOTE: Requires Material Icons stylesheet in your HTML:
 * <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
 */

import { simpleMarkdownToHtml } from '../modules/markdownProcessor.js';

/**
 * Gets the coordinates of the current text selection
 * @returns {Object|null} Coordinates {x, y} or null if no selection
 */
function getSelectionCoords() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;
  const range = selection.getRangeAt(0).cloneRange();
  const rect = range.getBoundingClientRect();
  return { x: rect.left + window.scrollX, y: rect.bottom + window.scrollY };
}

/**
 * Gets font styles from the current text selection for consistent styling
 * @returns {Object} Font styles {fontFamily, fontSize, fontWeight, fontStyle}
 */
function getSelectionFontStyles() {
  let fontFamily = "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";
  let fontSize = '0.98em';
  let fontWeight = '400';
  let fontStyle = 'normal';
  
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    let node = selection.anchorNode;
    if (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    if (node && node.nodeType === Node.ELEMENT_NODE) {
      const computed = window.getComputedStyle(node);
      fontFamily = computed.fontFamily || fontFamily;
      fontSize = computed.fontSize || fontSize;
      fontWeight = computed.fontWeight || fontWeight;
      fontStyle = computed.fontStyle || fontStyle;
    }
  }
  
  return { fontFamily, fontSize, fontWeight, fontStyle };
}

/**
 * Injects the popup CSS styles into the page if not already loaded
 */
function injectPopupStyles() {
  if (!document.getElementById("unriddle-inpage-popup-styles")) {
    const link = document.createElement("link");
    link.id = "unriddle-inpage-popup-styles";
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("popup/inPagePopup.css");
    document.head.appendChild(link);
  }
}

/**
 * Injects the Material Icons stylesheet into the page if not already loaded
 */
function injectMaterialIconsStylesheet() {
  if (!document.getElementById("unriddle-material-icons-styles")) {
    const link = document.createElement("link");
    link.id = "unriddle-material-icons-styles";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";
    document.head.appendChild(link);
  }
}

function createLoader() {
  const loader = document.createElement("span");
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-live", "polite");
  loader.setAttribute("aria-label", "Loading");
  loader.setAttribute("aria-busy", "true");
  loader.className = "unriddle-loader";
  loader.innerHTML = `
    <svg width="96" height="32" viewBox="0 0 96 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="unknot-gradient" x1="0" y1="16" x2="96" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#43e97b"/>
          <stop offset="20%" stop-color="#38f9d7"/>
          <stop offset="40%" stop-color="#6a82fb"/>
          <stop offset="60%" stop-color="#fc5c7d"/>
          <stop offset="80%" stop-color="#fcb045"/>
          <stop offset="100%" stop-color="#ffd200"/>
        </linearGradient>
      </defs>
      <path
        d="M16 16 Q20 4, 36 12 Q52 20, 32 24 Q16 28, 24 16 Q32 4, 48 16"
        stroke="url(#unknot-gradient)"
        stroke-width="3"
        stroke-linecap="round"
        fill="none">
        <animate attributeName="d"
          values="M16 16 Q20 4, 36 12 Q52 20, 32 24 Q16 28, 24 16 Q32 4, 48 16;M48 16 Q56 16, 64 16 Q72 16, 80 16 Q88 16, 88 16 Q88 16, 88 16, 88 16;M16 16 Q20 4, 36 12 Q52 20, 32 24 Q16 28, 24 16 Q32 4, 48 16"
          keyTimes="0;0.5;1"
          dur="2.13s"
          repeatCount="indefinite"/>
      </path>
    </svg>
  `;
  return loader;
}

function createFeedbackButton(text, result) {
  const feedbackBtn = document.createElement("button");
  feedbackBtn.setAttribute("aria-label", "Send Feedback");
  feedbackBtn.title = "Send Feedback";
  feedbackBtn.className = "unriddle-feedback-btn";
  feedbackBtn.innerHTML = `
    <span class="material-icons-outlined unriddle-icon">feedback</span>
  `;
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
  return feedbackBtn;
}

function createSettingsButton() {
  const settingsBtn = document.createElement("button");
  settingsBtn.setAttribute("aria-label", "Open Settings");
  settingsBtn.title = "Open Settings";
  settingsBtn.className = "unriddle-settings-btn";
  settingsBtn.innerHTML = `
    <span class="material-icons-outlined unriddle-icon">settings</span>
  `;
  settingsBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    // Send message to background script to open options page
    chrome.runtime.sendMessage({ action: "OPEN_OPTIONS_PAGE" });
  };
  return settingsBtn;
}

function createSharedKeyWarning() {
  const warningDiv = document.createElement("div");
  warningDiv.className = "unriddle-shared-key-warning";
  warningDiv.innerHTML = `
    <div class="warning-icon">⚠️</div>
    <div class="warning-text">
      <strong>Using shared API key</strong> - This has limited quota. 
      <a href="#" class="warning-link">Set your own key</a> to avoid exceeding API quota.
    </div>
  `;
  
  // Add click handler for the link
  const link = warningDiv.querySelector('.warning-link');
  link.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({ action: "OPEN_OPTIONS_PAGE" });
  };
  
  return warningDiv;
}

function createCopyPromptButton(prompt) {
  const copyBtn = document.createElement("button");
  copyBtn.setAttribute("aria-label", "Copy LLM context for follow up");
  copyBtn.title = "Copy LLM context for follow up";
  copyBtn.className = "unriddle-copy-prompt-btn";
  copyBtn.innerHTML = `
    <span class="material-icons-outlined unriddle-icon">smart_toy</span>
  `;
  copyBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!prompt) return;
    const url = window.location.href;
    const textToCopy = `${prompt}\n\n[Source: ${url}]\n- from unriddle Chrome Extension`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showCopySuccessMessage(copyBtn, "Prompt copied to clipboard");
    });
  };
  return copyBtn;
}

function showCopySuccessMessage(btn, message) {
  // Remove any existing message
  let existing = document.getElementById("unriddle-copy-success-msg");
  if (existing) existing.remove();
  // Find the meta row
  let metaRow = btn.closest('.unriddle-meta-row');
  if (!metaRow) metaRow = btn.parentElement;
  const msg = document.createElement('div');
  msg.id = "unriddle-copy-success-msg";
  msg.textContent = message;
  msg.style.fontSize = '0.97em';
  msg.style.color = '#219150';
  msg.style.marginTop = '6px';
  msg.style.textAlign = 'center';
  msg.style.width = '100%';
  metaRow.parentElement.insertBefore(msg, metaRow.nextSibling);
  setTimeout(() => { msg.remove(); }, 1200);
}

function createMetaRow(text, result, prompt) {
  const metaRow = document.createElement("div");
  metaRow.className = "unriddle-meta-row";

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
  timeSpan.className = "unriddle-time-text";
  metaRow.appendChild(timeSpan);

  // Copy prompt button (leftmost)
  if (prompt) {
    const copyBtn = createCopyPromptButton(prompt);
    metaRow.appendChild(copyBtn);
  }

  // Settings button
  const settingsBtn = createSettingsButton();
  metaRow.appendChild(settingsBtn);

  // Feedback button
  const feedbackBtn = createFeedbackButton(text, result);
  metaRow.appendChild(feedbackBtn);

  return metaRow;
}

// This function is no longer needed as styles are now in CSS file
function addPopupStyles() {
  // Styles are now handled by CSS file
}

function setupFocusTrap(popup) {
  const focusTrapStart = document.createElement("div");
  focusTrapStart.tabIndex = 0;
  focusTrapStart.setAttribute("aria-hidden", "true");
  focusTrapStart.className = "unriddle-focus-trap";
  
  const focusTrapEnd = document.createElement("div");
  focusTrapEnd.tabIndex = 0;
  focusTrapEnd.setAttribute("aria-hidden", "true");
  focusTrapEnd.className = "unriddle-focus-trap";
  
  popup.appendChild(focusTrapStart);

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
  
  return focusTrapEnd;
}

function setupKeyboardHandlers(popup) {
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
}

/**
 * Shows the unriddle popup with loading state or results
 * @param {string} text - The selected text
 * @param {boolean} loading - Whether to show loading state
 * @param {string} result - The result text to display
 * @param {boolean} isHtml - Whether the result contains HTML
 */
export async function showUnriddlePopup(text, loading = true, result = "", isHtml = false, prompt = undefined) {
  let popup = document.getElementById("unriddle-popup");
  if (popup) popup.remove();

  // Inject CSS styles if not already done
  injectPopupStyles();
  injectMaterialIconsStylesheet(); // Ensure Material Icons are available

  popup = document.createElement("div");
  popup.id = "unriddle-popup";
  popup.className = "unriddle-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.setAttribute("tabindex", "-1");

  // Setup focus trap
  const focusTrapEnd = setupFocusTrap(popup);

  // Position popup (dynamic styles that need to stay in JS)
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
    const loader = createLoader();
    popup.appendChild(loader);
    
    const loadingText = document.createElement("span");
    loadingText.textContent = "Unriddling...";
    loadingText.className = "unriddle-loading-text";
    popup.appendChild(loadingText);
  } else {
    // Load font settings before rendering result
    const DEFAULT_FONT_SETTINGS = {
      useDynamicFont: true,
      customFontFamily: 'Arial',
      customFontSize: 16
    };
    let fontSettings = DEFAULT_FONT_SETTINGS;
    try {
      const result = await chrome.storage.sync.get(DEFAULT_FONT_SETTINGS);
      fontSettings = { ...DEFAULT_FONT_SETTINGS, ...result };
    } catch (e) {
      // fallback to default
    }

    const resultSpan = document.createElement("span");
    let resultText = result;
    if (isHtml) {
      resultSpan.innerHTML = simpleMarkdownToHtml(resultText.replace(/\n?⏱️ Time used: [\d.]+s/, ""));
    } else {
      resultSpan.textContent = resultText.replace(/\n?⏱️ Time used: [\d.]+s/, "");
    }
    
    resultSpan.className = "unriddle-result";
    
    const resultId = `unriddle-result-${Date.now()}`;
    resultSpan.id = resultId;
    
    // Apply font styles based on settings
    if (fontSettings.useDynamicFont) {
      const fontStyles = getSelectionFontStyles();
      Object.assign(resultSpan.style, fontStyles);
    } else {
      resultSpan.style.fontFamily = fontSettings.customFontFamily;
      resultSpan.style.fontSize = fontSettings.customFontSize + 'px';
    }
    
    // Add click handlers for error links
    const errorLinks = resultSpan.querySelectorAll('.error-link');
    errorLinks.forEach(link => {
      link.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        chrome.runtime.sendMessage({ action: "OPEN_OPTIONS_PAGE" });
      };
    });
    
    popup.appendChild(resultSpan);
    popup.setAttribute('aria-labelledby', resultId);

    const metaRow = createMetaRow(text, result, prompt);
    popup.appendChild(metaRow);
    
    // Check if user has set their own API key and show warning if not
    try {
      const result = await chrome.storage.sync.get({ geminiApiKey: "" });
      const hasUserApiKey = result.geminiApiKey && result.geminiApiKey.trim() !== '';
      
      if (!hasUserApiKey) {
        const sharedKeyWarning = createSharedKeyWarning();
        popup.appendChild(sharedKeyWarning);
      }
    } catch (error) {
      console.error('Error checking API key status:', error);
    }
  }

  popup.appendChild(focusTrapEnd);
  document.body.appendChild(popup);

  // Focus the popup for accessibility (without causing page scroll)
  setTimeout(() => { 
    // Store current scroll position
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    popup.focus();
    
    // Restore scroll position if it changed
    if (window.scrollX !== scrollX || window.scrollY !== scrollY) {
      window.scrollTo(scrollX, scrollY);
    }
  }, 0);

  addPopupStyles();
  setupKeyboardHandlers(popup);

  // Save previous focus
  window._unriddlePrevFocus = document.activeElement;
}

/**
 * Removes the unriddle popup from the page
 */
export function removeUnriddlePopup() {
  const popup = document.getElementById("unriddle-popup");
  if (popup) popup.remove();
  if (window._unriddleRemoveGradient) window._unriddleRemoveGradient();
} 