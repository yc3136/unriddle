/**
 * HTML template for the in-page popup
 * Uses {{variable}} placeholders for dynamic content
 * 
 * WHY THIS IS A JS FILE INSTEAD OF HTML:
 * 
 * 1. **Chrome Extension Content Script Limitations**: 
 *    - Content scripts run in isolated worlds and cannot directly access HTML files
 *    - HTML files would need to be injected via fetch() or stored as strings anyway
 *    - JS modules can be imported directly by content scripts
 * 
 * 2. **Template Variable Substitution**:
 *    - JavaScript template literals allow easy variable interpolation
 *    - The renderTemplate() function can process {{variable}} placeholders
 *    - HTML files would require additional parsing/processing logic
 * 
 * 3. **Build Process Simplicity**:
 *    - No need for additional build steps to process HTML templates
 *    - Template is bundled with the extension code
 *    - Easier to maintain and version control
 * 
 * 4. **Performance**:
 *    - No additional HTTP requests to load template files
 *    - Template is available immediately when content script loads
 *    - Reduces extension startup time
 * 
 * 5. **Security**:
 *    - Template is part of the extension bundle, not external files
 *    - No risk of template injection from external sources
 *    - Content Security Policy (CSP) compliance is easier
 * 
 * 6. **Development Experience**:
 *    - Template and renderer logic are co-located
 *    - Easier to refactor and maintain
 *    - Better IDE support for template variables
 */

// Type definitions
export interface TemplateVariables {
  direction?: string;
  loadingDisplay?: string;
  resultDisplay?: string;
  resultId?: string;
  resultDirection?: string;
  resultStyles?: string;
  resultContent?: string;
  timeText?: string;
  copyButtonDisplay?: string;
  prompt?: string;
  selectedText?: string;
  resultData?: string;
  language?: string;
  additionalInstructions?: string;
  modelDisplayName?: string;
  currentModel?: string;
  warningDisplay?: string;
  [key: string]: string | undefined;
}

export const IN_PAGE_POPUP_TEMPLATE = `
  <div id="unriddle-popup" class="unriddle-popup" role="dialog" aria-modal="true" tabindex="-1" dir="{{direction}}">
    <!-- Focus trap start -->
    <div class="unriddle-focus-trap" tabindex="0" aria-hidden="true"></div>
    
    <!-- Loading state -->
    <div class="unriddle-loading-state" style="display: {{loadingDisplay}};">
      <div class="loader" role="status" aria-live="polite" aria-label="Loading" aria-busy="true">
        <div class="segment"></div><div class="segment"></div><div class="segment"></div><div class="segment"></div>
      </div>
      <span class="unriddle-loading-text">unriddling</span>
    </div>
    
    <!-- Result state -->
    <div class="unriddle-result-state" style="display: {{resultDisplay}};">
      <!-- Result content -->
      <span id="{{resultId}}" class="unriddle-result" dir="{{resultDirection}}" style="{{resultStyles}}">
        {{resultContent}}
      </span>
      
      <!-- Meta row with buttons -->
      <div class="unriddle-meta-row">
        <span class="unriddle-time-text">{{timeText}}</span>
        
        <!-- Copy prompt button -->
        <button class="unriddle-copy-prompt-btn" aria-label="Copy LLM context for follow up" title="Copy LLM context for follow up" data-prompt="{{prompt}}" style="display: {{copyButtonDisplay}};">
          <span class="material-icons-outlined unriddle-icon">smart_toy</span>
        </button>
        
        <!-- Settings button -->
        <button class="unriddle-settings-btn" aria-label="Open Settings" title="Open Settings">
          <span class="material-icons-outlined unriddle-icon">settings</span>
        </button>
        
        <!-- Feedback button -->
        <button class="unriddle-feedback-btn" aria-label="Send Feedback" title="Send Feedback" data-text="{{selectedText}}" data-result="{{resultData}}" data-prompt="{{prompt}}" data-language="{{language}}" data-instructions="{{additionalInstructions}}">
          <span class="material-icons-outlined unriddle-icon">feedback</span>
        </button>
      </div>
      
      <!-- Model chip row -->
      <div class="unriddle-model-chip-row">
        <div class="unriddle-model-chip" title="Current model: {{modelDisplayName}}. Click to change in settings." data-model="{{currentModel}}">
          {{modelDisplayName}}
        </div>
      </div>
      
      <!-- Shared key warning -->
      <div class="unriddle-shared-key-warning" style="display: {{warningDisplay}};">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <strong>Using shared API key</strong> - This has limited quota. 
          <a href="#" class="warning-link">Set your own key</a> to avoid exceeding API quota.
        </div>
      </div>
    </div>
    
    <!-- Focus trap end -->
    <div class="unriddle-focus-trap" tabindex="0" aria-hidden="true"></div>
  </div>
`;

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(str: string): string {
  return String(str).replace(/[&<>'"]/g, function (c) {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return c;
    }
  });
}

/**
 * Simple template renderer that replaces {{variable}} placeholders with values
 * Escapes all variables except for resultContent, which is trusted HTML from the markdown sanitizer
 * @param template - HTML template string
 * @param variables - Object containing variable values
 * @returns Rendered HTML string
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    if (variable === 'resultContent') {
      return variables[variable] !== undefined ? variables[variable] as string : match;
    }
    return variables[variable] !== undefined ? escapeHtml(variables[variable] as string) : match;
  });
} 