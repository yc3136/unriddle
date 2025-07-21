# unriddle Chrome Extension

**What's New in 1.4.0**
- Improved streaming: More robust, faster, and now works reliably for all responses
- Cleaner UI: Settings page and popup have a refreshed, modern look
- Version number is now managed only in the manifest (removed from settings page for easier maintenance)
- Internal cleanup: All debug logging removed for production

**unriddle** helps you understand selected text by explaining, simplifying, or translating it using LLMs. Great for cultural references, slang, jargon, and more.

## Features
- **Keyboard shortcut** - Press `Ctrl+Shift+U` (Windows/Linux) or `Cmd+Shift+U` (Mac) to quickly unriddle selected text
- Right-click any selected text to "unriddle" it
- LLM-powered explanations using Google's Gemini API
- **Model Selection** - Choose from 6 available Gemini models (Flash and Pro variants) to balance speed vs. quality
- **Multi-language support** - Get explanations in 80+ languages
- **Right-to-left (RTL) language support** - For languages like Arabic, Hebrew, Persian, and Urdu, the LLM response in the popup is automatically displayed right-to-left and right-aligned, while the rest of the popup remains in English and left-to-right.
- **Settings page** - Customize your language, font, and more
- **Streaming output** - See explanations appear faster and more smoothly with improved streaming (now robust and chunked)
- **Template-based popup UI** - Clean, accessible popup using HTML templates with dynamic variable substitution for better maintainability
- - **Modern meta row icons** - Uses Material Icons (Outlined) for feedback, settings, and copy prompt actions in the in-page popup
- - **Animated & vibrant icons** - Meta row icons feature a playful scale-up animation and color transition on hover, with vibrant blue in light mode and light blue in dark mode for clear contrast
- - **Dark mode support** - All icons and UI elements adapt for both light and dark themes, ensuring readability and a polished look
- - **Accessible** - Icons and buttons are fully keyboard and screen reader accessible
- - **Streamlined feedback form** - When you click the feedback button in the popup, a Google Form opens with all relevant extension settings (font, LLM configuration except API key, language, and any additional LLM instructions) automatically included. This helps us provide better support and debugging.
- Smart context gathering for better explanations
- Loading indicator with animated feedback
- Dark/light theme support
- Built with modern tooling (Vite, TypeScript, Manifest V3)

## Prerequisites
- Node.js (v16 or higher)
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Quick Start

1. **Clone this repository**
   ```bash
   git clone <your-repo-url>
   cd unriddle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your-actual-api-key-here
   ```
   
   **Important**: If you forked this repository, you must set up your own API key in the `.env` file since the original shared key is not included in the repository for security reasons.
   
   **Note**: You can also set your API key directly in the extension settings after installation for easier management.

4. **Build the extension**
   ```bash
   npm run build
   ```

5. **Load in Chrome**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked" and select the `dist` folder

## Settings & Configuration

### Language Support
unriddle supports **80+ languages** including:
- **Major Languages**: English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Hindi, Portuguese, Russian
- **Regional Languages**: Dutch, Italian, Swedish, Norwegian, Danish, Finnish, Polish, Czech, Hungarian, Romanian
- **Asian Languages**: Thai, Vietnamese, Indonesian, Malay, Tagalog, Burmese, Khmer, Lao
- **African Languages**: Swahili, Hausa, Yoruba, Zulu, Xhosa, Igbo
- **And many more...**

**RTL Languages:**
For Arabic, Hebrew, Persian, and Urdu, the LLM response is shown right-to-left and right-aligned for proper readability. All other popup content remains in English and left-to-right.

### Accessing Settings
1. **From Extension Popup**: Click the extension icon, then click "Settings"
2. **From In-Page Popup**: After getting an explanation, click the gear icon (⚙️) in the popup
3. **Direct Access**: Right-click the extension icon and select "Options"

*Note: The version number is now managed only in the manifest and not shown in the settings page, to avoid duplicate updates.*

### Changing Language
1. Open the settings page
2. Select your preferred language from the dropdown
3. Click "Save" or press Ctrl+S
4. Your preference is automatically saved and will be used for future explanations

