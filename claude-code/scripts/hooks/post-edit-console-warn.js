#!/usr/bin/env node
/**
 * PostToolUse Hook: Warn about debug statements after edits
 * Supports: JS/TS (console.log), Python (print), Go (fmt.Print), Java (System.out.print), Shell (echo for debug)
 */

const { readFile } = require('../lib/utils');

// Debug patterns by file extension
const DEBUG_PATTERNS = {
  js:   { regex: /console\.log/, label: 'console.log' },
  jsx:  { regex: /console\.log/, label: 'console.log' },
  ts:   { regex: /console\.log/, label: 'console.log' },
  tsx:  { regex: /console\.log/, label: 'console.log' },
  py:   { regex: /(?<!\w)print\s*\(/, label: 'print()' },
  go:   { regex: /fmt\.Print/, label: 'fmt.Print*' },
  java: { regex: /System\.out\.print/, label: 'System.out.print*' },
};

const SUPPORTED_EXT = /\.(ts|tsx|js|jsx|py|go|java)$/;

const MAX_STDIN = 1024 * 1024;
let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) {
    data += chunk.substring(0, MAX_STDIN - data.length);
  }
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path;

    if (filePath && SUPPORTED_EXT.test(filePath)) {
      const ext = filePath.match(/\.(\w+)$/)?.[1];
      const pattern = DEBUG_PATTERNS[ext];

      if (pattern) {
        const content = readFile(filePath);
        if (content) {
          const lines = content.split('\n');
          const matches = [];

          lines.forEach((line, idx) => {
            // Skip comments
            const trimmed = line.trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) return;

            if (pattern.regex.test(line)) {
              matches.push((idx + 1) + ': ' + line.trim());
            }
          });

          if (matches.length > 0) {
            console.error(`[Hook] WARNING: ${pattern.label} found in ${filePath}`);
            matches.slice(0, 5).forEach(m => console.error('  ' + m));
            if (matches.length > 5) console.error(`  ... and ${matches.length - 5} more`);
            console.error(`[Hook] Remove debug statements before committing`);
          }
        }
      }
    }
  } catch {
    // pass through
  }

  process.stdout.write(data);
  process.exit(0);
});
