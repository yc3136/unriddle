import { describe, it, expect } from 'vitest';
import { simpleMarkdownToHtml } from './markdownProcessor';

describe('simpleMarkdownToHtml', () => {
  it('converts bold markdown', () => {
    expect(simpleMarkdownToHtml('**bold**')).toContain('<strong>bold</strong>');
    expect(simpleMarkdownToHtml('__bold__')).toContain('<strong>bold</strong>');
  });

  it('converts italic markdown', () => {
    expect(simpleMarkdownToHtml('*italic*')).toContain('<em>italic</em>');
    expect(simpleMarkdownToHtml('_italic_')).toContain('<em>italic</em>');
  });

  it('converts links', () => {
    expect(simpleMarkdownToHtml('[link](http://a.com)')).toContain('<a href="http://a.com"');
  });

  it('converts inline code', () => {
    expect(simpleMarkdownToHtml('`code`')).toContain('<code>code</code>');
  });

  it('wraps paragraphs and line breaks', () => {
    const html = simpleMarkdownToHtml('line1\n\nline2');
    expect(html).toContain('<p>line1</p>');
    expect(html).toContain('<p>line2</p>');
  });
}); 