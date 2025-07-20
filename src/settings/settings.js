/**
 * Settings page script for the Unriddle Chrome Extension
 * 
 * Handles loading and saving user preferences using Chrome storage API
 */

import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_DISPLAY_NAMES } from "../config/languages.js";

const DEFAULT_SETTINGS = {
  language: DEFAULT_LANGUAGE,
  geminiApiKey: "",
  contextWindowSize: 40 // default to 40 words
};

class SettingsManager {
  constructor() {
    this.languageSelect = document.getElementById('language-select');
    this.contextWindowInput = document.getElementById('context-window-input');
    this.saveButton = document.getElementById('save-settings');
    this.apiKeyInput = document.getElementById('api-key-input');
    this.toggleApiKeyBtn = document.getElementById('toggle-api-key');
    this.apiKeyStatus = document.getElementById('api-key-status');
    
    if (this.languageSelect && this.saveButton) {
      this.populateLanguageDropdown();
      this.initializeEventListeners();
      this.loadSettings();
    } else {
      console.error('SettingsManager: Required elements not found:', {
        languageSelect: !!this.languageSelect,
        saveButton: !!this.saveButton
      });
    }
  }

  populateLanguageDropdown() {
    // Clear existing options
    this.languageSelect.innerHTML = '';
    
    // Add options using display names
    SUPPORTED_LANGUAGES.forEach(language => {
      const option = document.createElement('option');
      option.value = language;
      option.textContent = LANGUAGE_DISPLAY_NAMES[language] || language;
      this.languageSelect.appendChild(option);
    });
  }

  initializeEventListeners() {
    this.saveButton.addEventListener('click', () => {
      this.saveSettings();
    });

    this.languageSelect.addEventListener('change', () => {
      this.saveSettings();
    });

    // Context window input
    if (this.contextWindowInput) {
      this.contextWindowInput.addEventListener('input', () => {
        this.saveSettings();
      });
    }

    // API key toggle button
    if (this.toggleApiKeyBtn) {
      this.toggleApiKeyBtn.addEventListener('click', () => {
        this.toggleApiKeyVisibility();
      });
    }

    // API key input change
    if (this.apiKeyInput) {
      this.apiKeyInput.addEventListener('input', () => {
        this.updateApiKeyStatus();
        this.saveSettings(); // Auto-save when API key changes
      });
    }

    // Add keyboard shortcut for saving (Ctrl+S)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.saveSettings();
      }
    });
  }

  toggleApiKeyVisibility() {
    if (this.apiKeyInput.type === 'password') {
      this.apiKeyInput.type = 'text';
      this.toggleApiKeyBtn.textContent = '🙈';
      this.toggleApiKeyBtn.setAttribute('aria-label', 'Hide API key');
    } else {
      this.apiKeyInput.type = 'password';
      this.toggleApiKeyBtn.textContent = '👁';
      this.toggleApiKeyBtn.setAttribute('aria-label', 'Show API key');
    }
  }

  updateApiKeyStatus() {
    if (!this.apiKeyStatus) return;
    
    const apiKey = this.apiKeyInput.value.trim();
    const statusText = this.apiKeyStatus.querySelector('.status-text');
    
    if (apiKey) {
      this.apiKeyStatus.className = 'api-key-status has-key';
      this.apiKeyStatus.innerHTML = `
        <span class="status-icon">✅</span>
        <span class="status-text">Using your API key</span>
      `;
    } else {
      this.apiKeyStatus.className = 'api-key-status no-key';
      this.apiKeyStatus.innerHTML = `
        <span class="status-icon">⚠️</span>
        <span class="status-text">No API key set - using extension's shared key</span>
      `;
    }
  }

  async loadSettings() {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        throw new Error('Chrome storage API not available');
      }

      const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
      const settings = { ...DEFAULT_SETTINGS, ...result };
      this.languageSelect.value = settings.language;

      if (this.contextWindowInput) {
        this.contextWindowInput.value = (settings.contextWindowSize === undefined || settings.contextWindowSize === null || settings.contextWindowSize === "") ? "" : settings.contextWindowSize;
      }

      if (this.apiKeyInput) {
        this.apiKeyInput.value = settings.geminiApiKey || '';
        this.updateApiKeyStatus();
      }
    } catch (error) {
      console.error('SettingsManager: Error loading settings:', error);
      this.showStatus(`Error loading settings: ${error.message}`, 'error');
    }
  }

  showToast(message, type = 'success') {
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

  dismissToast(toast) {
    if (toast && toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  async saveSettings() {
    try {
      let contextWindowValue = this.contextWindowInput ? this.contextWindowInput.value : "";
      let contextWindowSize;
      if (contextWindowValue === "") {
        contextWindowSize = ""; // full page
      } else {
        contextWindowSize = parseInt(contextWindowValue, 10);
        if (isNaN(contextWindowSize) || contextWindowSize < 0) {
          contextWindowSize = 40; // fallback to default (words)
        }
      }
      const settings = {
        language: this.languageSelect.value,
        contextWindowSize,
        geminiApiKey: this.apiKeyInput ? this.apiKeyInput.value : ""
      };

      if (!SUPPORTED_LANGUAGES.includes(settings.language)) {
        throw new Error('Invalid language selection');
      }

      if (typeof chrome === 'undefined' || !chrome.storage) {
        throw new Error('Chrome storage API not available');
      }

      await chrome.storage.sync.set(settings);
      this.showToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('SettingsManager: Error saving settings:', error);
      this.showToast(`Error saving settings: ${error.message}`, 'error');
    }
  }

  showStatus(message, type = 'success') {
    this.showToast(message, type);
  }

  clearStatus() {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      this.dismissToast(existingToast);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SettingsManager();
});

// Reload settings when page becomes visible (in case settings were changed elsewhere)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
}); 