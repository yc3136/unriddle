/**
 * LLM API integration module for the unriddle Chrome Extension
 * Handles communication with Google's Gemini API for text processing
 */

/// <reference types="chrome"/>

const DEFAULT_MODEL = "gemini-2.0-flash";

// Type definitions
export interface UnriddleSettings {
  geminiApiKey: string;
  additionalLLMInstructions: string;
  selectedModel: string;
}

export interface ContextData {
  page_title?: string;
  section_heading?: string;
  context_snippet?: string;
  user_selection?: string;
}

export interface UnriddleOptions {
  model?: string;
  language?: string;
  returnPrompt?: boolean;
}

export interface UnriddleResult {
  result: string;
  prompt: string;
}

// Cache for settings to avoid reading Chrome storage on every LLM call
let cachedSettings: UnriddleSettings | null = null;

/**
 * Loads and caches settings from Chrome storage
 * @returns Cached settings object
 */
async function loadAndCacheSettings(): Promise<UnriddleSettings> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.sync.get({
        geminiApiKey: "",
        additionalLLMInstructions: "",
        selectedModel: DEFAULT_MODEL
      });
      cachedSettings = result as UnriddleSettings;
      return result as UnriddleSettings;
    }
  } catch (error) {
    cachedSettings = {
      geminiApiKey: "",
      additionalLLMInstructions: "",
      selectedModel: DEFAULT_MODEL
    };
  }
  return cachedSettings!;
}

/**
 * Updates the cached settings (called when settings are saved)
 * @param newSettings - New settings to cache
 */
function updateCachedSettings(newSettings: Partial<UnriddleSettings>): void {
  if (cachedSettings) {
    cachedSettings = { ...cachedSettings, ...newSettings };
  } else {
    // If cache is not set, initialize it with defaults and new settings
    cachedSettings = {
      geminiApiKey: newSettings.geminiApiKey || "",
      additionalLLMInstructions: newSettings.additionalLLMInstructions || "",
      selectedModel: newSettings.selectedModel || DEFAULT_MODEL
    };
  }
}

// Expose cache update function globally for settings page
declare global {
  interface Window {
    updateUnriddleCache: typeof updateCachedSettings;
  }
}

if (typeof window !== 'undefined') {
  window.updateUnriddleCache = updateCachedSettings;
}

// Listen for settings refresh messages from the settings page
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'UNRIDDLE_REFRESH_CACHE' && message.settings) {
      updateCachedSettings(message.settings);
    }
  });
}

/**
 * Gets cached settings, loading them if not already cached
 * @returns Cached settings
 */
async function getCachedSettings(): Promise<UnriddleSettings> {
  if (cachedSettings === null) {
    await loadAndCacheSettings();
  }
  return cachedSettings!;
}

// Add a simple in-memory cache for LLM results
const llmResultCache = new Map<string, string>();

function getCacheKey(prompt: string, model: string, language: string): string {
  return `${model}::${language}::${prompt}`;
}

/**
 * Processes text through the Gemini API to simplify/explain content
 * @param context - Text to process or context object with page info
 * @param options - Configuration options
 * @returns Processed text response
 * @throws If API key is missing or API request fails
 */
export async function unriddleText(
  context: string | ContextData, 
  options: UnriddleOptions = {}
): Promise<string | UnriddleResult> {
  // Get cached settings instead of reading Chrome storage every time
  const cacheStartTime = performance.now();
  const settings = await getCachedSettings();
  const cacheTime = performance.now() - cacheStartTime;
  
  // Get API key - try user's key first, then fall back to environment variable
  let GEMINI_API_KEY: string | null = null;
  
  if (settings.geminiApiKey && settings.geminiApiKey.trim() !== '') {
    GEMINI_API_KEY = settings.geminiApiKey.trim();
  } else {
    GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
  }
  
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key. Please set your own API key in Settings or ensure VITE_GEMINI_API_KEY is set in your .env file.");
  }
  
  // Configure API request
  const model = options.model || settings.selectedModel || DEFAULT_MODEL;
  const language = options.language || "English";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  // Get additional LLM instructions from cached settings
  const additionalLLMInstructions = settings.additionalLLMInstructions || "";

  // Build prompt based on context type (string or object)
  let prompt = "";
  let basePrompt =
    `Task: Rewrite the text below into simple, easy-to-understand language.\n\n` +
    `Instructions:\n` +
    `- Keep the explanation concise and direct.\n` +
    `- Do not use phrases like \"it means,\" \"it describes,\" \"this term is,\" or \"this refers to.\"\n` +
    `- The rewritten text should directly replace the original, as if it were the only explanation.\n` +
    `- The response must be in ${language}.\n` +
    `- Do not include any labels, headers, or introductory phrases (such as \"Selected:\", \"Explanation:\", or similar) in your response. Output only the rewritten text.`;
  if (additionalLLMInstructions) {
    basePrompt += `\n- ${additionalLLMInstructions.replace(/\n/g, '\n- ')}`;
  }
  if (typeof context === "string") {
    // Simple text processing
    prompt = `${basePrompt}\n\nText: "${context}"`;
  } else {
    // Rich context processing with page information
    prompt = `${basePrompt}\n\nPage Title: ${context.page_title || ""}\nSection Heading: ${context.section_heading || ""}\nContext Snippet: ${context.context_snippet || ""}\nUser Selection: "${context.user_selection || ""}"`;
  }

  // DEBUG LOGS

  // Check cache before making API request
  const cacheKey = getCacheKey(prompt, model, language);
  if (llmResultCache.has(cacheKey)) {
    const cachedResult = llmResultCache.get(cacheKey)!;
    if (options.returnPrompt) {
      return { result: cachedResult, prompt };
    }
    return cachedResult;
  }

  // Prepare request payload
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  // Make API request
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  // Handle API errors
  if (!res.ok) {
    let errorDetails = `${res.status} ${res.statusText}`;
    
    try {
      const errorData = await res.json();
      if (errorData.error && errorData.error.message) {
        errorDetails = `${res.status} ${res.statusText}: ${errorData.error.message}`;
      }
    } catch (parseError) {
      // If we can't parse the error response, use the status text
    }
    
    throw new Error(`Gemini API error: ${errorDetails}`);
  }

  // Parse and validate response
  const data = await res.json();
  const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!result) {
    throw new Error("No response from Gemini API");
  }
  if (options.returnPrompt) {
    llmResultCache.set(cacheKey, result.trim());
    return { result: result.trim(), prompt };
  }
  llmResultCache.set(cacheKey, result.trim());
  return result.trim();
}

