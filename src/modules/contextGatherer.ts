/**
 * Context gathering module for the unriddle Chrome Extension
 * Expands selected text with surrounding context for better LLM prompts
 */

// Type definitions
export interface ContextData {
  page_title: string;
  section_heading: string;
  context_snippet: string;
  user_selection: string;
}

export type ContextWindowSize = number | string;

/**
 * Gathers contextual information around selected text
 * @param selectedText - The text selected by the user
 * @param contextWindowSize - Number of words, empty string for full page, 0 for only selection
 * @returns Context object with page title, section heading, and expanded text
 */
export function gatherContext(selectedText: string, contextWindowSize: ContextWindowSize = 40): ContextData {
  // Initialize context variables
  const selection = window.getSelection();
  let contextSnippet = selectedText;
  let sectionHeading = "";
  const pageTitle = document.title;

  // Handle full page content option
  if (contextWindowSize === "") {
    const bodyText = document.body.innerText || document.body.textContent || '';
    const cleanedText = bodyText.replace(/\s+/g, ' ').trim();
    // Cap full page content to 1000 words to avoid sending too much data
    const words = cleanedText.split(/\s+/);
    contextSnippet = words.slice(0, 1000).join(' ');
  } else if (contextWindowSize === 0) {
    contextSnippet = selectedText;
  } else if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.parentNode;
    }
    const block = node && (node as Element).closest('p,li,blockquote,td,th,div,section,article') || node;
    if (block && (block as HTMLElement).innerText) {
      let words = (block as HTMLElement).innerText.trim().split(/\s+/);
      if (typeof contextWindowSize === 'number' && contextWindowSize > 0) {
        words = words.slice(0, contextWindowSize);
      }
      contextSnippet = words.join(' ');
    }
    // Find nearest heading for better context
    let headingNode: Element | null = node as Element;
    while (headingNode && !/^H[1-6]$/.test(headingNode.tagName)) {
      headingNode = headingNode.previousElementSibling;
    }
    if (headingNode && (headingNode as HTMLElement).innerText) {
      sectionHeading = (headingNode as HTMLElement).innerText.trim();
    }
  }

  // Fallback: try to find a heading above the selection
  if (!sectionHeading && selection && selection.anchorNode) {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const bestHeading = headings.reverse().find(h => 
      h.compareDocumentPosition(selection.anchorNode!) & Node.DOCUMENT_POSITION_PRECEDING
    );
    if (bestHeading) {
      sectionHeading = (bestHeading as HTMLElement).innerText.trim();
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