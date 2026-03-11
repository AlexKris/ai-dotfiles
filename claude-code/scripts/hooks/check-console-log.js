#!/usr/bin/env node
/**
 * Stop Hook: Check for debug statements in modified files
 * Supports: JS/TS (console.log), Python (print), Go (fmt.Print), Java (System.out.print)
 */

const fs = require('fs');
const { isGitRepo, getGitModifiedFiles, readFile, log } = require('../lib/utils');

// Files where debug statements are expected
const EXCLUDED_PATTERNS = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /\.config\.[jt]s$/,
  /scripts\//,
  /__tests__\//,
  /__mocks__\//,
  /_test\.go$/,
  /_test\.py$/,
  /test_.*\.py$/,
  /conftest\.py$/,
];

// Debug patterns by file extension
const DEBUG_CHECKS = {
  js:   { search: 'console.log', regex: /console\.log/, label: 'console.log' },
  jsx:  { search: 'console.log', regex: /console\.log/, label: 'console.log' },
  ts:   { search: 'console.log', regex: /console\.log/, label: 'console.log' },
  tsx:  { search: 'console.log', regex: /console\.log/, label: 'console.log' },
  py:   { search: 'print(', regex: /(?<!\w)print\s*\(/, label: 'print()' },
  go:   { search: 'fmt.Print', regex: /fmt\.Print/, label: 'fmt.Print*' },
  java: { search: 'System.out.print', regex: /System\.out\.print/, label: 'System.out.print*' },
};

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
    if (!isGitRepo()) {
      process.stdout.write(data);
      process.exit(0);
    }

    const files = getGitModifiedFiles(['\\.tsx?$', '\\.jsx?$', '\\.py$', '\\.go$', '\\.java$'])
      .filter(f => fs.existsSync(f))
      .filter(f => !EXCLUDED_PATTERNS.some(pattern => pattern.test(f)));

    const warnings = [];

    for (const file of files) {
      const ext = file.match(/\.(\w+)$/)?.[1];
      const check = DEBUG_CHECKS[ext];
      if (!check) continue;

      const content = readFile(file);
      if (!content) continue;

      // Quick string check before regex
      if (!content.includes(check.search)) continue;

      // Count actual matches (skip comments)
      const lines = content.split('\n');
      let count = 0;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) continue;
        if (check.regex.test(line)) count++;
      }

      if (count > 0) {
        warnings.push(`  ${file} (${count}x ${check.label})`);
      }
    }

    if (warnings.length > 0) {
      log('[Hook] WARNING: Debug statements found in modified files:');
      warnings.forEach(w => log(w));
      log('[Hook] Remove debug statements before committing');
    }
  } catch (err) {
    log(`[Hook] check-debug-stmts error: ${err.message}`);
  }

  process.stdout.write(data);
  process.exit(0);
});
