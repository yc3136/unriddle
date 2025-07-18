// Utility for calling Gemini API, now using Vite env variable
// The API key is loaded from import.meta.env.VITE_GEMINI_API_KEY

export async function unriddleText(context, options = {}) {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY in your .env file.");
  const model = options.model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  // Support both old (string) and new (object) API
  let prompt = "";
  if (typeof context === "string") {
    prompt = `Rewrite the following text in plain, simple words for a general audience. Do not use phrases like 'it means' or 'it describes'—just give the transformed meaning directly. Be concise and clear.\n\nText: \"${context}\"`;
  } else {
    prompt = `Rewrite the following text in plain, simple words for a general audience. Do not use phrases like 'it means' or 'it describes'—just give the transformed meaning directly. Be concise and clear.\n\nPage Title: ${context.page_title || ""}\nSection Heading: ${context.section_heading || ""}\nContext Snippet: ${context.context_snippet || ""}\nUser Selection: \"${context.user_selection || ""}\"`;
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
    throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!result) throw new Error("No response from Gemini API");
  return result.trim();
}

// In the future, add more providers/models here and route based on options.provider 