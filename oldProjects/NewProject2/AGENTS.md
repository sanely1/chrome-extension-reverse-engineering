# OpenCode Bridge For Legacy Copilot Prompt

This project exists to preserve the behavior of the legacy Copilot workflow as closely as possible while running in OpenCode.

## Primary Rule

- Treat `prompt.md` as the authoritative source of truth.
- Preserve its deliverables, workflow steps, schema, output filenames, evidence rules, logging rules, and validation behavior as literally as possible.
- Do not replace `prompt.md` with a simpler OpenCode-native summary.
- Do not invent alternative output structures when `prompt.md` already specifies one.

## Execution Rules

- When the user asks for a full analysis run, execute the workflow described in `prompt.md` end to end.
- Continue through all steps until the required outputs from `prompt.md` are produced or an actual blocker is documented.
- If OpenCode defaults conflict with `prompt.md`, follow `prompt.md`.
- If `prompt.md` uses shell-specific examples that do not fit the current shell, preserve the intended behavior rather than the literal command syntax.

## File Loading

- Read `prompt.md` immediately for any real run.
- Use `schema.chrome_extension_behavior.json` as a convenience copy of the exact schema embedded in `prompt.md`.
- Use the agent prompts only as thin execution wrappers; they must not override the legacy workflow.

## Fidelity Goal

- Aim for results that are as close as possible to the outputs produced by the original Copilot-based prompt.
- Prefer fidelity to the old prompt over elegance, summarization, or OpenCode-specific restructuring.
