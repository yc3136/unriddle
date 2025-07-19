# unriddle Chrome Extension

**unriddle** helps you understand selected text by explaining, simplifying, or translating it using LLMs. Great for cultural references, slang, jargon, and more.

## Features
- Right-click any selected text to "unriddle" it
- LLM-powered explanations using Google's Gemini API
- **Multi-language support** - Get explanations in 80+ languages
- **Settings page** - Customize your language preference
- Clean, accessible popup UI near your selection
- Smart context gathering for better explanations
- Loading indicator with animated feedback
- Dark/light theme support
- Built with modern tooling (Vite, Manifest V3)

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
Unriddle supports **80+ languages** including:
- **Major Languages**: English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Hindi, Portuguese, Russian
- **Regional Languages**: Dutch, Italian, Swedish, Norwegian, Danish, Finnish, Polish, Czech, Hungarian, Romanian
- **Asian Languages**: Thai, Vietnamese, Indonesian, Malay, Tagalog, Burmese, Khmer, Lao
- **African Languages**: Swahili, Hausa, Yoruba, Zulu, Xhosa, Igbo
- **And many more...**

### Accessing Settings
1. **From Extension Popup**: Click the extension icon, then click "Settings"
2. **From In-Page Popup**: After getting an explanation, click the gear icon (⚙️) in the popup
3. **Direct Access**: Right-click the extension icon and select "Options"

### Changing Language
1. Open the settings page
2. Select your preferred language from the dropdown
3. Click "Save" or press Ctrl+S
4. Your preference is automatically saved and will be used for future explanations

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
│   │   └── languages.js      # Supported languages list
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
- Select any text on a web page
- Right-click and choose "In other words"
- See the explanation popup near your selection
- Use keyboard navigation (Escape to close)
- Click outside to dismiss
- **Quick access to settings**: Click the gear icon (⚙️) in the popup

## Features

### **Multi-Language Support**
- **80+ languages** supported by Gemini API
- **Native language names** in settings dropdown
- **Automatic language detection** in prompts
- **Persistent language preference** saved to Chrome storage

### **Settings & Customization**
- **Dedicated settings page** accessible from multiple entry points
- **Toast notifications** for save confirmation
- **Keyboard shortcuts** (Ctrl+S to save)
- **Auto-save** on language change
- **Settings persistence** across browser sessions

### **Smart Context Gathering**
- Automatically expands selection to include surrounding context
- Finds relevant section headings for better context
- Limits context to 500 characters for cost efficiency

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

## Permissions

The extension requires the following permissions:
- **`contextMenus`**: To create the right-click context menu
- **`scripting`**: To inject content scripts
- **`activeTab`**: To access the current tab for text selection
- **`storage`**: To save user language preferences

## Security Notes
- Never commit your `.env` file (it's already in `.gitignore`)
- The API key is injected at build time and bundled into the extension
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
- Use ES6+ features
- Follow the existing module structure
- Keep functions focused and single-purpose
- Add comments for complex logic

## Build System

The project uses Vite for fast development and optimized production builds:

- **Development**: Hot module replacement, source maps, preserved console logs
- **Production**: Minification, code splitting, optimized assets
- **Modular**: Automatic chunk splitting for better caching

See [BUILD.md](./BUILD.md) for detailed build documentation.

---

_Made with ❤️ as a personal project to help everyone understand more!_ 