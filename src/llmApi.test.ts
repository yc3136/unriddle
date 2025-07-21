import { describe, it, expect, vi, beforeEach } from 'vitest';
import { unriddleText } from './llmApi';

global.fetch = vi.fn();

describe('unriddleText', () => {
  beforeEach(() => {
    // Reset fetch mock
    (fetch as any).mockReset();
    // Mock chrome.storage
    // @ts-ignore
    global.chrome = {
      storage: {
        sync: {
          get: vi.fn().mockResolvedValue({ geminiApiKey: 'test-key', selectedModel: 'gemini-2.5-flash', additionalLLMInstructions: '' })
        }
      }
    };
  });

  it('throws if API returns error', async () => {
    (fetch as any).mockResolvedValue({ ok: false, status: 403, statusText: 'Forbidden', json: async () => ({ error: { message: 'Invalid key' } }) });
    await expect(unriddleText('test')).rejects.toThrow(/Gemini API error/);
  });

  it('returns string for successful response', async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: 'result' }] } }] }) });
    const result = await unriddleText('test');
    expect(result).toBe('result');
  });
}); 