### LLM Configuration (API Key, Model Selection, Context Window & Additional LLM Instructions)

unriddle lets you configure your Gemini API key, choose which model to use, how much context is sent to the LLM, and provide additional instructions for the LLM output:

- **API Key**: Currently, unriddle only works with Gemini. More API provider integration coming soon.
- **Model Selection**: Choose from 6 available Gemini models:
  - **Flash Models** (faster, good for most tasks): Gemini 1.5 Flash, Gemini 2.0 Flash, Gemini 2.5 Flash
  - **Pro Models** (higher quality, better for complex topics): Gemini 1.5 Pro, Gemini 2.0 Pro, Gemini 2.5 Pro
  - Default is Gemini 2.5 Flash (recommended for most users)
- **Context Window Size**: Set the number of words of surrounding context to include with your selection (default: 40 words). Leave empty for full page, or enter 0 for only your selection. Higher values may improve explanations but use more API quota.
- **Additional LLM Instructions**: Add extra instructions that will be included with every LLM request. For example, you can ask the LLM to "explain as if to a 5 year old", "use a friendly tone", or any other style or audience preference. This is useful for customizing the output to your needs.
- **Language Selection**: Choosing a language other than English may increase response time, as the LLM may take longer to process translations.

**Note:** Using a different language, selecting a Pro model, or adding additional LLM instructions can increase the time it takes to receive a response, as these options require more processing by the LLM.

#### How to Configure
1. Open the settings page
2. Scroll to the "LLM Configuration" section
3. Enter your Gemini API key (see instructions above)
4. Select your preferred model from the dropdown
5. Set your preferred context window size (in words)
6. Add any additional LLM instructions in the provided field (optional)
7. Changes are saved automatically

### Font Configuration (Popup Font Customization)
unriddle lets you control the font used for LLM responses in the in-page popup:

- **Dynamic Font (default):** The popup matches the font family and size of your selected text for seamless integration with any website.
- **Custom Font:** Choose from a wide selection of browser-supported fonts (Arial, Times New Roman, Roboto, etc.) and set your preferred font size. A live preview is shown as you adjust the settings.

To configure:
1. Open the settings page
2. Scroll to the "Font Configuration" section
3. Select either "Use dynamic font" or "Use custom font"
4. If using custom font, pick your font family and size, and see the live example
5. Save your settings

Your font preference will be used for all future LLM responses in the popup.

### API Key Management (Bring Your Own Key)

unriddle supports two ways to provide your Gemini API key:

