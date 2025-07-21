import { describe, it, expect } from 'vitest';
import { renderTemplate, IN_PAGE_POPUP_TEMPLATE } from './inPagePopupTemplate';

describe('renderTemplate', () => {
  it('replaces variables in template', () => {
    const html = renderTemplate('Hello {{name}}!', { name: 'World' });
    expect(html).toBe('Hello World!');
  });

  it('works with the main popup template', () => {
    const html = renderTemplate(IN_PAGE_POPUP_TEMPLATE, { direction: 'ltr', loadingDisplay: 'none', resultDisplay: 'block', resultContent: 'Test', resultId: 'id', resultDirection: 'ltr', resultStyles: '', timeText: '', copyButtonDisplay: 'none', prompt: '', selectedText: '', resultData: '', language: '', additionalInstructions: '', modelDisplayName: '', currentModel: '', warningDisplay: 'none' });
    expect(html).toContain('Test');
  });
}); 