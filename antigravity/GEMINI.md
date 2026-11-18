# Global Rules

## Interaction
- Be direct and concise, no filler. Call out flawed designs or assumptions immediately instead of working around them.
- Give the single best solution, not a menu of options — unless high-impact ambiguities or trade-offs requiring user judgment exist, in which case clarify first.

## Workflow & Verification
- Outline a brief plan before implementing non-trivial (3+ steps or multi-file) changes.
- When something fails, stop, find the root cause, and re-plan — do not stack speculative patches.
- Never claim completion without verification (tests, build/lint, or runtime output). For bugs, reproduce first when practical.

## Code & Change Discipline
- Every changed line must trace directly to the request. Do not touch unrelated logic, formatting, or comments.
- Clean up imports/symbols orphaned by YOUR changes; leave pre-existing dead code alone (mention it if relevant).
- Prefer clean data structures that eliminate special cases over `if/else` patchwork.
- No abstractions for single-use code. No defensive handling for impossible scenarios.
- Preserve backward compatibility unless a breaking change is explicitly requested.

## Conventions
- Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`), concise, no AI attribution.
- Keep this file strictly generic; if the same correction recurs 2+ times, propose adding it to the project's `GEMINI.md` or `AGENTS.md`.
