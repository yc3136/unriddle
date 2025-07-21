/**
 * In-page popup management module for the unriddle Chrome Extension
 * Handles creation, styling, and interaction of in-page popups using HTML templates
 *
 * NOTE: Requires Material Icons stylesheet in your HTML:
 * <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
 */

import { simpleMarkdownToHtml } from '../modules/markdownProcessor.js';
// Template approach: See inPagePopupTemplate.js for why this is a JS file instead of HTML
import { IN_PAGE_POPUP_TEMPLATE, renderTemplate } from './inPagePopupTemplate.js';

// List of supported right-to-left (RTL) languages (inlined to avoid shared chunk issues)
const RTL_LANGUAGES = [
  'Arabic',
  'Hebrew',
  'Persian',
  'Urdu'
];

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
 * Prepares template variables for the popup
 * @param {string} text - The selected text
 * @param {boolean} loading - Whether to show loading state
 * @param {string} result - The result to display
 * @param {boolean} isHtml - Whether the result contains HTML
 * @param {string} prompt - The prompt used (optional)
 * @param {string} language - The language to use for direction (optional)
 * @returns {Object} Template variables
 */
async function prepareTemplateVariables(text, loading, result, isHtml, prompt, language) {
  // Determine text direction
  let direction = 'ltr';
  let resultDirection = 'ltr';
  if (language && RTL_LANGUAGES.includes(language)) {
    direction = 'rtl';
    resultDirection = 'rtl';
  }

  // Display states
  const loadingDisplay = loading ? 'flex' : 'none';
  const resultDisplay = loading ? 'none' : 'block';
  const copyButtonDisplay = prompt ? 'flex' : 'none';

  // Time text extraction
  let timeText = "";
  if (typeof result === 'string') {
    const timeMatch = result.match(/⏱️ Time used: [\d.]+s/);
    if (timeMatch) {
      timeText = timeMatch[0];
    }
  }

  // Result content processing
  let resultContent = "";
  let resultStyles = "";
  let resultId = "";
  
  if (!loading) {
    // Load font settings
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

    // Process result content
    let resultText = result;
    if (isHtml) {
      resultContent = simpleMarkdownToHtml(resultText.replace(/\n?⏱️ Time used: [\d.]+s/, ""));
    } else {
      resultContent = resultText.replace(/\n?⏱️ Time used: [\d.]+s/, "");
    }

    // Generate result ID
    resultId = `unriddle-result-${Date.now()}`;

    // Apply font styles
    if (fontSettings.useDynamicFont) {
      const fontStyles = getSelectionFontStyles();
      resultStyles = `font-family: ${fontStyles.fontFamily}; font-size: ${fontStyles.fontSize}; font-weight: ${fontStyles.fontWeight}; font-style: ${fontStyles.fontStyle};`;
    } else {
      resultStyles = `font-family: ${fontSettings.customFontFamily}; font-size: ${fontSettings.customFontSize}px;`;
    }
  }

  // Get current model
  let currentModel = "gemini-2.5-flash";
  let modelDisplayName = "Gemini 2.5 Flash";
  try {
    const result = await chrome.storage.sync.get({ selectedModel: "gemini-2.5-flash" });
    currentModel = result.selectedModel;
    
    const modelDisplayNames = {
      'gemini-1.5-flash': 'Gemini 1.5 Flash',
      'gemini-1.5-pro': 'Gemini 1.5 Pro',
      'gemini-2.0-flash': 'Gemini 2.0 Flash',
      'gemini-2.0-pro': 'Gemini 2.0 Pro',
      'gemini-2.5-flash': 'Gemini 2.5 Flash',
      'gemini-2.5-pro': 'Gemini 2.5 Pro'
    };
    modelDisplayName = modelDisplayNames[currentModel] || currentModel;
  } catch (e) {
    // fallback to default
  }

  // Check if user has API key
  let warningDisplay = 'none';
  try {
    const result = await chrome.storage.sync.get({ geminiApiKey: "" });
    const hasUserApiKey = result.geminiApiKey && result.geminiApiKey.trim() !== '';
    if (!hasUserApiKey) {
      warningDisplay = 'flex';
    }
  } catch (error) {
    // fallback to hidden
  }

  return {
    direction,
    loadingDisplay,
    resultDisplay,
    copyButtonDisplay,
    timeText,
    resultContent,
    resultStyles,
    resultId,
    resultDirection,
    selectedText: text || "",
    resultData: typeof result === 'string' ? result : "",
    prompt: prompt || "",
    language: language || "",
    additionalInstructions: "",
    currentModel,
    modelDisplayName,
    warningDisplay
  };
}

/**
 * Sets up event handlers for the popup elements
 * @param {Element} popup - The popup element
 * @param {string} text - The selected text
 * @param {string} result - The result
 * @param {string} prompt - The prompt
 * @param {string} language - The language
 */
