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
13. `census/endpoints_candidates.csv`
14. `census/message_candidates.csv`
15. `census/storage_candidates.csv`
16. `census/string_constants.csv`
17. `census/census_summary.json`
18. `census/message_candidate_review.csv`
19. `census/storage_candidate_review.csv`
20. `census/workflow_candidates.csv`
21. `census/workflow_candidate_review.csv`
22. `census/workflow_promotion_audit.md` when final workflows are materially smaller than confirmed/likely workflow candidates
23. `census/final_promotion_audit.md` when final arrays are materially smaller than reviewed CSV tables

Also copy the final `extension_summary.json` to `privacy_workspace/extension_summary.json`.


## Census Deliverables

The census deliverables are mandatory for normal source-code analysis runs because they protect the final report from undercounting endpoints, message channels, and storage keys.

- `census/endpoints_candidates.csv` is the review queue for literal URLs, relative routes, synthesized endpoint candidates, WebSockets, telemetry URLs, auth URLs, config URLs, and redirect targets.
- `census/message_candidates.csv` is the review queue for Chrome messaging, `window.postMessage`, port messaging, and custom RPC/event-bus candidates.
- `census/storage_candidates.csv` is the review queue for Chrome storage, Web Storage, IndexedDB, cookies, and custom storage/cache wrapper candidates.
- `census/string_constants.csv` preserves suspicious string constants that may explain endpoint/message/storage construction.
- `census/census_summary.json` records counts and manifest-derived domain hints.
- `census/promoted_endpoints.csv`, `census/promoted_messages.csv`, and `census/promoted_storage_keys.csv` are the reviewed machine-filtered queues used for final JSON promotion.
- `census/excluded_endpoints.csv`, `census/excluded_messages.csv`, and `census/excluded_storage_keys.csv` are the false-positive audit trail with exclusion reasons.
- `census/message_candidate_review.csv` is the LLM adjudication table for promoted message candidates. It must classify each promoted message row as `confirmed_message_channel`, `likely_message_channel`, `rejected_candidate`, or `uncertain_candidate`.
- `census/storage_candidate_review.csv` is the LLM adjudication table for promoted storage candidates. It must classify each promoted storage row as `confirmed_storage_key`, `likely_storage_key`, `rejected_candidate`, or `uncertain_candidate`.
- `census/workflow_candidates.csv` is the evidence-clustered workflow candidate table built from reviewed endpoints, messages, storage keys, components, permissions, listeners, and triggers.
- `census/workflow_candidate_review.csv` is the LLM adjudication table for workflow candidates. It must classify each row as `confirmed_workflow`, `likely_workflow`, `merged_workflow`, `rejected_candidate`, or `uncertain_candidate`.
- `census/workflow_promotion_audit.md` is required when final workflows are materially fewer than confirmed/likely workflow candidates or when the workflow linter flags missing category coverage.
- `census/promotion_summary.json` records promoted/excluded counts.

These files are candidate sources, not final behavioral evidence by themselves. Final `extension_summary.json` evidence must still cite original extension source files and line ranges.

Final `messaging.channels` must be built from `message_candidate_review.csv`, not directly from `promoted_messages.csv`. Only `confirmed_message_channel` and `likely_message_channel` rows may appear in final `messaging.channels`. Rejected or uncertain rows must stay out of final JSON unless a manual override with source evidence is documented.

After final `extension_summary.json` is written, run `node tools/message_review_linter.js OUT_DIR`. The final output is not acceptable if the linter reports obvious fake message channels or missing/invalid message adjudication.

Final `workflows` must be built from `workflow_candidate_review.csv`, not from a short hand-written top-three summary. Only `confirmed_workflow` and `likely_workflow` rows may appear as standalone final workflows; `merged_workflow` rows must be represented inside their target workflow with the merge reason documented. After final `extension_summary.json` is written, run `node tools/workflow_review_linter.js OUT_DIR`. The final output is not acceptable if the linter reports under-clustered workflows, missing workflow adjudication, or unexplained category gaps.

Final `storage.keys` must be built from `storage_candidate_review.csv`, not directly from `promoted_storage_keys.csv`. Only `confirmed_storage_key` and `likely_storage_key` rows may appear in final `storage.keys`. Rejected or uncertain rows must stay out of final JSON unless a manual override with source evidence is documented.

