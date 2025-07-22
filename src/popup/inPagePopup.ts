/**
 * In-page popup management module for the unriddle Chrome Extension
// Error logger for unriddle extension (single source of truth)
export interface ErrorLogEntry {
  message: string;
  name?: string;
  stack?: string;
  context?: any;
  timestamp: string;
  extensionVersion?: string;
  browserVersion?: string;
}

export function sanitizeError(error: any): Partial<ErrorLogEntry> {
  if (!error) return { message: 'Unknown error' };
  if (typeof error === 'string') return { message: error };
  return {
    message: error.message || String(error),
    name: error.name,
    stack: error.stack ? error.stack.split('\n').slice(0, 5).join('\n') : undefined // limit stack
  };
}

export async function logError(error: any, context?: any) {
  const sanitized = sanitizeError(error);
  const entry: ErrorLogEntry = {
    message: sanitized.message || 'Unknown error',
    name: sanitized.name,
    stack: sanitized.stack,
    context: context ? JSON.stringify(context) : undefined,
    timestamp: new Date().toISOString(),
    extensionVersion: (chrome.runtime && chrome.runtime.getManifest) ? chrome.runtime.getManifest().version : undefined,
    browserVersion: navigator.userAgent
  };
  try {
    const { unriddleErrorLogs = [] } = await chrome.storage.local.get('unriddleErrorLogs');
    unriddleErrorLogs.push(entry);
    await chrome.storage.local.set({ unriddleErrorLogs });
  } catch (e) {
    // Fallback: log to console if storage fails
    console.error('Failed to log error:', entry, e);
  }
}

export async function getErrorLogs(): Promise<ErrorLogEntry[]> {
  const { unriddleErrorLogs = [] } = await chrome.storage.local.get('unriddleErrorLogs');
  return unriddleErrorLogs;
}

export async function clearErrorLogs() {
  await chrome.storage.local.remove('unriddleErrorLogs');
}

if (typeof window !== 'undefined') {
  (window as any).logError = logError;
  (window as any).sanitizeError = sanitizeError;
  (window as any).getErrorLogs = getErrorLogs;
  (window as any).clearErrorLogs = clearErrorLogs;
}


if (typeof window !== 'undefined') {
  (window as any).logError = logError;
  (window as any).sanitizeError = sanitizeError;
  (window as any).getErrorLogs = getErrorLogs;
  (window as any).clearErrorLogs = clearErrorLogs;
}



 * Handles creation, styling, and interaction of in-page popups using HTML templates
 *
 * NOTE: Requires Material Icons stylesheet in your HTML:
 * <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
 */

/// <reference types="chrome"/>

import { simpleMarkdownToHtml } from '../modules/markdownProcessor.js';
// Template approach: See inPagePopupTemplate.js for why this is a JS file instead of HTML
import { IN_PAGE_POPUP_TEMPLATE, renderTemplate, TemplateVariables } from './inPagePopupTemplate.js';

// Type definitions
interface Coordinates {
  x: number;
  y: number;
}

interface FontStyles {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
}

interface FontSettings {
  useDynamicFont: boolean;
  customFontFamily: string;
  customFontSize: number;
}

interface LLMConfig {
  model: string;
  temperature: string;
  maxTokens: string;
}

// List of supported right-to-left (RTL) languages (inlined to avoid shared chunk issues)
const RTL_LANGUAGES = [
  'Arabic',
  'Hebrew',
  'Persian',
  'Urdu'
];

/**
 * Gets the coordinates of the current text selection
 * @returns Coordinates {x, y} or null if no selection
 */
function getSelectionCoords(): Coordinates | null {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0).cloneRange();
  const rect = range.getBoundingClientRect();
  return { x: rect.left + window.scrollX, y: rect.bottom + window.scrollY };
}

/**
 * Gets font styles from the current text selection for consistent styling
 * @returns Font styles {fontFamily, fontSize, fontWeight, fontStyle}
 */
