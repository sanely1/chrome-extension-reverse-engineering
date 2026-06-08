# Chrome Extension Reverse Engineering

## Source Of Truth

- `prompt.md` is the complete project specification.
- Read `prompt.md` before planning or running analysis.
- Follow the workflow, schemas, deliverables, filenames, logging rules, evidence rules, and validation rules defined in `prompt.md`.
- If any instruction in this file conflicts with `prompt.md`, follow `prompt.md`.

## Execution

- For a full run, execute the workflow in `prompt.md` from setup through final validation.
- Produce the exact deliverables requested in `prompt.md`.
- Keep the final output in the structured schema described in `prompt.md`.
- Do not replace required JSON, CSV, JSONL, PlantUML, log, or schema artifacts with prose-only summaries.
- Continue to the next step when the current step is complete unless there is a real blocker.

## Shell Compatibility

- `prompt.md` includes command examples.
- When an example command is shell-specific, use the equivalent command for the current shell while preserving the same file operation and output behavior.
- Append-only rules still apply even if the append syntax differs by shell.

## Evidence And Validation

- Evidence must point to extension source files, not beautified files or generated notes.
- Every non-trivial claim in `extension_summary.json` must include evidence as required by `prompt.md`.
- Validate `extension_summary.json` against the schema from `prompt.md`.
- If validation fails, fix the output or document the blocker in the required run artifacts.