function setupPopupEventHandlers(popup, text, result, prompt, language) {
  // Copy prompt button
  const copyBtn = popup.querySelector('.unriddle-copy-prompt-btn');
  if (copyBtn) {
    copyBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      const promptData = copyBtn.dataset.prompt;
      if (!promptData) return;
      const url = window.location.href;
      const textToCopy = `${promptData}\n\n[Source: ${url}]\n- from unriddle Chrome Extension`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showCopySuccessMessage(copyBtn, "Prompt copied to clipboard");
      });
    };
  }

  // Settings button
  const settingsBtn = popup.querySelector('.unriddle-settings-btn');
  if (settingsBtn) {
    settingsBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({ action: "OPEN_OPTIONS_PAGE" });
    };
  }

  // Feedback button
  const feedbackBtn = popup.querySelector('.unriddle-feedback-btn');
  if (feedbackBtn) {
    feedbackBtn.onclick = async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Gather settings from chrome.storage.sync
      const DEFAULT_FONT_SETTINGS = {
        useDynamicFont: true,
        customFontFamily: 'Arial',
        customFontSize: 16
      };
      const DEFAULT_LLM_CONFIG = {
        model: '',
        temperature: '',
        maxTokens: ''
      };
      let fontSettings = DEFAULT_FONT_SETTINGS;
      let llmConfig = DEFAULT_LLM_CONFIG;
      let lang = language || '';
      
      try {
        const fontResult = await chrome.storage.sync.get(DEFAULT_FONT_SETTINGS);
        fontSettings = { ...DEFAULT_FONT_SETTINGS, ...fontResult };
      } catch (e) {}
      
      try {
        const llmResult = await chrome.storage.sync.get(DEFAULT_LLM_CONFIG);
        llmConfig = { ...DEFAULT_LLM_CONFIG, ...llmResult };
        if (llmConfig.geminiApiKey) delete llmConfig.geminiApiKey;
      } catch (e) {}
      
      if (!lang && typeof window !== 'undefined' && window.unriddleLanguage) {
        lang = window.unriddleLanguage;
      }
      
      const fontString = JSON.stringify(fontSettings);
      let llmConfigString = JSON.stringify(llmConfig);
      if (feedbackBtn.dataset.instructions) {
        llmConfigString += `\nAdditional LLM Instructions: ${feedbackBtn.dataset.instructions}`;
      }
      
      const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdJUcgB0AbgSI59oE_O7DFBSKOivFWLNpCXXH4WMBsKrnHanw/viewform";
      const params = new URLSearchParams({
        "entry.378537756": "",
        "entry.784312090": window.location.href,
        "entry.1050436188": feedbackBtn.dataset.text || "",
        "entry.572050706": feedbackBtn.dataset.result || "",
        "entry.1330249385": fontString,
        "entry.2020962734": llmConfigString,
        "entry.342051201": lang
      });
      window.open(`${baseUrl}?${params.toString()}`, "_blank");
    };
  }

  // Model chip
  const modelChip = popup.querySelector('.unriddle-model-chip');
  if (modelChip) {
    modelChip.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({ action: 'openSettings' });
    };
  }

  // Shared key warning link
  const warningLink = popup.querySelector('.warning-link');
  if (warningLink) {
    warningLink.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({ action: "OPEN_OPTIONS_PAGE" });
    };
  }

  // Error links in result content
  const errorLinks = popup.querySelectorAll('.error-link');
  errorLinks.forEach(link => {
    link.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({ action: "OPEN_OPTIONS_PAGE" });
    };
  });
}

/**
 * Shows the unriddle popup with loading state or results using HTML templates
 * @param {string} text - The selected text
 * @param {boolean} loading - Whether to show loading state
 * @param {string} result - The result to display
 * @param {boolean} isHtml - Whether the result contains HTML
 * @param {string} prompt - The prompt used (optional)
 * @param {string} language - The language to use for direction (optional)
 */
export async function showUnriddlePopup(text, loading = true, result = "", isHtml = false, prompt = undefined, language = undefined) {
  let popup = document.getElementById("unriddle-popup");
  if (popup) popup.remove();

  // Inject CSS styles if not already done
  injectPopupStyles();
  injectMaterialIconsStylesheet();

  // Prepare template variables
  const templateVars = await prepareTemplateVariables(text, loading, result, isHtml, prompt, language);
  
  // Render the popup using template
  const renderedHtml = renderTemplate(IN_PAGE_POPUP_TEMPLATE, templateVars);
  
  // Create popup element from rendered HTML
  const temp = document.createElement('div');
  temp.innerHTML = renderedHtml;
  popup = temp.firstElementChild;

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

  // Add to DOM
  document.body.appendChild(popup);

  // Setup event handlers
  setupPopupEventHandlers(popup, text, result, prompt, language);

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