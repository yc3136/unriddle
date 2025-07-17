// llmApi.js
// Utility for calling Gemini 2.5 Pro API

const GEMINI_API_KEY = "AIzaSyAcR-0r6jvqZQYxR6oUUTyvAB8FgGSHQ2Y";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=" + GEMINI_API_KEY;

/**
 * unriddleText - Calls Gemini 2.5 Pro to explain/simplify/translate text
 * @param {string} text - The user-selected text to unriddle
 * @param {object} [options] - Optional: { model: string }
 * @returns {Promise<string>} - The unriddled (simplified) text
 */
export async function unriddleText(text, options = {}) {
  const model = options.model || "gemini-2.5-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const prompt = `Explain the following text in plain, simple language, including any cultural references, slang, or jargon.\n\nText: "${text}"`;

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
    throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  // Gemini returns the response in data.candidates[0].content.parts[0].text
  const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!result) throw new Error("No response from Gemini API");
  return result.trim();
}

// In the future, add more providers/models here and route based on options.provider 