import { describe, it, expect } from 'vitest';
import { isSupportedLanguage, getLanguageDisplayName, SUPPORTED_LANGUAGES } from './languages';

describe('isSupportedLanguage', () => {
  it('returns true for supported language', () => {
    expect(isSupportedLanguage('English')).toBe(true);
    expect(isSupportedLanguage(SUPPORTED_LANGUAGES[0])).toBe(true);
  });
  it('returns false for unsupported language', () => {
    expect(isSupportedLanguage('Klingon')).toBe(false);
  });
});

describe('getLanguageDisplayName', () => {
  it('returns display name for supported language', () => {
    expect(getLanguageDisplayName('English')).toContain('English');
  });
  it('returns input for unknown language', () => {
    expect(getLanguageDisplayName('Klingon')).toBe('Klingon');
  });
}); 