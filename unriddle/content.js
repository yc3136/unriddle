function getSelectionCoords() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;
  const range = selection.getRangeAt(0).cloneRange();
  const rect = range.getBoundingClientRect();
  return { x: rect.left + window.scrollX, y: rect.bottom + window.scrollY };
}

function showUnriddlePopup(text, loading = true, result = "", isHtml = false) {
  let popup = document.getElementById("unriddle-popup");
  if (popup) popup.remove();

  popup = document.createElement("div");
  popup.id = "unriddle-popup";
  popup.style.position = "absolute";
  popup.style.zIndex = 99999;
  popup.style.background = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  popup.style.padding = "16px";
  popup.style.fontSize = "16px";
  popup.style.maxWidth = "320px";
  popup.style.minWidth = "200px";
  popup.style.color = "#222";
  popup.style.display = "flex";
  popup.style.alignItems = "center";
  popup.style.gap = "12px";

  const coords = getSelectionCoords();
  if (coords) {
    popup.style.left = `${coords.x}px`;
    popup.style.top = `${coords.y + 8}px`;
  } else {
    popup.style.left = `50%`;
    popup.style.top = `50%`;
    popup.style.transform = "translate(-50%, -50%)";
  }

  if (loading) {
    const spinner = document.createElement("span");
    spinner.className = "unriddle-spinner";
    spinner.style.border = "4px solid #f3f3f3";
    spinner.style.borderTop = "4px solid #3498db";
    spinner.style.borderRadius = "50%";
    spinner.style.width = "24px";
    spinner.style.height = "24px";
    spinner.style.animation = "unriddle-spin 1s linear infinite";
    popup.appendChild(spinner);
    const loadingText = document.createElement("span");
    loadingText.textContent = "Unriddling...";
    popup.appendChild(loadingText);
  } else {
    const resultSpan = document.createElement("span");
    if (isHtml) {
      resultSpan.innerHTML = simpleMarkdownToHtml(result);
    } else {
      resultSpan.textContent = result;
    }
    popup.appendChild(resultSpan);
  }

  document.body.appendChild(popup);

  // Add spinner animation style
  if (!document.getElementById("unriddle-spinner-style")) {
    const style = document.createElement("style");
    style.id = "unriddle-spinner-style";
    style.textContent = `@keyframes unriddle-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
}

function removeUnriddlePopup() {
  const popup = document.getElementById("unriddle-popup");
  if (popup) popup.remove();
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("#unriddle-popup")) {
    removeUnriddlePopup();
  }
});

// --- unriddleText function (updated for speed and brevity) ---
const GEMINI_API_KEY = "ADD_YOUR_GEMINI_API_KEY";

async function unriddleText(text, options = {}) {
  // Use the fast model
  const model = options.model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  // Prompt tuned for direct, plain output
  const prompt = `Rewrite the following text in plain, simple words for a general audience. Do not use phrases like 'it means' or 'it describes'—just give the transformed meaning directly. Be concise and clear.\n\nText: "${text}"`;

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
// --- end unriddleText ---

// --- Simple Markdown to HTML converter ---
function simpleMarkdownToHtml(md) {
  if (!md) return "";
  // Bold **text** or __text__
  let html = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  // Italic *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  // Links [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  return html;
}
// --- end markdown converter ---

console.log("[unriddle] content.js loaded");

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  console.log("[unriddle] Received message:", msg);
  if (msg.action === "UNRIDDLE_SELECTED_TEXT") {
    console.log("[unriddle] Showing loading popup for:", msg.text);
    showUnriddlePopup(msg.text, true);
    const startTime = Date.now();
    try {
      const result = await unriddleText(msg.text);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[unriddle] LLM result:`, result, `(Time: ${elapsed}s)`);
      showUnriddlePopup(msg.text, false, `${result}\n\n⏱️ Time used: ${elapsed}s`, true);
    } catch (err) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error("[unriddle] Error in unriddleText:", err, `(Time: ${elapsed}s)`);
      showUnriddlePopup(msg.text, false, `Error: ${err.message || err}\n\n⏱️ Time used: ${elapsed}s`, true);
    }
  }
});