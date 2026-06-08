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
