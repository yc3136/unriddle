/**
 * LLM API integration module for the unriddle Chrome Extension
 * Handles communication with Google's Gemini API for text processing
 */

// Cache for settings to avoid reading Chrome storage on every LLM call
let cachedSettings = null;

/**
 * Loads and caches settings from Chrome storage
 * @returns {Promise<Object>} Cached settings object
 */
async function loadAndCacheSettings() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.sync.get({
        geminiApiKey: "",
        additionalLLMInstructions: ""
      });
      cachedSettings = result;
      return result;
    }
  } catch (error) {
    cachedSettings = {
      geminiApiKey: "",
      additionalLLMInstructions: ""
    };
  }
  return cachedSettings;
}

/**
 * Updates the cached settings (called when settings are saved)
 * @param {Object} newSettings - New settings to cache
 */
function updateCachedSettings(newSettings) {
  cachedSettings = { ...cachedSettings, ...newSettings };
}

// Expose cache update function globally for settings page
if (typeof window !== 'undefined') {
  window.updateUnriddleCache = updateCachedSettings;
}

/**
 * Gets cached settings, loading them if not already cached
 * @returns {Promise<Object>} Cached settings
 */
async function getCachedSettings() {
  if (cachedSettings === null) {
    await loadAndCacheSettings();
  }
  return cachedSettings;
}

/**
 * Processes text through the Gemini API to simplify/explain content
 * @param {string|Object} context - Text to process or context object with page info
 * @param {Object} options - Configuration options
 * @param {string} options.model - Gemini model to use (default: "gemini-2.5-flash")
 * @returns {Promise<string>} Processed text response
 * @throws {Error} If API key is missing or API request fails
 */
export async function unriddleText(context, options = {}) {
  // Get cached settings instead of reading Chrome storage every time
  const cacheStartTime = performance.now();
  const settings = await getCachedSettings();
  const cacheTime = performance.now() - cacheStartTime;
  
  // Log cache performance (only in development)
  if (import.meta.env.DEV) {
    console.log(`🔧 Settings cache time: ${cacheTime.toFixed(2)}ms`);
  }
  
  // Get API key - try user's key first, then fall back to environment variable
  let GEMINI_API_KEY = null;
  
  if (settings.geminiApiKey && settings.geminiApiKey.trim() !== '') {
    GEMINI_API_KEY = settings.geminiApiKey.trim();
  } else {
    GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key. Please set your own API key in Settings or ensure VITE_GEMINI_API_KEY is set in your .env file.");
  }
  
  // Configure API request
  const model = options.model || "gemini-2.5-flash";
  const language = options.language || "English";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  // Get additional LLM instructions from cached settings
  const additionalLLMInstructions = settings.additionalLLMInstructions || "";

  // Build prompt based on context type (string or object)
  let prompt = "";
  let basePrompt = "Rewrite the following text in plain, simple words for a general audience. Do not use phrases like 'it means' or 'it describes'—just give the transformed meaning directly. Be concise and clear. Respond in "+language+".";
  if (additionalLLMInstructions) {
    basePrompt += "\n" + additionalLLMInstructions;
  }
  if (typeof context === "string") {
    // Simple text processing
    prompt = `${basePrompt}\nText: "${context}"`;
  } else {
    // Rich context processing with page information
    prompt = `${basePrompt}\nPage Title: ${context.page_title || ""}\nSection Heading: ${context.section_heading || ""}\nContext Snippet: ${context.context_snippet || ""}\nUser Selection: "${context.user_selection || ""}"`;
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
    return { result: result.trim(), prompt };
  }
  return result.trim();
}

/**
 * Streams text through the Gemini API using streamGenerateContent for real-time output
 * @param {string|Object} context - Text to process or context object with page info
 * @param {Object} options - Configuration options
 * @param {string} options.model - Gemini model to use (default: "gemini-2.5-flash")
 * @returns {AsyncGenerator<string>} Yields text chunks as they arrive
 * @throws {Error} If API key is missing or API request fails
 */
export async function* unriddleTextStream(context, options = {}) {
  const settings = await getCachedSettings();
  let GEMINI_API_KEY = null;
  if (settings.geminiApiKey && settings.geminiApiKey.trim() !== '') {
    GEMINI_API_KEY = settings.geminiApiKey.trim();
  } else {
    GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  }
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key. Please set your own API key in Settings or ensure VITE_GEMINI_API_KEY is set in your .env file.");
  }
  const model = options.model || "gemini-2.5-flash";
  const language = options.language || "English";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${GEMINI_API_KEY}`;
  const additionalLLMInstructions = settings.additionalLLMInstructions || "";
  let prompt = "";
  let basePrompt = "Rewrite the following text in plain, simple words for a general audience. Do not use phrases like 'it means' or 'it describes'—just give the transformed meaning directly. Be concise and clear. Respond in "+language+".";
  if (additionalLLMInstructions) {
    basePrompt += "\n" + additionalLLMInstructions;
  }
  if (typeof context === "string") {
    prompt = `${basePrompt}\nText: \"${context}\"`;
  } else {
    prompt = `${basePrompt}\nPage Title: ${context.page_title || ""}\nSection Heading: ${context.section_heading || ""}\nContext Snippet: ${context.context_snippet || ""}\nUser Selection: \"${context.user_selection || ""}\"`;
  }
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
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let lastYielded = '';
  let accumulatedText = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Use a regex to extract all "text": "..." fields in the buffer
    let match;
    const textRegex = /"text":\s*"((?:[^"\\]|\\.)*)"/g;
    while ((match = textRegex.exec(buffer)) !== null) {
      const text = match[1];
      // Only yield new text (avoid duplicates)
      if (text && text !== lastYielded) {
        lastYielded = text;
        // If this is a complete text (not a partial), yield it
        if (text.length > accumulatedText.length) {
          const newText = text.slice(accumulatedText.length);
          accumulatedText = text;
          yield newText;
        }
      }
    }
    // Optionally, clear buffer if it gets too large
    if (buffer.length > 10000) buffer = '';
  }
}

// In the future, add more providers/models here and route based on options.provider 