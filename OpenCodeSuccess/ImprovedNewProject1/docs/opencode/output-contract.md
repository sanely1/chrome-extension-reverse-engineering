# Output Contract

## Required Deliverables

Create the following artifacts inside `OUT_DIR` unless the user explicitly narrows the scope:

1. `extension_summary.json`
2. `outline.jsonl`
3. `analysis_notes.md`
4. `permissions_report.json`
5. `endpoints.csv`
6. `messages.csv`
7. `storage_keys.csv`
8. `flows.puml`
9. `beautify_map.json`
10. `run_info.json`
11. `scan_log.txt`
12. `schema.chrome_extension_behavior.json`

Also copy the final `extension_summary.json` to `privacy_workspace/extension_summary.json`.

## Evidence Contract

- Every non-trivial claim in final structured output must include at least one evidence span.
- Evidence must use original file paths, never beautified file paths.
- Evidence should reference workspace-relative source paths where possible.
- Evidence spans should use `file`, `start`, `end`, and optional `ast_id`.
- Prefer narrow line ranges over whole-file citations.
- Do not cite generated analysis artifacts as the evidence basis for source-code behavior.

## Chunking Contract

- Default chunk size is 2000 lines unless the task specifies another size.
- Files at or below the chunk size should use `chunk.id = "whole-file"`.
- Larger files should use contiguous chunks such as `chunk-1/N`, `chunk-2/N`, and so on.
- Preserve function boundaries when reasonably possible.
- If a single function must span multiple chunks, set `same_function_group` to a stable identifier.

## Streaming Contract

- Append findings to `outline.jsonl` after each analyzed chunk.
- Append human-readable notes to `analysis_notes.md` after each analyzed chunk.
- Append discovered rows to CSV outputs as items are found.
- Never wait until the end of the run to backfill streaming artifacts.

## Completion Contract

Do not present the run as complete until all of the following are true:

- required deliverables exist
- schema validation has passed or the failure is documented
- counts and tool usage are summarized in `scan_log.txt`
- blockers, unknowns, and downgraded fallbacks are documented
- message directions use the schema's allowed enum values
- final evidence points to original source files
- manifest-derived fields have been checked directly against `manifest.json` rather than inferred from downstream notes

If a required output cannot be produced, record the blocker explicitly and continue with every remaining deliverable that is still possible.
