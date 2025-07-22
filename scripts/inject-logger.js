// Node.js script to inject errorLogger code into multiple entry points robustly
const fs = require('fs');
const path = require('path');

const loggerPath = path.join(__dirname, '../src/shared/errorLogger.ts');
const targets = [
  path.join(__dirname, '../src/content.ts'),
  path.join(__dirname, '../src/settings/settings.ts'),
  path.join(__dirname, '../src/popup/inPagePopup.ts'),
];

const START_MARKER = '// === UNRIDDLE LOGGER START ===';
const END_MARKER = '// === UNRIDDLE LOGGER END ===';

let loggerCode = fs.readFileSync(loggerPath, 'utf8').trim();
loggerCode = `${START_MARKER}\n${loggerCode}\n${END_MARKER}`;

for (const target of targets) {
  let content = fs.readFileSync(target, 'utf8');
  // Remove any previously injected logger code between markers
  const markerRegex = new RegExp(`${START_MARKER}[\s\S]*?${END_MARKER}\n?`, 'g');
  content = content.replace(markerRegex, '');
  // Remove any previous logger import (robust)
  content = content.replace(/import \{[^}]*logError[^}]*} from ['\"][^'\"]*['\"];?\n?/g, '');
  // Remove any partial/broken import lines (e.g., lines starting with 'import {' or ending with '} from ...')
  content = content.split('\n').filter(line => {
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
console.log('Logger code injected into entry points (idempotent).'); 