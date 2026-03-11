#!/usr/bin/env node
/**
 * Context-aware Compact Suggester
 *
 * Reads real context usage percentage (written by statusline-command.sh)
 * and suggests /compact at appropriate thresholds.
 *
 * - >=70%: first reminder, suggest compact at next phase transition
 * - >=80%: strong reminder, suggest compact immediately
 */

const fs = require('fs');
const path = require('path');
const {
  getTempDir,
  readFile,
  writeFile,
  log
} = require('../lib/utils');

async function main() {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const sessionId = input.session_id || 'default';

  // Read context usage from statusline bridge file
  const pctFile = path.join(getTempDir(), `claude-context-pct-${sessionId}`);
  const pctRaw = readFile(pctFile);
  if (!pctRaw) {
    process.exit(0);
  }
  const pct = parseInt(pctRaw.trim(), 10);
  if (isNaN(pct)) {
    process.exit(0);
  }

  // Track last warned level to avoid spam
  const warnFile = path.join(getTempDir(), `claude-compact-warned-${sessionId}`);
  const lastWarned = parseInt(readFile(warnFile) || '0', 10);

  if (pct >= 80 && lastWarned < 80) {
    writeFile(warnFile, '80');
    log(`[Compact] Context usage ${pct}% (>=80%), strongly recommend /compact now`);
  } else if (pct >= 70 && lastWarned < 70) {
    writeFile(warnFile, '70');
    log(`[Compact] Context usage ${pct}% (>=70%), consider /compact at next phase transition`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[Compact] Error:', err.message);
  process.exit(0);
});
