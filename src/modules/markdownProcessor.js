/**
 * Markdown processing module for the unriddle Chrome Extension
 * Converts basic markdown syntax to HTML for rich text display
 */

/**
 * Converts basic markdown syntax to HTML
 * @param {string} md - Markdown text to convert
 * @returns {string} HTML string with basic markdown formatting
 */
export function simpleMarkdownToHtml(md) {
  if (!md) return "";
  
  // Convert bold text: **text** or __text__
  let html = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // Convert italic text: *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Convert links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Convert inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Convert line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
} 