/**
 * Streams text through the Gemini API using streamGenerateContent for real-time output
 * Note: Streaming results are not cached, as partial results are not deterministic and caching would require buffering the entire response.
 * @param context - Text to process or context object with page info
 * @param options - Configuration options
 * @returns Yields text chunks as they arrive
 * @throws If API key is missing or API request fails
 */
export async function* unriddleTextStream(
  context: string | ContextData, 
  options: UnriddleOptions = {}
): AsyncGenerator<string> {
  const settings = await getCachedSettings();
  let GEMINI_API_KEY: string | null = null;
  if (settings.geminiApiKey && settings.geminiApiKey.trim() !== '') {
    GEMINI_API_KEY = settings.geminiApiKey.trim();
  } else {
    GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
  }
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key. Please set your own API key in Settings or ensure VITE_GEMINI_API_KEY is set in your .env file.");
  }
  const model = options.model || settings.selectedModel || DEFAULT_MODEL;
  const language = options.language || "English";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${GEMINI_API_KEY}`;
  const additionalLLMInstructions = settings.additionalLLMInstructions || "";
  let prompt = "";
  let basePrompt =
    `Task: Rewrite the text below into simple, easy-to-understand language.\n\n` +
    `Instructions:\n` +
    `- Keep the explanation concise and direct.\n` +
    `- Do not use phrases like \"it means,\" \"it describes,\" \"this term is,\" or \"this refers to.\"\n` +
    `- The rewritten text should directly replace the original, as if it were the only explanation.\n` +
    `- The response must be in ${language}.\n` +
    `- Do not include any labels, headers, or introductory phrases (such as \"Selected:\", \"Explanation:\", or similar) in your response. Output only the rewritten text.`;
  if (additionalLLMInstructions) {
    basePrompt += `\n- ${additionalLLMInstructions.replace(/\n/g, '\n- ')}`;
  }
  if (typeof context === "string") {
    prompt = `${basePrompt}\n\nText: \"${context}\"`;
  } else {
    prompt = `${basePrompt}\n\nPage Title: ${context.page_title || ""}\nSection Heading: ${context.section_heading || ""}\nContext Snippet: ${context.context_snippet || ""}\nUser Selection: \"${context.user_selection || ""}\"`;
  }

  // DEBUG LOGS

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let errorDetails = `${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.error && errorData.error.message) {
        errorDetails = `${res.status} ${res.statusText}: ${errorData.error.message}`;
      }
    } catch (parseError) {}
    throw new Error(`Gemini API error: ${errorDetails}`);
  }
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: true });
    if (done) break;
  }

  // Now parse the entire buffer as JSON
  try {
    const data = JSON.parse(buffer);
    // If the response is an array, iterate through it
    const candidatesArr = Array.isArray(data) ? data : [data];
    for (const item of candidatesArr) {
      if (
        item.candidates &&
        item.candidates[0] &&
        item.candidates[0].content &&
        item.candidates[0].content.parts &&
        item.candidates[0].content.parts[0] &&
        item.candidates[0].content.parts[0].text
      ) {
        yield item.candidates[0].content.parts[0].text;
      }
    }
  } catch (parseError) {
  }
}

// In the future, add more providers/models here and route based on options.provider 