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
      <span class="unriddle-loader" role="status" aria-live="polite" aria-label="Loading" aria-busy="true">
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
      </span>
      <span class="unriddle-loading-text">unriddling...</span>
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
 * Simple template renderer that replaces {{variable}} placeholders with values
 * @param template - HTML template string
 * @param variables - Object containing variable values
 * @returns Rendered HTML string
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return variables[variable] !== undefined ? variables[variable] : match;
  });
} 