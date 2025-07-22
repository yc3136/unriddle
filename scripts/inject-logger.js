// Node.js script to inject errorLogger code into multiple entry points robustly
const fs = require('fs');
const path = require('path');

const loggerPath = path.join(__dirname, '../src/shared/errorLogger.ts');
const targets = [
  path.join(__dirname, '../src/content.ts'),
  path.join(__dirname, '../src/settings/settings.ts'),
  path.join(__dirname, '../src/popup/inPagePopup.ts'),
];

const loggerCode = fs.readFileSync(loggerPath, 'utf8').trim();

for (const target of targets) {
  let content = fs.readFileSync(target, 'utf8');
  // Remove any old injected logger code (by interface name)
  content = content.replace(/\/\/ Error logger for unriddle extension[\s\S]+?export async function clearErrorLogs\(\)[\s\S]+?}\n/, '');
  // Remove any previous logger import (robust)
  content = content.replace(/import \{[^}]*logError[^}]*} from ['\"][^'\"]*['\"];?\n?/g, '');
  // Remove any partial/broken import lines (e.g., lines starting with 'import {' or ending with '} from ...')
  content = content.split('\n').filter(line => {
    // Remove lines that are partial/broken imports
    if (/import \{[^}]*$/.test(line)) return false;
    if (/^ortedLanguage \}/.test(line)) return false;
    if (/^import \{? ?ErrorLogEntry,? ?sanitizeError,? ?logError,? ?getErrorLogs,? ?clearErrorLogs ?\}? from/.test(line)) return false;
    return true;
  }).join('\n');
  // Insert the logger code after the last import
  const importLines = content.match(/^(import .+;\s*)+/m);
  if (importLines) {
    const idx = importLines[0].length;
    content = content.slice(0, idx) + '\n' + loggerCode + '\n' + content.slice(idx);
  } else {
    content = loggerCode + '\n' + content;
  }
  fs.writeFileSync(target, content, 'utf8');
}
console.log('Logger code injected into entry points.'); 