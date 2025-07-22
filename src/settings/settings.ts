/**
 * Settings page script for the unriddle Chrome Extension
 * 
 * Handles loading and saving user preferences using Chrome sto
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
rage API
 */

/// <reference types="chrome"/>

import { SUPPORTED_MODELS, DEFAULT_MODEL, MODEL_DISPLAY_NAMES, MODEL_DESCRIPTIONS, SupportedModel } from "../config/models.js";
import { SUPPORTED_LANGUAGES, LANGUAGE_DISPLAY_NAMES, DEFAULT_LANGUAGE, SupportedLanguage } from "../config/languages.js";

// Type definitions
interface UserSettings {
  language: SupportedLanguage;
  geminiApiKey: string;
  selectedModel: SupportedModel;
  contextWindowSize: number | string;
  useDynamicFont: boolean;
  customFontFamily: string;
  customFontSize: number;
  additionalLLMInstructions: string;
}

interface SettingsManagerElements {
  languageSelect: HTMLSelectElement;
  contextWindowInput: HTMLInputElement | null;
  saveButton: HTMLButtonElement;
  apiKeyInput: HTMLInputElement | null;
  toggleApiKeyBtn: HTMLButtonElement | null;
  apiKeyStatus: HTMLElement | null;
  modelSelect: HTMLSelectElement | null;
  fontDynamicCheckbox: HTMLInputElement | null;
  fontFamilySelect: HTMLSelectElement | null;
  fontSizeInput: HTMLInputElement | null;
  fontExampleText: HTMLElement | null;
  fontCustomControls: HTMLElement | null;
  fontModeDynamic: HTMLInputElement | null;
  fontModeCustom: HTMLInputElement | null;
  additionalLLMInstructionsInput: HTMLTextAreaElement | null;
}

const DEFAULT_SETTINGS: UserSettings = {
  language: DEFAULT_LANGUAGE,
  geminiApiKey: "",
  selectedModel: DEFAULT_MODEL,
  contextWindowSize: 40, // default to 40 words
  useDynamicFont: true,
  customFontFamily: "Arial",
  customFontSize: 16,
  additionalLLMInstructions: ""
};

class SettingsManager {
  private elements: SettingsManagerElements;

  constructor() {
    this.elements = {
      languageSelect: document.getElementById('language-select') as HTMLSelectElement,
      contextWindowInput: document.getElementById('context-window-input') as HTMLInputElement | null,
      saveButton: document.getElementById('save-settings') as HTMLButtonElement,
      apiKeyInput: document.getElementById('api-key-input') as HTMLInputElement | null,
      toggleApiKeyBtn: document.getElementById('toggle-api-key') as HTMLButtonElement | null,
      apiKeyStatus: document.getElementById('api-key-status'),
      modelSelect: document.getElementById('model-select') as HTMLSelectElement | null,
      fontDynamicCheckbox: document.getElementById('font-dynamic-checkbox') as HTMLInputElement | null,
      fontFamilySelect: document.getElementById('font-family-select') as HTMLSelectElement | null,
      fontSizeInput: document.getElementById('font-size-input') as HTMLInputElement | null,
      fontExampleText: document.getElementById('font-example-text'),
      fontCustomControls: document.getElementById('font-custom-controls'),
      fontModeDynamic: document.getElementById('font-mode-dynamic') as HTMLInputElement | null,
      fontModeCustom: document.getElementById('font-mode-custom') as HTMLInputElement | null,
      additionalLLMInstructionsInput: document.getElementById('custom-prompt-input') as HTMLTextAreaElement | null
    };
    
    if (this.elements.languageSelect && this.elements.saveButton) {
      this.populateLanguageDropdown();
      this.populateModelDropdown();
      this.initializeEventListeners();
      this.loadSettings();
      // Wire up error log buttons
      const copyBtn = document.getElementById('copy-error-logs-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => this.showErrorLogs());
      }
      const clearBtn = document.getElementById('clear-error-logs-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clearErrorLogsUI());
      }
    } else {
      // console.error('SettingsManager: Required elements not found:', {
      //   languageSelect: !!this.elements.languageSelect,
      //   saveButton: !!this.elements.saveButton
      // });
    }
  }

  private populateLanguageDropdown(): void {
    // Clear existing options
    this.elements.languageSelect.innerHTML = '';
    
    // Add options using display names
    SUPPORTED_LANGUAGES.forEach(language => {
      const option = document.createElement('option');
      option.value = language;
      option.textContent = LANGUAGE_DISPLAY_NAMES[language] || language;
      this.elements.languageSelect.appendChild(option);
    });
  }

