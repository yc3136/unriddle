// Node.js script to inject errorLogger code into multiple entry points
const fs = require('fs');
const path = require('path');

const loggerPath = path.join(__dirname, '../src/shared/errorLogger.ts');
const targets = [
  path.join(__dirname, '../src/content.ts'),
  path.join(__dirname, '../src/settings/settings.ts'),
  path.join(__dirname, '../src/popup/inPagePopup.ts'),
];

const marker = '// [INJECT_LOGGER_HERE]';

const loggerCode = fs.readFileSync(loggerPath, 'utf8').trim();

for (const target of targets) {
  let content = fs.readFileSync(target, 'utf8');
  if (content.includes(marker)) {
    content = content.replace(marker, loggerCode);
  } else {
    // Insert after the first import block
    const importEnd = content.match(/^(import .+;\s*)+/m);
    if (importEnd) {
      const idx = importEnd[0].length;
      content = content.slice(0, idx) + '\n' + loggerCode + '\n' + content.slice(idx);
    } else {
      content = loggerCode + '\n' + content;
    }
  }
  fs.writeFileSync(target, content, 'utf8');
}
console.log('Logger code injected into entry points.'); 