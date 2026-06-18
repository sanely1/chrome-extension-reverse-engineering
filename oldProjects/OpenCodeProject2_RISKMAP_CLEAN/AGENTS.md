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
- **Large File Programmatic Analysis**: If any file (background script, content script, etc.) contains more than 10,000 lines of code, do not rely on static predefined list-scanners or manual chunk-by-chunk summarizations. You MUST write or run a dynamic script (e.g. Node.js or PowerShell) to parse and extract the absolute exhaustive set of unique `chrome.*` and `browser.*` APIs and active listener hooks from the entire file. Every single discovered specific API method must be listed individually (do not summarize or group them into general families).
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


## Census Extractor Rule

For real analysis runs with source files available, run `node tools/census_extractor.js ./extension OUT_DIR` immediately after Step 2 and before Step 4/5/6, then run `node tools/census_promoter.js OUT_DIR`. Review `OUT_DIR/census/promoted_endpoints.csv`, `OUT_DIR/census/promoted_messages.csv`, and `OUT_DIR/census/promoted_storage_keys.csv` before workflow clustering, privacy analysis, or risk analysis. Raw candidate rows are mandatory review inputs, not final evidence by themselves. Do not copy rows from `excluded_*.csv` into final JSON unless a manual override explains the source evidence.

Messages need an extra adjudication pass because bundled/minified code can make message-like false positives. Create `OUT_DIR/census/message_candidate_review.csv` after the promoter and classify every promoted message row as `confirmed_message_channel`, `likely_message_channel`, `rejected_candidate`, or `uncertain_candidate`. Final `messaging.channels` may include only confirmed/likely rows. Reject generic DOM events, Promise/internal labels, HTTP methods, URLs, domains, routes, package names, file names, CSS selectors, static asset names, human-readable log/error strings, generic object fields, implementation/class names, template/minification artifacts, metric labels, MIME types, version strings, and one-sided strings without sender/handler/payload/message context. Confirmed/likely message channels must be used to map sender/handler direction and considered during workflow, privacy, and risk analysis; rejected/uncertain rows must not be used to invent workflows, privacy flows, or risks. After writing `extension_summary.json`, run `node tools/message_review_linter.js OUT_DIR`; a linter failure is a blocker to finalization.

Storage needs an extra adjudication pass because bundled/minified code can make storage-like false positives. Create `OUT_DIR/census/storage_candidate_review.csv` after the promoter and classify every promoted storage row as `confirmed_storage_key`, `likely_storage_key`, `rejected_candidate`, or `uncertain_candidate`. Final `storage.keys` may include only confirmed/likely rows. Reject class names, implementation names, generic schema/object fields, UI/CSS constants, event/error labels, namespace prefixes, domains, URLs, file names, package names, and callback strings accidentally captured by storage API scans. Sensitive-looking confirmed/likely storage keys must be considered during privacy and risk analysis; rejected/uncertain rows must not be used to invent privacy flows or risks.

Top-N compression is forbidden: final `network.endpoints`, `messaging.channels`, and `storage.keys` must include all supported non-duplicate rows from the promoted/adjudicated reviewed CSV tables or include `OUT_DIR/census/final_promotion_audit.md` explaining exclusions.

## Semantic Architecture Review Rule

Mechanical extraction is not enough for privacy and risk quality. After census reconciliation and before components, workflows, privacy, or risks, create `OUT_DIR/census/semantic_architecture_review.csv` from chunk-by-chunk source analysis. Review architecture-level behavior families including text capture, auth/token handling, telemetry/tracking, storage persistence, remote config, messaging/RPC, privacy sanitization, native/external bridges, AI/model features, and security-sensitive dynamic behavior.

`analysis_notes.md` and `outline.jsonl` must show real chunk-by-chunk work. A large extension with tiny notes or only a few outline rows is not complete unless a real blocker is documented in `scan_log.txt`. After writing `extension_summary.json`, run `node tools/semantic_coverage_linter.js OUT_DIR`; a linter failure blocks finalization. Final evidence must still cite original source files, not notes or outline entries.

