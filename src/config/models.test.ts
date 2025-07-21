import { describe, it, expect } from 'vitest';
import { SUPPORTED_MODELS, MODEL_DISPLAY_NAMES, MODEL_DESCRIPTIONS, DEFAULT_MODEL } from './models';

describe('SUPPORTED_MODELS', () => {
  it('contains the default model', () => {
    expect(SUPPORTED_MODELS).toContain(DEFAULT_MODEL);
  });
});

describe('MODEL_DISPLAY_NAMES', () => {
  it('has display names for all supported models', () => {
    for (const model of SUPPORTED_MODELS) {
      expect(MODEL_DISPLAY_NAMES[model]).toBeDefined();
    }
  });
});

describe('MODEL_DESCRIPTIONS', () => {
  it('has descriptions for all supported models', () => {
    for (const model of SUPPORTED_MODELS) {
      expect(MODEL_DESCRIPTIONS[model]).toBeDefined();
    }
  });
}); 