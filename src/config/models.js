/**
 * Gemini model configuration for the unriddle Chrome Extension
 * 
 * This file contains all model-related constants and configurations
 * for available Gemini models on the free tier.
 */

// Available Gemini models on free tier (alphabetical order)
export const SUPPORTED_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-pro',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

// Default model
export const DEFAULT_MODEL = 'gemini-2.5-flash';

// Model display names and descriptions
export const MODEL_DISPLAY_NAMES = {
  'gemini-1.5-flash': 'Gemini 1.5 Flash',
  'gemini-1.5-pro': 'Gemini 1.5 Pro',
  'gemini-2.0-flash': 'Gemini 2.0 Flash',
  'gemini-2.0-pro': 'Gemini 2.0 Pro',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.5-pro': 'Gemini 2.5 Pro'
};

// Short descriptions for dropdown menu
export const MODEL_DESCRIPTIONS = {
  'gemini-1.5-flash': 'Fast responses, good for simple explanations',
  'gemini-1.5-pro': 'Balanced speed and quality, reliable performance',
  'gemini-2.0-flash': 'Faster than 1.5, good for most tasks',
  'gemini-2.0-pro': 'High quality responses, deep understanding',
  'gemini-2.5-flash': 'Best speed-to-quality ratio, recommended',
  'gemini-2.5-pro': 'Highest quality, best for complex topics'
};

// Model categories for organization
export const MODEL_CATEGORIES = {
  'Flash Models': ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'],
  'Pro Models': ['gemini-1.5-pro', 'gemini-2.0-pro', 'gemini-2.5-pro']
}; 