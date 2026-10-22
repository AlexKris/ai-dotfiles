# Global Rules

## Interaction

- Respond in Chinese
- Be direct. Call out bad design immediately
- Concise output, no filler
- When intent is clear, execute. When ambiguous, ask first
- Give the optimal solution, not multiple options — but if the request itself has multiple valid interpretations, list them and ask

## Workflow

- IMPORTANT: Non-trivial tasks (3+ steps) require plan mode before implementation
- State assumptions explicitly when uncertain — don't hide confusion
- When something goes wrong, stop and re-plan. Do not push forward blindly
- Read relevant files before modifying them. Never code based on assumptions
- Never delete or rewrite code you don't understand; ask about it instead
- Keep changes minimal. Do not over-engineer or add unrequested features
- No abstractions for single-use code. No error handling for impossible scenarios
- Self-check: would a senior engineer call this overcomplicated? If yes, simplify
- Match the existing style in the file, even if you'd do it differently
- Every changed line should trace directly to the request
- Don't refactor what isn't broken
- If you notice unrelated dead code, mention it — don't delete it
- Remove imports/variables/functions YOUR changes orphaned; leave pre-existing dead code alone
- Refactor at most once per task. If still unsatisfied, deliver first, iterate later
- Never make changes unrelated to the current task; document them as issues instead

## Verification

- Never mark a task complete without proving it works
- Run tests, check logs, verify output
- Transform vague tasks into verifiable goals: "fix the bug" → "write a test that reproduces it, then make it pass"

## Self-Improvement

- After a recurring correction (same mistake ≥2 times): update the project CLAUDE.md so it never repeats again