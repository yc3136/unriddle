# Build Configuration

This document describes the build process and configuration for the unriddle Chrome Extension.

## Build System

The project uses **Vite** as the build tool, which provides:
- Fast development server with hot module replacement
- Optimized production builds
- ES module bundling
- Asset handling

## Build Scripts

```bash
# Development
npm run dev          # Start development server

# Production builds
npm run build        # Build for development/testing
npm run build:prod   # Build for production (with optimizations)

# Utilities
npm run preview      # Preview production build locally
npm run clean        # Clean build output directory
```

## Build Output Structure

```
dist/
├── background.js           # Background script
├── content.js             # Content script
├── popup.js               # Extension popup script
├── modules/               # Modular chunks
│   ├── popup-[hash].js    # Popup-related modules
│   └── utils-[hash].js    # Utility modules
├── popup/                 # Popup assets
│   ├── popup.html         # Popup HTML
│   ├── popup.css          # Popup styles
│   └── inPagePopup.css    # In-page popup styles
├── modules/               # Source modules (copied)
│   ├── contextGatherer.js
│   ├── markdownProcessor.js
│   └── eventHandlers.js
├── icons/                 # Extension icons
└── manifest.json          # Extension manifest
```

## Build Optimizations

### Code Splitting
- **Manual chunks**: Related modules are grouped together
  - `popup`: In-page popup functionality
  - `utils`: Context gathering, markdown processing, event handling

### Minification
- **Terser**: Advanced JavaScript minification
- **Console preservation**: Debug logs kept for development
- **Debugger removal**: Debugger statements removed in production

### Source Maps
- Enabled for better debugging experience
- Maps minified code back to source

### Asset Handling
- CSS files are copied to appropriate directories
- Module files are preserved for runtime loading
- Icons and manifest are copied to root

## Development vs Production

### Development Build
- Source maps enabled
- Console logs preserved
- No minification for faster builds
- Hot module replacement

### Production Build
- Full minification and optimization
- Debugger statements removed
- Optimized chunk splitting
- Smaller bundle sizes

## Module Structure

The refactored code is organized into logical modules:

```
src/
├── modules/              # Shared utilities
│   ├── contextGatherer.js    # Context expansion logic
│   ├── markdownProcessor.js  # Markdown to HTML conversion
│   └── eventHandlers.js      # Event handling
├── popup/                # Popup-related code
│   ├── inPagePopup.js    # In-page popup functionality
│   ├── inPagePopup.css   # In-page popup styles
│   ├── popup.js          # Extension popup script
│   ├── popup.html        # Extension popup HTML
│   └── popup.css         # Extension popup styles
├── content.js            # Main content script
├── background.js         # Background script
└── llmApi.js            # LLM API integration
```

## Build Improvements After Refactoring

1. **Modular Structure**: Better code splitting with manual chunks
2. **CSS Separation**: Static styles moved to CSS files
3. **Asset Organization**: Clear separation of concerns
4. **Development Experience**: Source maps and preserved console logs
5. **Production Optimization**: Advanced minification and chunking

## Future Improvements

- **TypeScript**: Add type checking for better development experience
- **ESLint**: Add linting for code quality
- **Testing**: Add unit tests for modules
- **Bundle Analysis**: Add bundle size analysis
- **Tree Shaking**: Optimize unused code removal 