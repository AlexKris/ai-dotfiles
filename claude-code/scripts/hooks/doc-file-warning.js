#!/usr/bin/env node
/**
 * PreToolUse Hook (Write): Deny creation of non-standard documentation files.
 * Blocks the operation instead of just warning.
 */

let data = '';
process.stdin.on('data', c => (data += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || '';

    if (
      /\.(md|txt)$/.test(filePath) &&
      !/(README|CLAUDE|AGENTS|CONTRIBUTING|CHANGELOG|LICENSE|SKILL|MEMORY)\.md$/i.test(filePath) &&
      !/\.claude[/\\](plans|memory)[/\\]/.test(filePath) &&
      !/(^|[/\\])(docs|skills|\.history)[/\\]/.test(filePath)
    ) {
      const output = {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "非标准文档文件。请使用 README.md 或放入 docs/ 目录。"
        }
      };
      process.stdout.write(JSON.stringify(output));
      return;
    }
  } catch {
    /* ignore */
  }
});
