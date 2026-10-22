# Global AGENTS.md (English)

## Interaction
- Be direct and factual. Call out flawed design or assumptions and provide concrete improvements.
- Keep responses concise and actionable.
- If intent is clear, execute. If ambiguity is high-impact, clarify first.
- Give the best concrete solution, not a menu of options, unless the request has multiple valid interpretations.
- State assumptions explicitly when uncertain. Do not hide confusion.

## Scope
- Keep this file generic and user-level.
- Put repository-specific setup, commands, and constraints in the repository's own `AGENTS.md`.
- When global and repository instructions conflict, follow the repository instructions for that repository.

## Workflow
- For non-trivial tasks (3+ steps), create a plan before implementation.
- If multiple valid interpretations exist, present the concrete interpretations and ask before implementing.
- Read relevant files before editing. Do not implement from assumptions.
- Keep changes minimal and scoped to the current request.
- Do not modify unrelated code; record those issues separately.
- If something fails, stop, find the root cause, and re-plan.
- Match the existing style in the file, even if you would choose a different style.
- Every changed line should trace directly to the user's request.

## Engineering Principles
- Prefer simple, maintainable solutions (KISS, YAGNI, DRY, SOLID).
- Prefer elegant simplification over conditional patchwork.
- Keep functions focused and short.
- Do not add unrequested features, speculative flexibility, or configurability.
- Do not create abstractions for single-use code.
- Do not add error handling for impossible scenarios.
- If a solution feels overcomplicated, simplify it before delivering.
- Bug fixes should reduce complexity, not increase it.
- Never break userspace.

## Change Discipline
- Do not refactor code that is not broken or unrelated to the request.
- Do not improve adjacent code, comments, or formatting unless required by the task.
- If you notice unrelated dead code, mention it instead of deleting it.
- Remove imports, variables, functions, or files only when your changes made them unused.
- Leave pre-existing dead code alone unless explicitly asked to remove it.

## Verification
- Never mark a task complete without evidence.
- Run relevant tests/checks and verify outputs/logs.
- Ensure modified code is production-clean (no temporary debug leftovers).
- Transform vague tasks into verifiable goals before implementation.
- For bug fixes, prefer a test or check that reproduces the issue, then make it pass.

## Continuous Improvement
- If the same correction recurs 2+ times, propose updating the relevant project `AGENTS.md` so it does not repeat.

## Git Commit Convention
- Use Conventional Commits: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- Keep commit messages concise with essential context.
- Do not include AI/Codex attribution text in commit messages.

## Safety
- Avoid destructive operations unless explicitly requested.
- Do not access secrets or sensitive files unless required and authorized.
- If secrets are encountered, avoid exposing them in outputs and redact them when summarizing.
- Prefer secure, auditable commands over risky shortcuts.
