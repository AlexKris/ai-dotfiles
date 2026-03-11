#!/usr/bin/env node
/**
 * SessionStart Hook: Auto-inject git status and project type at session start.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');

const context = [];

try {
  const branch = execFileSync('git', ['symbolic-ref', '--short', 'HEAD'],
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  const recentFiles = execFileSync('git', ['diff', '--name-only', 'HEAD~3'],
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  context.push(`当前分支: ${branch}`);
  if (recentFiles) context.push(`最近修改:\n${recentFiles}`);
} catch {}

if (fs.existsSync('go.mod')) context.push('项目: Go');
else if (fs.existsSync('pyproject.toml') || fs.existsSync('requirements.txt')) context.push('项目: Python');
else if (fs.existsSync('package.json')) context.push('项目: Node.js');

if (context.length > 0) {
  process.stdout.write(JSON.stringify({ additionalContext: context.join('\n') }));
}
