/**
 * Gemini model configuration for the unriddle Chrome Extension
 * 
 * This file contains all model-related constants and configurations
 * for available Gemini models on the free tier.
 */

// Type definitions
export type SupportedModel = 
  | 'gemini-1.5-flash'
  | 'gemini-2.0-flash'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro';

export type ModelCategory = 'Flash Models' | 'Pro Models';

// Available Gemini models on free tier (alphabetical order)
export const SUPPORTED_MODELS: SupportedModel[] = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

// Default model
export const DEFAULT_MODEL: SupportedModel = 'gemini-2.0-flash';

// Model display names and descriptions
export const MODEL_DISPLAY_NAMES: Record<SupportedModel, string> = {
  'gemini-1.5-flash': 'Gemini 1.5 Flash',
  'gemini-2.0-flash': 'Gemini 2.0 Flash',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.5-pro': 'Gemini 2.5 Pro'
};

// Short descriptions for dropdown menu
export const MODEL_DESCRIPTIONS: Record<SupportedModel, string> = {
  'gemini-1.5-flash': 'Fast, basic quality for simple explanations',
  'gemini-2.0-flash': 'Best speed-to-quality ratio, recommended',
  'gemini-2.5-flash': 'Good speed-to-quality ratio, but slower than 2.0 Flash',
  'gemini-2.5-pro': 'Highest quality, best for complex topics, but slowest'
};

// Model categories for organization
export const MODEL_CATEGORIES: Record<ModelCategory, SupportedModel[]> = {
  'Flash Models': ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'],
  'Pro Models': ['gemini-2.5-pro']
}; 