function getSelectionFontStyles(): FontStyles {
  let fontFamily = "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";
  let fontSize = '0.98em';
  let fontWeight = '400';
  let fontStyle = 'normal';
  
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    let node = selection.anchorNode;
    if (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    if (node && node.nodeType === Node.ELEMENT_NODE) {
      const computed = window.getComputedStyle(node as Element);
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
function injectPopupStyles(): void {
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
function injectMaterialIconsStylesheet(): void {
  if (!document.getElementById("unriddle-material-icons-styles")) {
    const link = document.createElement("link");
    link.id = "unriddle-material-icons-styles";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";
    document.head.appendChild(link);
  }
}

function showCopySuccessMessage(btn: HTMLElement, message: string): void {
  // Remove any existing message
  let existing = document.getElementById("unriddle-copy-success-msg");
  if (existing) existing.remove();
  // Find the meta row
  let metaRow = btn.closest('.unriddle-meta-row') as HTMLElement;
  if (!metaRow) metaRow = btn.parentElement as HTMLElement;
  const msg = document.createElement('div');
  msg.id = "unriddle-copy-success-msg";
  msg.textContent = message;
  msg.style.fontSize = '0.97em';
  msg.style.color = '#219150';
  msg.style.marginTop = '6px';
  msg.style.textAlign = 'center';
  msg.style.width = '100%';
  metaRow.parentElement!.insertBefore(msg, metaRow.nextSibling);
  setTimeout(() => { msg.remove(); }, 1200);
}

function setupKeyboardHandlers(popup: HTMLElement): void {
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      removeUnriddlePopup();
      // Restore focus to previously focused element if needed
      if ((window as any)._unriddlePrevFocus && typeof (window as any)._unriddlePrevFocus.focus === 'function') {
        (window as any)._unriddlePrevFocus.focus();
        (window as any)._unriddlePrevFocus = null;
      }
    }
  }
  popup.addEventListener('keydown', handleKeydown);
}

/**
 * Prepares template variables for the popup
 * @param text - The selected text
 * @param loading - Whether to show loading state
 * @param result - The result to display
 * @param isHtml - Whether the result contains HTML
 * @param prompt - The prompt used (optional)
 * @param language - The language to use for direction (optional)
 * @returns Template variables
 */
async function prepareTemplateVariables(
  text: string, 
  loading: boolean, 
  result: string, 
  isHtml: boolean, 
  prompt?: string, 
  language?: string
): Promise<TemplateVariables> {
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
    const DEFAULT_FONT_SETTINGS: FontSettings = {
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
    
    const modelDisplayNames: Record<string, string> = {
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

  // Check if user has API key and get additional instructions
  let warningDisplay = 'none';
  let additionalInstructions = "";
  try {
    const result = await chrome.storage.sync.get({ 
      geminiApiKey: "",
      additionalLLMInstructions: ""
    });
    const hasUserApiKey = result.geminiApiKey && result.geminiApiKey.trim() !== '';
    if (!hasUserApiKey) {
      warningDisplay = 'flex';
    }
    additionalInstructions = result.additionalLLMInstructions || "";
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
    additionalInstructions,
    currentModel,
    modelDisplayName,
    warningDisplay
  };
}

/**
 * Sets up event handlers for the popup elements
 * @param popup - The popup element
 * @param text - The selected text
 * @param result - The result
 * @param prompt - The prompt
 * @param language - The language
 */
function setupPopupEventHandlers(
  popup: HTMLElement, 
  _text: string, 
  _result: string, 
  _prompt: string | undefined, 
  language: string | undefined
): void {
  // Copy prompt button
  const copyBtn = popup.querySelector('.unriddle-copy-prompt-btn') as HTMLElement;
  if (copyBtn) {
    copyBtn.onclick = function(e: Event) {
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
  const settingsBtn = popup.querySelector('.unriddle-settings-btn') as HTMLElement;
  if (settingsBtn) {
    settingsBtn.onclick = function(e: Event) {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({ action: "OPEN_OPTIONS_PAGE" });
    };
  }

  // Feedback button
  const feedbackBtn = popup.querySelector('.unriddle-feedback-btn') as HTMLElement;
  if (feedbackBtn) {
    feedbackBtn.onclick = async function(e: Event) {
      e.preventDefault();
      e.stopPropagation();
      
      // Gather settings from chrome.storage.sync
      const DEFAULT_FONT_SETTINGS: FontSettings = {
        useDynamicFont: true,
        customFontFamily: 'Arial',
        customFontSize: 16
      };
      const DEFAULT_LLM_CONFIG: LLMConfig = {
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
        if ((llmConfig as any).geminiApiKey) delete (llmConfig as any).geminiApiKey;
      } catch (e) {}
      
      if (!lang && typeof window !== 'undefined' && (window as any).unriddleLanguage) {
        lang = (window as any).unriddleLanguage;
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
      // Add error log context if available (but never sensitive data)
      try {
        const logs = (window as any).getErrorLogs();
        if (logs && logs.length > 0) {
          params.set('entry.123456789', JSON.stringify(logs.slice(-3))); // Add last 3 errors (example field)
        }
      } catch (e) {}
      window.open(`${baseUrl}?${params.toString()}`, "_blank");
    };
  }

  // Model chip
  const modelChip = popup.querySelector('.unriddle-model-chip') as HTMLElement;
  if (modelChip) {
    modelChip.onclick = function(e: Event) {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({ action: 'openSettings' });
    };
  }

  // Shared key warning link
  const warningLink = popup.querySelector('.warning-link') as HTMLElement;
  if (warningLink) {
    warningLink.onclick = function(e: Event) {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({ action: "OPEN_OPTIONS_PAGE" });
    };
  }

  // Error links in result content
  const errorLinks = popup.querySelectorAll('.error-link');
  errorLinks.forEach(link => {
    (link as HTMLElement).onclick = function(e: Event) {
      e.preventDefault();
      e.stopPropagation();
      (window as any).logError('User clicked error link', { phase: 'popup.errorLink', errorContent: popup.textContent });
      chrome.runtime.sendMessage({ action: "OPEN_OPTIONS_PAGE" });
    };
  });
}

/**
 * Shows the unriddle popup with loading state or results using HTML templates
 * @param text - The selected text
 * @param loading - Whether to show loading state
 * @param result - The result to display
 * @param isHtml - Whether the result contains HTML
 * @param prompt - The prompt used (optional)
 * @param language - The language to use for direction (optional)
 */
export async function showUnriddlePopup(
  text: string, 
  loading: boolean = true, 
  result: string = "", 
  isHtml: boolean = false, 
  prompt?: string, 
  language?: string
): Promise<void> {
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
  popup = temp.firstElementChild as HTMLElement;

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
  (window as any)._unriddlePrevFocus = document.activeElement;
}

/**
 * Removes the unriddle popup from the page
 */
export function removeUnriddlePopup(): void {
  const popup = document.getElementById("unriddle-popup");
  if (popup) popup.remove();
  if ((window as any)._unriddleRemoveGradient) (window as any)._unriddleRemoveGradient();
} 