Every semantic architecture row with a non-empty `risk_impact` must be represented in `OUT_DIR/census/risk_candidate_review.csv` as `confirmed_risk`, `likely_risk`, `merged_risk`, `rejected_candidate`, or `uncertain_candidate`. Do not add privacy items or risks merely to satisfy a fixed count; if a signal is weak, reject or mark it uncertain with a reason.

## Workflow Review Rule

Workflows must be built from evidence clusters, not from a short narrative summary. During Step 5, create `OUT_DIR/census/workflow_candidates.csv` from reviewed endpoints, confirmed/likely messages, confirmed/likely storage keys, components, permissions, listeners, and triggers. Then create `OUT_DIR/census/workflow_candidate_review.csv` and classify each candidate as `confirmed_workflow`, `likely_workflow`, `merged_workflow`, `rejected_candidate`, or `uncertain_candidate`. Final `workflows` may include only confirmed/likely workflows, plus merged behavior inside the named target workflow. If final workflows are materially fewer than confirmed/likely candidates, create `OUT_DIR/census/workflow_promotion_audit.md` with exact merge/rejection reasons. After writing `extension_summary.json`, run `node tools/workflow_review_linter.js OUT_DIR`; a linter failure is a blocker to finalization.

For large bundled extensions, do not silently collapse lifecycle, auth/account, config/feature-flag, telemetry/error, content/page interaction, UI/popup/sidepanel, storage/cache, external bridge, text/document/media processing, or permission/security behavior into three generic workflows when separate evidence exists.

## Privacy/Risk Review Rule

Privacy and risk findings must be built from reviewed evidence, not from a short generic summary. Before final privacy/risk synthesis, create `OUT_DIR/census/privacy_signal_matrix.csv` from reviewed endpoints, confirmed/likely messages, confirmed/likely storage keys, semantic architecture findings, workflows, permissions, CSP, content-script page/DOM access, telemetry, auth/account behavior, config/treatment behavior, UI state, cookies, IndexedDB/Web Storage, injected-script behavior, and external bridges. Then create `OUT_DIR/census/privacy_candidate_review.csv`, `OUT_DIR/census/risk_candidate_review.csv`, and `OUT_DIR/census/privacy_risk_evidence_review.csv`.

Final `observed_privacy_data.items` may include only `confirmed_privacy_flow` and `likely_privacy_flow` rows, plus documented merges. Final `risks` may include only `confirmed_risk` and `likely_risk` rows, plus documented merges. Rejected or uncertain candidates must not be used to invent privacy flows or risks. Every major privacy item must be checked for risk impact; if no risk is supported, document the mitigating reason in `risk_candidate_review.csv`.

Final privacy/risk evidence must cite the narrowest accurate original-source range. Do not leave broad ranges such as `1-150` when an exact function, branch, storage operation, message handler, fetch/WebSocket call, permission declaration, or DOM extraction block can support the claim. Ranges wider than 80 lines require a concrete justification in `privacy_risk_evidence_review.csv` and `privacy_risk_audit.md`.

After writing `extension_summary.json`, run `node tools/privacy_risk_linter.js OUT_DIR`. A linter failure is a blocker to finalization unless `OUT_DIR/census/privacy_risk_audit.md` explains why the reviewed evidence genuinely supports a small privacy/risk result. Do not make unsupported compliance claims such as "fully compliant"; use `"unknown"` unless compliance is directly evidenced.

For minified one-line JavaScript evidence such as `1-1` or `2-2`, `privacy_risk_evidence_review.csv` must include an anchor, matched snippet, offset, or context. A bare one-line bundle citation is not meaningful evidence.

If `tools/generate_summary.js` is used, it must compile the final JSON from manifest data, reconciled CSV files, and reviewed candidate tables. Never hardcode extension-specific workflows, privacy items, or risks in the generator. The final privacy/risk counts must not exceed the confirmed/likely rows in their review CSV files.
## Human Operator Notes

- If the user asks how to run the system in OpenCode, point them to `prompt.md`.



