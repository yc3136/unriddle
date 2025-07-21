/// <reference types="vitest/globals" />
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeError, logError } from './inPagePopup';

describe('sanitizeError', () => {
  it('handles string error', () => {
    expect(sanitizeError('fail')).toEqual({ message: 'fail' });
  });
  it('handles object error', () => {
    expect(sanitizeError({ message: 'fail', name: 'Error', stack: 'stack\nline2' })).toEqual({ message: 'fail', name: 'Error', stack: 'stack\nline2' });
  });
  it('handles null', () => {
    expect(sanitizeError(null)).toEqual({ message: 'Unknown error' });
  });
});

describe('logError', () => {
  beforeEach(() => {
    // @ts-ignore
    global.chrome = {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({ unriddleErrorLogs: [] }),
          set: vi.fn().mockResolvedValue(undefined)
        }
      },
      runtime: { getManifest: () => ({ version: '1.0.0' }) }
    };
    // Patch navigator.userAgent safely
    Object.defineProperty(window.navigator, 'userAgent', { value: 'test', configurable: true });
  });
  it('does not throw', async () => {
    await expect(logError('fail')).resolves.toBeUndefined();
  });
}); 