#### Option 1: Settings Page (Recommended)
1. Open the settings page
2. Scroll to the "Gemini API Key" section
3. Click the link to [Google AI Studio](https://makersuite.google.com/app/apikey) to get your API key
4. Copy your API key and paste it in the input field
5. The key is automatically saved as you type
6. Your API key is stored securely in Chrome's sync storage

#### Option 2: Environment Variable (Development)
1. Copy `.env.example` to `.env`
2. Add your API key: `VITE_GEMINI_API_KEY=your_api_key_here`
3. Rebuild the extension

#### How It Works
- **Priority System**: The extension first checks for a user-provided key in settings, then falls back to the environment variable
- **Secure Storage**: User keys are stored locally in Chrome's sync storage, never sent to our servers
- **Auto-Save**: API key changes are automatically saved, no need to click a save button
- **Visual Feedback**: Settings page shows whether you're using your own key or the shared key

#### Why Use Your Own API Key?
- **Free**: Gemini API keys are completely free
- **Unlimited Usage**: No quota restrictions with your own key
- **Reliability**: Avoid shared key quota limits
- **Privacy**: Your API calls go directly to Google, not through our servers
- **Control**: You can monitor and manage your own API usage

#### Getting a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it in the extension settings

**Note**: The shared API key included with the extension has limited quota and may run out. Using your own key ensures uninterrupted service.

**For Repository Forks**: If you forked this repository, you'll need to set up your own API key in the `.env` file as the original shared key is not included in the repository for security reasons.

## Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for development/testing
npm run build:prod   # Build for production (optimized)
npm run preview      # Preview production build locally
npm run clean        # Clean build output directory
```

### Development Workflow
1. Make changes to the source code
2. Run `npm run build` to rebuild
3. Refresh the extension in `chrome://extensions/`
4. Test your changes

## Project Structure

```
unriddle/
├── src/
│   ├── config/               # Configuration files
│   │   ├── languages.js      # Supported languages list
│   │   └── models.js         # Available Gemini models configuration
│   ├── modules/              # Shared utilities
│   │   ├── contextGatherer.js    # Context expansion logic
│   │   ├── markdownProcessor.js  # Markdown to HTML conversion
│   │   └── eventHandlers.js      # Event handling
│   ├── popup/                # Popup-related code
│   │   ├── inPagePopup.js    # In-page popup functionality
│   │   ├── inPagePopup.css   # In-page popup styles
│   │   ├── popup.js          # Extension popup script
│   │   ├── popup.html        # Extension popup HTML
│   │   └── popup.css         # Extension popup styles
│   ├── settings/             # Settings page
│   │   ├── settings.js       # Settings page logic
│   │   ├── settings.html     # Settings page HTML
│   │   └── settings.css      # Settings page styles
│   ├── content.js            # Main content script
│   ├── background.js         # Background script
│   └── llmApi.js            # LLM API integration
├── icons/                    # Extension icons
├── manifest.json             # Chrome extension manifest
├── vite.config.mjs           # Vite build configuration
├── package.json              # Dependencies and scripts
├── BUILD.md                  # Build documentation
├── .env.example              # Environment variables template
└── .gitignore               # Git ignore rules
```

## Architecture

The extension follows a modular architecture with clear separation of concerns:

### **Core Modules**
- **`content.js`**: Main orchestrator for content script functionality
- **`background.js`**: Service worker for extension lifecycle management
- **`llmApi.js`**: LLM API integration and communication

### **Configuration** (`src/config/`)
- **`languages.js`**: Comprehensive list of supported languages with native names

### **Settings System** (`src/settings/`)
- **`settings.js`**: Settings page logic with Chrome storage integration
- **`settings.html/css`**: Settings page interface with toast notifications

### **Utility Modules** (`src/modules/`)
- **`contextGatherer.js`**: Expands selection context for better LLM prompts
- **`markdownProcessor.js`**: Converts markdown to HTML for rich text display
- **`eventHandlers.js`**: Manages user interactions and accessibility

### **Popup System** (`src/popup/`)
- **`inPagePopup.js`**: Creates and manages in-page popups
- **`inPagePopup.css`**: Styles for in-page popups with theme support
- **`popup.js/html/css`**: Extension popup interface

## Usage

### Method 1: Keyboard Shortcut (Recommended)
1. Select any text on a web page
2. Press `Ctrl+Shift+U` (Windows/Linux) or `Cmd+Shift+U` (Mac)
3. The explanation popup will appear near your selection

### Method 2: Context Menu
1. Select any text on a web page
2. Right-click and choose "unriddle"
3. See the explanation popup near your selection

### General Usage
- Use keyboard navigation (Escape to close)
- Click outside to dismiss
- **Quick access to settings**: Click the gear icon (⚙️) in the popup
- **Model indicator**: The current model is shown as a chip in the popup - click it to open settings

## Features

### **Multi-Language Support**
- **80+ languages** supported by Gemini API
- **Native language names** in settings dropdown
- **Automatic language detection** in prompts
- **Persistent language preference** saved to Chrome storage

### **Settings & Customization**
- **Dedicated settings page** accessible from multiple entry points
- **Bring your own API key** with secure local storage and auto-save
- **Smart key management** with priority system (user key → environment variable)
- **Context window size**: Choose how many words of surrounding context to include (default: 40 words; empty = full page; 0 = only selection)
- **Additional LLM instructions**: Add extra instructions to customize the style, tone, or audience for every LLM response
- **Toast notifications** for save confirmation
- **Keyboard shortcuts** (Ctrl+S to save)
- **Auto-save** on language and API key/context changes
- **Settings persistence** across browser sessions

### **Smart Context Gathering**
- Automatically expands selection to include surrounding context
- Finds relevant section headings for better context
- **Limits context by number of words** (default: 40 words; empty = full page; 0 = only selection)

### **Accessibility**
- Full keyboard navigation support
- Screen reader compatible
- Focus management and ARIA attributes
- High contrast support

### **Performance**
- Modular code splitting for faster loading
- Optimized CSS with proper separation of concerns
- Efficient DOM manipulation
- Minimal bundle size
- **Note:** Using a different language or additional LLM instructions may increase response time, as the LLM may take longer to process translations or more complex instructions.

### **Error Handling & User Guidance**
- **Smart error detection** for API key validation and quota issues
- **Helpful error messages** with direct links to settings
- **Proactive warnings** when using shared API key
- **Automatic warning dismissal** when user sets their own key
- **Clear instructions** for getting and setting up API keys

## Permissions

The extension requires the following permissions:
- **`contextMenus`**: To create the right-click context menu
- **`scripting`**: To inject content scripts
- **`activeTab`**: To access the current tab for text selection
- **`storage`**: To save user language preferences

## Security Notes
- Never commit your `.env` file (it's already in `.gitignore`)
- API keys can be set either in `.env` (build time) or in extension settings (runtime)
- User-provided API keys are stored securely in Chrome's sync storage
- Keep your API key secure and rotate it if needed
- No data is stored locally beyond temporary processing and user preferences
- Language preferences are stored securely in Chrome's sync storage

## Contributing
Pull requests welcome! Please open issues for suggestions or bugs.

### Development Guidelines
- Follow the modular architecture pattern
- Use CSS classes for styling (avoid inline styles)
- Maintain accessibility standards
- Test your changes by rebuilding and reloading the extension
- Ensure your API key is properly set in `.env`

### Code Style
- Use TypeScript for type safety and better development experience
- Use ES6+ features
- Follow the existing module structure
- Keep functions focused and single-purpose
- Add comments for complex logic

## Technical Architecture

### Template-Based Popup System
The in-page popup uses a **template-based approach** for better maintainability:

- **HTML Template**: Located in `src/popup/inPagePopupTemplate.ts` with `{{variable}}` placeholders
- **Why TS instead of HTML**: Chrome extension content scripts have limitations accessing external HTML files, so templates are stored as TypeScript template literals for direct import and variable substitution
- **Dynamic Rendering**: Template variables are substituted at runtime with actual content (loading states, results, settings, etc.)
- **Benefits**: Easier UI modifications, better separation of concerns, improved maintainability, type safety

### Modular Structure
The codebase follows a modular architecture:
- **Content Scripts**: Handle page interaction and popup orchestration
- **Modules**: Separated concerns (context gathering, markdown processing, event handling)
- **Templates**: HTML structure with dynamic variable substitution
- **CSS**: Styled components with proper separation of concerns

## Build System

The project uses Vite for fast development and optimized production builds:

- **Development**: Hot module replacement, source maps, preserved console logs
- **Production**: Minification, code splitting, optimized assets
- **Modular**: Automatic chunk splitting for better caching

See [BUILD.md](./BUILD.md) for detailed build documentation.

## Feedback & Bug Reporting

If you encounter issues, have suggestions, or want to provide feedback:

- **In-Page Feedback Button:** After using the extension, click the feedback (💬) button in the popup. This opens a Google Form with the following fields prefilled:
  - The page URL
  - The text you selected
  - The LLM output you received
  - Your font settings (as a JSON string)
  - Your LLM configuration (as a JSON string, excluding your API key)
  - The language used for the popup
  - Any additional LLM instructions you have set
- **Manual Feedback:** You can also [open the feedback form directly](https://docs.google.com/forms/d/e/1FAIpQLSdJUcgB0AbgSI59oE_O7DFBSKOivFWLNpCXXH4WMBsKrnHanw/viewform) and fill it out yourself.

**Note:** Your API key is never included in feedback. All settings are stringified for clarity and support purposes.

---

_Made with ❤️ as a personal project to help everyone understand more!_ 