/**
 * Context gathering module for the Unriddle Chrome Extension
 * Expands selected text with surrounding context for better LLM prompts
 */

/**
 * Gathers contextual information around selected text
 * @param {string} selectedText - The text selected by the user
 * @param {number|string} contextWindowSize - Number of words, empty string for full page, 0 for only selection
 * @returns {Object} Context object with page title, section heading, and expanded text
 */
export function gatherContext(selectedText, contextWindowSize = 40) {
  // Initialize context variables
  let selection = window.getSelection();
  let contextSnippet = selectedText;
  let sectionHeading = "";
  let pageTitle = document.title;

  // Handle full page content option
  if (contextWindowSize === "") {
    const bodyText = document.body.innerText || document.body.textContent || '';
    const cleanedText = bodyText.replace(/\s+/g, ' ').trim();
    contextSnippet = cleanedText;
  } else if (contextWindowSize === 0) {
    contextSnippet = selectedText;
  } else if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let node = range.commonAncestorContainer;
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.parentNode;
    }
    let block = node && (node.closest('p,li,blockquote,td,th,div,section,article') || node);
    if (block && block.innerText) {
      let words = block.innerText.trim().split(/\s+/);
      if (typeof contextWindowSize === 'number' && contextWindowSize > 0) {
        words = words.slice(0, contextWindowSize);
      }
      contextSnippet = words.join(' ');
    }
    // Find nearest heading for better context
    let headingNode = node;
    while (headingNode && !/^H[1-6]$/.test(headingNode.tagName)) {
      headingNode = headingNode.previousElementSibling;
    }
    if (headingNode && headingNode.innerText) {
      sectionHeading = headingNode.innerText.trim();
    }
  }

  // Fallback: try to find a heading above the selection
  if (!sectionHeading) {
    let headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let bestHeading = headings.reverse().find(h => 
      h.compareDocumentPosition(selection.anchorNode) & Node.DOCUMENT_POSITION_PRECEDING
    );
    if (bestHeading) {
      sectionHeading = bestHeading.innerText.trim();
    }
  }

  // Return structured context object
  return {
    page_title: pageTitle,
    section_heading: sectionHeading,
    context_snippet: contextSnippet,
    user_selection: selectedText
  };
} 