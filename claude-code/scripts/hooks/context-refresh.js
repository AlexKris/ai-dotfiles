#!/usr/bin/env node
/**
 * UserPromptSubmit Hook: Periodically inject key reminders in long sessions.
 * Triggers every FREQUENCY prompts after START_AFTER initial prompts.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
const sessionId = input.session_id || 'default';
const tmpFile = path.join(os.tmpdir(), `claude-prompt-count-${sessionId}`);

let count = 0;
try { count = parseInt(fs.readFileSync(tmpFile, 'utf8'), 10) || 0; } catch {}
count++;
fs.writeFileSync(tmpFile, String(count));

const FREQUENCY = 15;
const START_AFTER = 10;

if (count > START_AFTER && count % FREQUENCY === 0) {
  const output = {
    additionalContext: `[Context Refresh] Respond in Chinese. Be concise, no over-engineering. Read files before modifying.`
  };
  process.stdout.write(JSON.stringify(output));
}