  private populateModelDropdown(): void {
    if (!this.elements.modelSelect) return;
    
    // Clear existing options
    this.elements.modelSelect.innerHTML = '';
    
    // Add options using display names and short descriptions
    SUPPORTED_MODELS.forEach(model => {
      const option = document.createElement('option');
      const displayName = MODEL_DISPLAY_NAMES[model] || model;
      const description = MODEL_DESCRIPTIONS[model] || '';
      const label = description ? `${displayName} (${description})` : displayName;
      option.value = model;
      option.textContent = label;
      this.elements.modelSelect?.appendChild(option);
    });
  }

  private initializeEventListeners(): void {
    this.elements.saveButton.addEventListener('click', () => {
      this.saveSettings();
    });

    this.elements.languageSelect.addEventListener('change', () => {
      this.saveSettings();
    });

    // Context window input
    if (this.elements.contextWindowInput) {
      this.elements.contextWindowInput.addEventListener('input', () => {
        this.saveSettings();
      });
    }

    // API key toggle button
    if (this.elements.toggleApiKeyBtn) {
      this.elements.toggleApiKeyBtn.addEventListener('click', () => {
        this.toggleApiKeyVisibility();
      });
    }

    // API key input change
    if (this.elements.apiKeyInput) {
      this.elements.apiKeyInput.addEventListener('input', () => {
        this.updateApiKeyStatus();
        this.saveSettings(); // Auto-save when API key changes
      });
    }

    // Clear API Key (×) button
    const clearApiKeyBtn = document.getElementById('clear-api-key');
    if (clearApiKeyBtn) {
      clearApiKeyBtn.addEventListener('click', async () => {
        if (this.elements.apiKeyInput) {
          this.elements.apiKeyInput.value = '';
        }
        await chrome.storage.sync.set({ geminiApiKey: '' });
        this.updateApiKeyStatus();
        this.showToast('API key cleared.', 'success');
      });
    }

    // Model selection change
    if (this.elements.modelSelect) {
      this.elements.modelSelect.addEventListener('change', () => {
        this.saveSettings(); // Auto-save when model changes
      });
    }

    // Font dynamic checkbox
    if (this.elements.fontDynamicCheckbox) {
      this.elements.fontDynamicCheckbox.addEventListener('change', () => {
        this.updateFontCustomControls();
        this.saveSettings();
      });
    }
    if (this.elements.fontFamilySelect) {
      this.elements.fontFamilySelect.addEventListener('change', () => {
        this.updateFontExample();
        this.saveSettings();
      });
    }
    if (this.elements.fontSizeInput) {
      this.elements.fontSizeInput.addEventListener('input', () => {
        this.updateFontExample();
        this.saveSettings();
      });
    }
    if (this.elements.fontModeDynamic && this.elements.fontModeCustom) {
      this.elements.fontModeDynamic.addEventListener('change', () => {
        this.updateFontCustomControls();
        this.saveSettings();
      });
      this.elements.fontModeCustom.addEventListener('change', () => {
        this.updateFontCustomControls();
        this.saveSettings();
      });
    }
    if (this.elements.additionalLLMInstructionsInput) {
      this.elements.additionalLLMInstructionsInput.addEventListener('input', () => {
        this.saveSettings();
      });
    }

    // Add keyboard shortcut for saving (Ctrl+S)
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.saveSettings();
      }
    });
  }

  private toggleApiKeyVisibility(): void {
    if (!this.elements.apiKeyInput || !this.elements.toggleApiKeyBtn) return;
    
    if (this.elements.apiKeyInput.type === 'password') {
      this.elements.apiKeyInput.type = 'text';
      this.elements.toggleApiKeyBtn.textContent = '🙈';
      this.elements.toggleApiKeyBtn.setAttribute('aria-label', 'Hide API key');
    } else {
      this.elements.apiKeyInput.type = 'password';
      this.elements.toggleApiKeyBtn.textContent = '👁';
      this.elements.toggleApiKeyBtn.setAttribute('aria-label', 'Show API key');
    }
  }

  private updateApiKeyStatus(): void {
    if (!this.elements.apiKeyStatus || !this.elements.apiKeyInput) return;
    
    const apiKey = this.elements.apiKeyInput.value.trim();
    
    if (apiKey) {
      this.elements.apiKeyStatus.className = 'api-key-status has-key';
      this.elements.apiKeyStatus.innerHTML = `
        <span class="status-icon">✅</span>
        <span class="status-text">Using your API key</span>
      `;
    } else {
      this.elements.apiKeyStatus.className = 'api-key-status no-key';
      this.elements.apiKeyStatus.innerHTML = `
        <span class="status-icon">⚠️</span>
        <span class="status-text">No API key set - using extension's shared key</span>
      `;
    }
  }

  private updateFontCustomControls(): void {
    if (!this.elements.fontCustomControls || !this.elements.fontModeDynamic || !this.elements.fontModeCustom) return;
    const isDynamic = this.elements.fontModeDynamic.checked;
    this.elements.fontCustomControls.style.display = isDynamic ? 'none' : '';
    this.updateFontExample();
  }

  private updateFontExample(): void {
    if (!this.elements.fontExampleText || !this.elements.fontFamilySelect || !this.elements.fontSizeInput) return;
    this.elements.fontExampleText.style.fontFamily = this.elements.fontFamilySelect.value;
    this.elements.fontExampleText.style.fontSize = this.elements.fontSizeInput.value + 'px';
  }

  private async loadSettings(): Promise<void> {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        throw new Error('Chrome storage API not available');
      }
      const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
      const settings = { ...DEFAULT_SETTINGS, ...result };
      this.elements.languageSelect.value = settings.language;

      if (this.elements.contextWindowInput) {
        this.elements.contextWindowInput.value = (settings.contextWindowSize === undefined || settings.contextWindowSize === null || settings.contextWindowSize === "") ? "" : settings.contextWindowSize.toString();
      }

      if (this.elements.apiKeyInput) {
        this.elements.apiKeyInput.value = settings.geminiApiKey || '';
        this.updateApiKeyStatus();
      }
      if (this.elements.modelSelect) {
        this.elements.modelSelect.value = settings.selectedModel || DEFAULT_MODEL;
      }
      if (this.elements.fontDynamicCheckbox) this.elements.fontDynamicCheckbox.checked = settings.useDynamicFont !== false;
      if (this.elements.fontFamilySelect) this.elements.fontFamilySelect.value = settings.customFontFamily || 'Arial';
      if (this.elements.fontSizeInput) this.elements.fontSizeInput.value = settings.customFontSize.toString() || '16';
      if (this.elements.fontModeDynamic && this.elements.fontModeCustom) {
        if (settings.useDynamicFont !== false) {
          this.elements.fontModeDynamic.checked = true;
          this.elements.fontModeCustom.checked = false;
        } else {
          this.elements.fontModeDynamic.checked = false;
          this.elements.fontModeCustom.checked = true;
        }
      }
      if (this.elements.additionalLLMInstructionsInput) this.elements.additionalLLMInstructionsInput.value = settings.additionalLLMInstructions || '';
      this.updateFontCustomControls();
      this.updateFontExample();
    } catch (error: any) {
      // console.error('SettingsManager: Error loading settings:', error);
      this.showStatus(`Error loading settings: ${error.message}`, 'error');
    }
  }

  private showToast(message: string, type: 'success' | 'error' = 'success'): HTMLElement {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;

    // Create icon
    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    icon.innerHTML = type === 'success' ? `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      ` : `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18.364 18.364A9 9 0 1 1 5.636 5.636a9 9 0 0 1 12.728 12.728zM12 8v4m0 4h.01"/>
        </svg>
      `;

    // Create message
    const messageElement = document.createElement('div');
    messageElement.className = 'toast-message';
    messageElement.textContent = message;

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close notification');
    closeButton.onclick = () => this.dismissToast(toast);

    // Assemble toast
    toast.appendChild(icon);
    toast.appendChild(messageElement);
    toast.appendChild(closeButton);

    // Add to page
    document.body.appendChild(toast);

    // Show animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      this.dismissToast(toast);
    }, 3000);

    return toast;
  }

  // Add method to download/copy error logs
  public async showErrorLogs() {
    try {
      const logs = await (window as any).getErrorLogs();
      const logStr = JSON.stringify(logs, null, 2);
      // Try to use clipboard API
      await navigator.clipboard.writeText(logStr);
      this.showToast('Error logs copied to clipboard!', 'success');
    } catch (e) {
      this.showToast('Failed to copy error logs', 'error');
      await (window as any).logError(e, { phase: 'settings.showErrorLogs' });
    }
  }

  public async clearErrorLogsUI() {
    try {
      await (window as any).clearErrorLogs();
      this.showToast('Error logs cleared!', 'success');
    } catch (e) {
      this.showToast('Failed to clear error logs', 'error');
      await (window as any).logError(e, { phase: 'settings.clearErrorLogsUI' });
    }
  }

  private dismissToast(toast: HTMLElement): void {
    if (toast && toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      let contextWindowValue = this.elements.contextWindowInput ? this.elements.contextWindowInput.value : "";
      let contextWindowSize: number | string;
      if (contextWindowValue === "") {
        contextWindowSize = ""; // full page
      } else {
        contextWindowSize = parseInt(contextWindowValue, 10);
        if (isNaN(contextWindowSize) || contextWindowSize < 0) {
          contextWindowSize = 40; // fallback to default (words)
        }
      }
      const settings: UserSettings = {
        language: this.elements.languageSelect.value as SupportedLanguage,
        selectedModel: this.elements.modelSelect ? this.elements.modelSelect.value as SupportedModel : DEFAULT_MODEL,
        contextWindowSize,
        geminiApiKey: this.elements.apiKeyInput ? this.elements.apiKeyInput.value : "",
        useDynamicFont: this.elements.fontModeDynamic ? this.elements.fontModeDynamic.checked : true,
        customFontFamily: this.elements.fontFamilySelect ? this.elements.fontFamilySelect.value : 'Arial',
        customFontSize: this.elements.fontSizeInput ? parseInt(this.elements.fontSizeInput.value, 10) || 16 : 16,
        additionalLLMInstructions: this.elements.additionalLLMInstructionsInput ? this.elements.additionalLLMInstructionsInput.value : ""
      };

      if (!SUPPORTED_LANGUAGES.includes(settings.language)) {
        throw new Error('Invalid language selection');
      }

      if (typeof chrome === 'undefined' || !chrome.storage) {
        throw new Error('Chrome storage API not available');
      }

      await chrome.storage.sync.set(settings);
      
      // Update the LLM API cache with the new settings
      // We'll use a global function to avoid circular imports
      if ((window as any).updateUnriddleCache) {
        (window as any).updateUnriddleCache({
          geminiApiKey: settings.geminiApiKey,
          additionalLLMInstructions: settings.additionalLLMInstructions,
          selectedModel: settings.selectedModel
        });
      }
      
      this.showToast('Settings saved successfully!', 'success');
    } catch (error: any) {
      await (window as any).logError(error, { phase: 'settings.saveSettings' });
      this.showToast(`Error saving settings: ${error.message}`, 'error');
    }
  }

  private showStatus(message: string, type: 'success' | 'error' = 'success'): void {
    this.showToast(message, type);
  }

  // private clearStatus(): void {
  //   const existingToast = document.querySelector('.toast-notification');
  //   if (existingToast) {
  //     this.dismissToast(existingToast as HTMLElement);
  //   }
  // }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Always hide error logs section initially
  const errorLogsSection = document.getElementById('error-logs-section') as HTMLElement | null;
  if (errorLogsSection) errorLogsSection.style.display = 'none';

  new SettingsManager();
  // Style font family dropdown options
  const fontFamilySelect = document.getElementById('font-family-select') as HTMLSelectElement;
  if (fontFamilySelect) {
    for (let i = 0; i < fontFamilySelect.options.length; i++) {
      const opt = fontFamilySelect.options[i];
      opt.style.fontFamily = opt.value;
    }
  }
  if (window.location.hash === '#model-selection-anchor') {
    const anchor = document.getElementById('model-selection-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      anchor.setAttribute('tabindex', '-1');
      anchor.focus({ preventScroll: true });
    }
  }
});

