/**
 * Markdown processing module for the unriddle Chrome Extension
 * Converts basic markdown syntax to HTML for rich text display
 */

/**
 * Converts basic markdown syntax to HTML
 * @param md - Markdown text to convert
 * @returns HTML string with basic markdown formatting
 */
export function simpleMarkdownToHtml(md: string): string {
  if (!md) return "";
  
  // Unescape any escaped newlines (\\n or \\n\\n) to real newlines
  md = md.replace(/\\n/g, '\n');

  // Convert bold text: **text** or __text__
  let html = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Convert italic text: *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Convert links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href=\"$2\" target=\"_blank\">$1</a>');

  // Convert inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Split into paragraphs on double newlines
  const paragraphs = html.split(/\n{2,}/).map(paragraph => {
    // Replace single newlines with <br> within each paragraph
    const withLineBreaks = paragraph.replace(/\n/g, '<br>');
    return `<p>${withLineBreaks}</p>`;
  });

  return paragraphs.join('');
} 