/**
 * LLM API integration module for the Unriddle Chrome Extension
 * Handles communication with Google's Gemini API for text processing
 */

/**
 * Processes text through the Gemini API to simplify/explain content
 * @param {string|Object} context - Text to process or context object with page info
 * @param {Object} options - Configuration options
 * @param {string} options.model - Gemini model to use (default: "gemini-2.5-flash")
 * @returns {Promise<string>} Processed text response
 * @throws {Error} If API key is missing or API request fails
 */
export async function unriddleText(context, options = {}) {
  // Validate API key
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY in your .env file.");
  }
  
  // Configure API request
  const model = options.model || "gemini-2.5-flash";
  const language = options.language || "English";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  // Build prompt based on context type (string or object)
  let prompt = "";
  if (typeof context === "string") {
    // Simple text processing
    prompt = `Rewrite the following text in plain, simple words for a general audience. Do not use phrases like 'it means' or 'it describes'—just give the transformed meaning directly. Be concise and clear. Respond in ${language}.
\nText: "${context}"`;
  } else {
    // Rich context processing with page information
    prompt = `Rewrite the following text in plain, simple words for a general audience. Do not use phrases like 'it means' or 'it describes'—just give the transformed meaning directly. Be concise and clear. Respond in ${language}.
\nPage Title: ${context.page_title || ""}\nSection Heading: ${context.section_heading || ""}\nContext Snippet: ${context.context_snippet || ""}\nUser Selection: "${context.user_selection || ""}"`;
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
    throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
  }

  // Parse and validate response
  const data = await res.json();
  const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!result) {
    throw new Error("No response from Gemini API");
  }
  
  return result.trim();
}

// In the future, add more providers/models here and route based on options.provider 