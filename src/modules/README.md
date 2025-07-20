# unriddle Extension Modules

This directory contains modular components that were extracted from the main `content.js` file to improve maintainability and organization.

## Module Structure

### `popup/inPagePopup.js`
Handles all in-page popup functionality including:
- Popup creation and styling (using CSS classes)
- Focus management and accessibility features
- Loading states and result display
- Feedback button creation
- Settings button creation
- **Copy LLM context button**: Allows users to copy the full prompt/context sent to the LLM (with page URL and extension attribution) for use in other chatbots. The button uses a robot icon, shows a tooltip ("Copy LLM context for follow up"), and displays a visible success message when clicked.
- Popup positioning and removal

**Exports:**
- `showUnriddlePopup(text, loading, result, isHtml, prompt)` - Main function to display popups
- `removeUnriddlePopup()` - Function to remove the popup

**Related files:**
- `popup/inPagePopup.css` - Contains all static styles for the in-page popup

### `contextGatherer.js`
Manages context expansion around selected text:
- Expands selection to containing paragraph/block
- Finds relevant section headings
- Gathers page title and context information
- Returns structured context object for LLM processing

**Exports:**
- `gatherContext(selectedText)` - Main function to gather context around selected text

### `markdownProcessor.js`
Handles markdown to HTML conversion:
- Converts basic markdown syntax (bold, italic, links, code)
- Processes line breaks
- Used for formatting LLM responses

**Exports:**
- `simpleMarkdownToHtml(md)` - Converts markdown string to HTML

### `eventHandlers.js`
Manages event handling for the extension:
- Click outside popup to close functionality
- Can be extended with additional event handlers

**Exports:**
- `setupEventHandlers()` - Initializes all event handlers

## Benefits of Modular Structure

1. **Maintainability**: Each module has a single responsibility
2. **Reusability**: Modules can be easily reused or extended
3. **Testing**: Individual modules can be tested in isolation
4. **Readability**: Main content.js is now much cleaner and easier to understand
5. **Extensibility**: New features can be added as separate modules

## Usage

The main `content.js` file imports these modules and orchestrates their usage:

```javascript
import { showUnriddlePopup } from "./popup/inPagePopup.js";
import { gatherContext } from "./modules/contextGatherer.js";
import { setupEventHandlers } from "./modules/eventHandlers.js";
```

This modular approach makes the codebase more organized and easier to maintain as the extension grows. 