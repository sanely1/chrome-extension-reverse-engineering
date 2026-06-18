# Chrome Extension Reverse Engineering Rules

## Project Context

This project analyzes Chrome extensions, primarily Manifest V3, to produce structured, evidence-based behavioral reports.

## Non-Negotiable Rules

- Keep all work local to the workspace unless the user explicitly requests something else.
- Ground every substantive claim in verifiable code evidence.
- If a fact cannot be verified, use `"unknown"` and record the gap in `analysis_notes.md`.
- Never cite beautified or derived file paths in final evidence.
- Prefer original file paths and the narrowest accurate line ranges.
- Prefer workspace-relative original source paths such as `extension/background.js` or `extension/manifest.json` in final JSON evidence.
- Treat any filename containing `beautified` as a derived artifact, not an original source file.
- Append only to `analysis_notes.md` and `outline.jsonl`; never rewrite prior entries in those files.
- Do not use `analysis_notes.md`, `outline.jsonl`, or other generated artifacts as final evidence for behavioral claims; final evidence must point to original source files.
- Treat `observed_privacy_data` as an additive evidence inventory for concrete privacy-relevant data flows; it must not replace or weaken existing network, messaging, storage, workflow, privacy, or risk analysis.

## Execution Rules

- Continue through the workflow without asking for confirmation between successful steps.
- Do not stop after setup, inventory, parsing, table generation, workflow extraction, privacy analysis, or validation if the next step is clear.
- Only finish when every required deliverable exists, validates where applicable, and is logged, or when a blocker is explicitly documented in both `analysis_notes.md` and `scan_log.txt`.
- If uncertainty appears mid-run, make the safest reasonable assumption, record it, and continue.
- Do not let parse failures halt the run; fall back to tolerant parsing or regex extraction and note the downgrade in confidence.
- Do not collapse distinct behaviors into one workflow if the code clearly supports separate install, auth, analytics, support-check, image-processing, configuration, or data-control flows.
- Do not mark messaging as complete until both senders and handlers have been mapped for each discoverable channel.
- Do not let the additive `observed_privacy_data` section replace the original workflow's `privacy` summary or `risks` section. Risks must still be explicitly generated with severity, justification, and evidence.
- Treat missing manifest-declared fields in final JSON as quality failures. In particular, if `manifest.json` declares `host_permissions`, final `permissions.host_permissions` must not be empty unless a blocker is documented.
- Large content scripts require depth checks. If a large content script appears to have only sparse APIs/listeners, rescan for DOM, messaging, storage, URL, iframe, observer, navigation, and metadata behavior.
- Final evidence should be narrow. Whole-file or very broad evidence ranges require documentation and should have narrower supporting spans whenever possible.
- Use risk labels conservatively: `remote_code` and `policy_violation` require concrete supporting behavior, not only suspicion or unusual code.
- When a Chrome Web Store extension ID is supplied, continue after reverse engineering into the appended privacy suite: read and follow `prompt2.md`, `prompt3.md`, `prompt4.md`, and `prompt5.md` during their corresponding steps.
- If no extension ID is supplied, keep the main reverse-engineering output valid and record the privacy-suite skip in `scan_log.txt`.
- Do not invent declared privacy data if `fetch_privacy.py` fails, and do not create external-policy comparison outputs when no external policy exists.
- Treat prompt3-5 as comparison-only stages; do not re-scan source files there.

## MV3 Priorities

- Prefer `background.service_worker` over legacy background pages.
- Focus on MV3-specific behavior such as `declarativeNetRequest`, service workers, runtime messaging, scripting injection, storage, and remote communication.

## External File Loading

CRITICAL: Read referenced files on demand with your file-reading tools. Treat loaded references as mandatory task instructions.

- Do not preload every reference unless the current task clearly needs it.
- Follow references recursively when needed.
- Use the files below as the source of truth for their specific topics.

Read immediately for every real analysis run:

- `@docs/opencode/output-contract.md`
- `@docs/opencode/quality-gates.md`

Read when planning or executing the step-by-step pipeline:

- `@docs/opencode/workflow.md`

Read when producing or validating the final JSON:

- `@schema.chrome_extension_behavior.json`

## Human Operator Notes

- If the user asks how to run the system in OpenCode, point them to `prompt.md`.
