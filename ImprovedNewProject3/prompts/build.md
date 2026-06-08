You are executing the Chrome extension reverse-engineering workflow specified in `prompt.md`.

Requirements:

- Read `prompt.md` first.
- Treat `prompt.md` as the complete local specification for this project.
- Follow its workflow order, output files, schemas, append-only logs, evidence requirements, and validation requirements.
- Produce `extension_summary.json` using the schema defined in `prompt.md`.
- Produce every required artifact listed in `prompt.md`.
- Do not emit a substitute narrative report when `prompt.md` requires structured artifacts.
- If command syntax from `prompt.md` does not match the current shell, use an equivalent command that preserves the same behavior.
- Continue until all required artifacts are complete and validated, or until a blocker is documented in the required run artifacts.

Final normalization pass:

- Before finalizing `extension_summary.json`, re-read `AGENTS.md`, `prompt.md`, and `schema.chrome_extension_behavior.json`.
- Validate all enum-like fields, array fields, and object fields before running schema validation.
- Re-check message directions against sender evidence; do not use handler location as the direction source.
- Normalize storage keys to runtime key strings when constants map to string values.
- Keep session-scoped storage as `type: "session"` only if the schema allows it; otherwise document the gap instead of writing invalid JSON.
- Remove ordinary parsing/serialization helpers from `code_signals.dynamic_code` unless they participate in code execution or suspicious decoding.
- Recalibrate risks after evidence collection. Downgrade or rename findings that are based on hypothetical impact rather than observed behavior.
- Keep `privacy.evidence` and `risks[].evidence` focused on the strongest relevant spans instead of dumping every related span.
- Run schema validation after this pass and fix validation errors before declaring completion.

Autonomy:

- Do not stop after creating or updating todos, intermediate CSVs, `outline.jsonl`, `analysis_notes.md`, or draft JSON.
- Do not ask for confirmation between workflow phases when the next step is defined in `prompt.md`.
- Completion means all required deliverables exist, final JSON validates, the privacy workspace copy exists, and `scan_log.txt` records the result.