// Reload settings when page becomes visible (in case settings were changed elsewhere)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
}); 

// Global error handlers
if (typeof window !== 'undefined') {
  window.onerror = (msg, src, line, col, err) => {
    (window as any).logError(err || msg, { src, line, col, phase: 'settings.global' });
  };
  window.onunhandledrejection = (event) => {
    (window as any).logError(event.reason, { type: 'unhandledrejection', phase: 'settings.global' });
  };
} 

// Developer options toggle logic for standard checkbox
const devOptionsToggle = document.getElementById('dev-options-toggle') as HTMLInputElement | null;
const errorLogsSection = document.getElementById('error-logs-section') as HTMLElement | null;
const copyBtn = document.getElementById('copy-error-logs-btn');
const clearBtn = document.getElementById('clear-error-logs-btn');

function updateDevOptionsUI(enabled: boolean) {
  if (errorLogsSection) errorLogsSection.style.display = enabled ? '' : 'none';
  if (devOptionsToggle) devOptionsToggle.checked = enabled;
}

chrome.storage.sync.get({ unriddleDevOptions: false }, (result) => {
  updateDevOptionsUI(!!result.unriddleDevOptions);
});

if (devOptionsToggle) {
  devOptionsToggle.addEventListener('change', () => {
    const enabled = devOptionsToggle.checked;
    chrome.storage.sync.set({ unriddleDevOptions: enabled }, () => {
      updateDevOptionsUI(enabled);
    });
  });
}

if (copyBtn) {
  copyBtn.addEventListener('click', () => (window as any).settingsManager?.showErrorLogs());
}
if (clearBtn) {
  clearBtn.addEventListener('click', () => (window as any).settingsManager?.clearErrorLogsUI());
} 