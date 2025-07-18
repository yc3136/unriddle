# unriddle Chrome Extension

**unriddle** helps you understand selected text by explaining, simplifying, or translating it using LLMs. Great for cultural references, slang, jargon, and more.

## Features
- Right-click any selected text to "unriddle" it
- LLM-powered explanations using Google's Gemini API
- Clean popup UI near your selection
- Loading indicator while processing
- Built with modern tooling (Vite, Manifest V3)

## Prerequisites
- Node.js (v16 or higher)
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Development Setup

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

## Development Workflow

- **Build for development**: `npm run build`
- **Watch for changes**: `npm run dev` (if you add a dev script)
- **Load updated extension**: Click the refresh icon on `chrome://extensions/`

## Project Structure
```
unriddle/
├── src/
│   ├── background.js      # Service worker
│   ├── content.js         # Content script
│   └── popup/
│       ├── popup.html     # Popup UI
│       ├── popup.js       # Popup logic
│       └── popup.css      # Popup styles
├── icons/                 # Extension icons
├── manifest.json          # Chrome extension manifest
├── vite.config.mjs        # Vite build configuration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
└── .gitignore            # Git ignore rules
```

## Usage
- Select any text on a web page
- Right-click and choose "unriddle: Explain/Simplify/Translate"
- See the explanation popup near your selection

## Security Notes
- Never commit your `.env` file (it's already in `.gitignore`)
- The API key is injected at build time and bundled into the extension
- Keep your API key secure and rotate it if needed

## Contributing
Pull requests welcome! Please open issues for suggestions or bugs.

### Development Guidelines
- Follow the existing code structure
- Test your changes by rebuilding and reloading the extension
- Ensure your API key is properly set in `.env`

---

_Made with ❤️ as a personal project to help everyone understand more!_ 