If final `network.endpoints`, `messaging.channels`, or `storage.keys` arrays are materially smaller than their reviewed promoted/adjudicated CSV tables, `census/final_promotion_audit.md` must explain the gap. The model must not silently compress promoted rows into a top-N summary and must not copy raw excluded or rejected rows into final JSON.
## Privacy Suite Deliverables

After the main reverse-engineering workflow produces `extension_summary.json` and copies it to `privacy_workspace/extension_summary.json`, run the appended privacy suite when the user supplied a Chrome Web Store extension ID.

Required when an extension ID is supplied and `fetch_privacy.py` succeeds:

24. `privacy_workspace/declared_privacy.json`
25. `privacy_workspace/privacy_comparison.json`

Conditional on an external privacy policy being available:

26. `privacy_workspace/external_privacy_comparison.json`
27. `privacy_workspace/internal_external_privacy_comparison.json`

Privacy-suite rules:

- `prompt2.md`, `prompt3.md`, `prompt4.md`, and `prompt5.md` are full reference prompts and must be read during their corresponding steps.
- If no extension ID is supplied, Step 8-11 outputs are not required; record the skip or blocker in `scan_log.txt`.
- If `fetch_privacy.py` fails, do not invent declared privacy data and do not create downstream comparison outputs from guesses.
- If no external privacy policy exists or can be retrieved, do not create `external_privacy_comparison.json` or `internal_external_privacy_comparison.json`; record the graceful skip in `scan_log.txt`.
- Prompt3 and Prompt4 comparisons must use `observed_privacy_data.items` as the primary observed-behavior source when present, with older summary fields only as fallback.
- Prompt3-5 are comparison steps; they must not re-scan source files or weaken the source-evidence requirements of the main reverse-engineering output.

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
- Include `privacy_observations` in relevant chunk findings when the chunk shows privacy-relevant data being read, generated, stored, processed, transmitted, or exposed through messaging.
- Never wait until the end of the run to backfill streaming artifacts.

## Privacy Evidence Inventory Contract

`extension_summary.json` must include a top-level `observed_privacy_data` object.

This section is an evidence-first inventory of concrete data flows observed in code. It must not be reduced to broad Chrome Web Store-style categories. Preserve specific data names and paths such as page URL transmission, machine identifiers, auth tokens, analytics payload fields, product metadata, image data, settings, A/B assignments, browser/device details, locale, and external storage access when evidenced.

This section is additive. It must not replace or shrink the legacy `privacy` summary, `risks`, `workflows`, `network`, `messaging`, or `storage` sections.

Each `observed_privacy_data.items[]` entry should include:

- `data_name`
- `data_description`
- `source`
- `operation`
- `collection_trigger`
- `storage`
- `transmission`
- `local_processing`
- `user_control_or_consent`
- `purpose_observed`
- `confidence`
- `evidence`
- optional `notes`

Use `"unknown"` where the code does not establish a value. Do not invent consent, retention, recipients, payload fields, or purposes beyond what can be supported by evidence.

## Completion Contract

Do not present the run as complete until all of the following are true:

- required deliverables exist
- schema validation has passed or the failure is documented
- counts and tool usage are summarized in `scan_log.txt`
- blockers, unknowns, and downgraded fallbacks are documented
- message directions use the schema's allowed enum values
- final evidence points to original source files
- `observed_privacy_data` is present and does not replace existing `privacy`, `network`, `messaging`, `storage`, `workflows`, or `risks` sections
- `risks` is populated from the Step 6 security/risk analysis and not merely implied by privacy observations
- manifest-derived fields have been checked directly against `manifest.json` rather than inferred from downstream notes
- manifest-declared `host_permissions` are preserved when present, or the failure is documented as a blocker
- large content scripts were audited deeply enough to capture DOM, messaging, storage, URL, iframe, observer, and navigation behavior when present
- broad final evidence ranges were narrowed where possible, or the remaining broad ranges were documented as unavoidable
- `remote_code` and `policy_violation` risks were type-checked against concrete behavior rather than speculative concerns
- if an extension ID was supplied, the privacy-suite required outputs exist or the blocker is recorded in `scan_log.txt`
- if no extension ID was supplied, the reverse-engineering run may still be complete, but the privacy-suite skip must be explicit in `scan_log.txt`
- if an external policy was unavailable, the conditional privacy-suite outputs must be absent or clearly marked as not created because the input was unavailable

If a required output cannot be produced, record the blocker explicitly and continue with every remaining deliverable that is still possible.


