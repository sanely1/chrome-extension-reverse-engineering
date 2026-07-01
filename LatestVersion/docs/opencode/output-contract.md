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
20. `census/semantic_architecture_review.csv`
21. `census/workflow_candidates.csv`
22. `census/workflow_candidate_review.csv`
23. `census/workflow_promotion_audit.md` when final workflows are materially smaller than confirmed/likely workflow candidates
24. `census/final_promotion_audit.md` when final arrays are materially smaller than reviewed CSV tables
25. `census/privacy_signal_matrix.csv`
26. `census/privacy_candidate_review.csv`
27. `census/risk_candidate_review.csv`
28. `census/privacy_risk_evidence_review.csv`
29. `census/privacy_risk_audit.md` when final privacy/risk outputs are materially smaller than reviewed evidence suggests or broad final evidence ranges cannot be narrowed
30. `census/source_file_inventory.csv`
31. `census/source_chunks.csv`
32. `census/high_signal_chunks.csv`
33. `census/high_signal_chunk_review.csv`
34. `census/critical_mechanisms.csv`
35. `policy_compliance_report.json`

Also copy the final `extension_summary.json` to `privacy_workspace/extension_summary.json`.


## Census Deliverables

The census deliverables are mandatory for normal source-code analysis runs because they protect the final report from undercounting endpoints, message channels, and storage keys.

- `census/endpoints_candidates.csv` is the review queue for literal URLs, relative routes, synthesized endpoint candidates, WebSockets, telemetry URLs, auth URLs, config URLs, and redirect targets.
- `census/message_candidates.csv` is the review queue for Chrome messaging, `window.postMessage`, port messaging, and custom RPC/event-bus candidates.
- `census/storage_candidates.csv` is the review queue for Chrome storage, Web Storage, IndexedDB, cookies, and custom storage/cache wrapper candidates.
- `census/string_constants.csv` preserves suspicious string constants that may explain endpoint/message/storage construction.
- `census/census_summary.json` records counts and manifest-derived domain hints.
- `census/source_file_inventory.csv` records every runtime-relevant JavaScript source file selected for mandatory chunk review, with role, source, reason, line count, and chunk count.
- `census/source_chunks.csv` records the exact automated coverage queue. It proves which runtime source chunks were available for extraction, not that every chunk was manually read.
- `census/high_signal_chunks.csv` records the subset of runtime chunks that contain privacy/risk-sensitive signals and therefore require manual inspection.
- `census/high_signal_chunk_review.csv` records the manual inspection result for each required high-signal chunk, including summary, privacy data found, risk candidates found, exact anchors, decision, and notes.
- `census/critical_mechanisms.csv` records the policy-relevant mechanisms that connect observed code behavior to specific Chrome Web Store Program Policy clause IDs.
- `census/promoted_endpoints.csv`, `census/promoted_messages.csv`, and `census/promoted_storage_keys.csv` are the reviewed machine-filtered queues used for final JSON promotion.
- `census/excluded_endpoints.csv`, `census/excluded_messages.csv`, and `census/excluded_storage_keys.csv` are the false-positive audit trail with exclusion reasons.
- `census/message_candidate_review.csv` is the LLM adjudication table for promoted message candidates. It must classify each promoted message row as `confirmed_message_channel`, `likely_message_channel`, `rejected_candidate`, or `uncertain_candidate`.
- `census/storage_candidate_review.csv` is the LLM adjudication table for promoted storage candidates. It must classify each promoted storage row as `confirmed_storage_key`, `likely_storage_key`, `rejected_candidate`, or `uncertain_candidate`.
- `census/semantic_architecture_review.csv` is the required semantic review table for architecture-level behavior families such as text capture, auth/token handling, telemetry/tracking, storage persistence, remote config, messaging/RPC, privacy sanitization, native/external bridges, AI/model features, and security-sensitive dynamic behavior.
- `census/workflow_candidates.csv` is the evidence-clustered workflow candidate table built from reviewed endpoints, messages, storage keys, components, permissions, listeners, and triggers.
- `census/workflow_candidate_review.csv` is the LLM adjudication table for workflow candidates. It must classify each row as `confirmed_workflow`, `likely_workflow`, `merged_workflow`, `rejected_candidate`, or `uncertain_candidate`.
- `census/workflow_promotion_audit.md` is required when final workflows are materially fewer than confirmed/likely workflow candidates or when the workflow linter flags missing category coverage.
- `census/promotion_summary.json` records promoted/excluded counts.

These files are candidate sources, not final behavioral evidence by themselves. Final `extension_summary.json` evidence must still cite original extension source files and line ranges.

Final `messaging.channels` must be built from `message_candidate_review.csv`, not directly from `promoted_messages.csv`. Only `confirmed_message_channel` and `likely_message_channel` rows may appear in final `messaging.channels`. Rejected or uncertain rows must stay out of final JSON unless a manual override with source evidence is documented.

After final `extension_summary.json` is written, run `node tools/message_review_linter.js OUT_DIR`. The final output is not acceptable if the linter reports obvious fake message channels or missing/invalid message adjudication.

Final `workflows` must be built from `workflow_candidate_review.csv` and `semantic_architecture_review.csv`, not from a short hand-written top-three summary. Only `confirmed_workflow` and `likely_workflow` rows may appear as standalone final workflows; `merged_workflow` rows must be represented inside their target workflow with the merge reason documented. After final `extension_summary.json` is written, run `node tools/workflow_review_linter.js OUT_DIR`. The final output is not acceptable if the linter reports under-clustered workflows, missing workflow adjudication, or unexplained category gaps.

After final `extension_summary.json` is written, run `node tools/semantic_coverage_linter.js OUT_DIR`. The final output is not acceptable if the source chunk inventory is missing, high-signal coverage is missing, or `semantic_architecture_review.csv` is missing, unless a real blocker is documented in `scan_log.txt`.

Final `storage.keys` must be built from `storage_candidate_review.csv`, not directly from `promoted_storage_keys.csv`. Only `confirmed_storage_key` and `likely_storage_key` rows may appear in final `storage.keys`. Rejected or uncertain rows must stay out of final JSON unless a manual override with source evidence is documented.

If final `network.endpoints`, `messaging.channels`, or `storage.keys` arrays are materially smaller than their reviewed promoted/adjudicated CSV tables, `census/final_promotion_audit.md` must explain the gap. The model must not silently compress promoted rows into a top-N summary and must not copy raw excluded or rejected rows into final JSON.

Final `observed_privacy_data.items` must be built from `privacy_candidate_review.csv`, which itself must be built from `privacy_signal_matrix.csv`. Only `confirmed_privacy_flow` and `likely_privacy_flow` rows may appear as standalone final privacy items. `merged_privacy_flow` rows must be represented inside their target item with the merge reason documented. Rejected or uncertain privacy candidates must not appear in final JSON.

Final `risks` must be built from `risk_candidate_review.csv`, which itself must be built from `privacy_signal_matrix.csv`, source chunk findings, final privacy items, permissions, endpoints, messages, storage keys, semantic architecture findings, and workflows. `confirmed_risk`, `likely_risk`, and `mitigated_low_risk` rows may appear as standalone final risks. `mitigated_low_risk` rows must use low severity and explain the mitigation or limitation. `merged_risk` rows must be represented inside their target risk with the merge reason documented. Rejected or uncertain risk candidates must not appear in final JSON.

Every semantic architecture row with a non-empty `risk_impact` must be covered by `risk_candidate_review.csv` as confirmed, likely, mitigated low, merged, rejected, or uncertain. Do not invent final risks to satisfy a fixed count; review the signal and record the decision.

Final privacy/risk evidence must be checked in `privacy_risk_evidence_review.csv`. Every final `observed_privacy_data.items[]` entry and every final `risks[]` entry must have a corresponding evidence review row with `narrow_evidence_confirmed` or `broad_range_justified`. Prefer exact callsites and branches. Evidence ranges wider than 80 lines require a concrete justification and `census/privacy_risk_audit.md`.

For minified one-line JavaScript evidence such as original `1-1` or `2-2`, the evidence-bearing file must be beautified. Final `extension_summary.json` should cite the beautified file and line range for privacy/risk readability, while `privacy_risk_evidence_review.csv` preserves the original file/range and includes an anchor, matched snippet, offset, or context. A bare original one-line bundle citation is not enough to prove a privacy item or risk.

The anchor or matched snippet must be traceable to the original source file recorded in `original_evidence_file` or `evidence_file`. If the proof lives in `manifest.json`, CSP, another bundle, or a different injected script, change the evidence file and line range accordingly. Final privacy/risk JavaScript evidence must also map back to a manually reviewed row in `census/high_signal_chunk_review.csv`, unless a written audit explains why the chunk was not high-signal. If final evidence cites a `*.beautified.js` readability copy, map it to high-signal review using `original_evidence_file`, `original_start`, and `original_end`; do not fix a mapping failure by replacing the anchor with an unrelated string that merely exists in the file.

If `tools/generate_summary.js` is used, it must compile final data from manifest fields, reconciled CSV files, and reviewed candidate tables. It must not hardcode a fixed set of workflows, privacy items, risks, endpoints, messages, or storage keys for a specific extension. Final privacy/risk counts must not exceed the confirmed/likely rows in their review CSVs.

After final `extension_summary.json` is written, run `node tools/privacy_risk_linter.js OUT_DIR` and `node tools/high_signal_review_linter.js OUT_DIR ./extension`. The final output is not acceptable if the linters report missing privacy/risk review files, missing high-signal manual review, mismatched anchors, obvious unsupported compliance claims, or suspiciously tiny privacy/risk outputs for a large signal set without `census/privacy_risk_audit.md`.

## Chrome Web Store Policy Deliverables

The policy-compliance layer is required after the main reverse-engineering output and appended privacy suite have been handled. It is additive and must not replace `risks`, `privacy`, `observed_privacy_data`, or prompt2-5 comparison outputs.

Reference files:

- `docs/policies/chrome_webstore_program_policies.md`
- `docs/policies/chrome_webstore_program_policies.json`
- `docs/policies/policy_signal_mapping.json`

Required policy outputs:

- `census/critical_mechanisms.csv`
- `policy_compliance_report.json`

`census/critical_mechanisms.csv` must include:

```text
mechanism_id,mechanism_type,description,source_finding,derived_from_findings,evidence_file,evidence_start,evidence_end,policy_clause_ids,criticality_reason,decision,notes
```

`derived_from_findings` must be a semicolon-separated trace back to the original findings used to create the mechanism, such as:

```text
observed_privacy_data:Edited Document Text;risk:pii_exfiltration;workflow:Realtime Text Checking;permission:<all_urls>
```

Do not use `critical_mechanisms.csv` as a lossy replacement for the original findings. It is a bridge layer, so every critical/supporting mechanism must preserve its source finding references.

`policy_compliance_report.json` must include:

- `source_policy`
- `summary`
- `findings`

Each policy finding must include:

- `finding_id`
- `status`
- `policy_clause_ids`
- `policy_area`
- `mechanism_ids`
- `source_finding_refs`
- `observed_behavior`
- `evidence`
- `breach_argument`
- `confidence`
- `missing_info`

Allowed policy finding statuses:

- `confirmed_breach`
- `likely_breach`
- `possible_breach`
- `compliance_concern`
- `not_enough_evidence`
- `not_applicable`

Policy report rules:

- Every `policy_clause_ids[]` entry must exist in `docs/policies/chrome_webstore_program_policies.json`.
- Every policy finding should include `source_finding_refs` so the policy argument can be traced back through mechanisms to the original privacy/risk/workflow/endpoint/message/storage/permission finding.
- Use `confirmed_breach` only when source behavior and disclosure/declaration/policy evidence together prove a concrete policy conflict.
- Direct contradiction between declared no-data/no-category/no-collection claims and confirmed observed privacy flows is a concrete disclosure conflict and should be represented as `confirmed_breach`.
- If store listing text, dashboard privacy fields, consent UI, declared privacy labels, or external privacy policy evidence is missing, prefer `possible_breach`, `compliance_concern`, or `not_enough_evidence`.
- Do not write broad claims such as "fully compliant", "fully conforms", or "this is compliant" from source code alone.
- Do not downplay evidenced disclosure conflicts with "not a breach" or "supports compliance" wording.
- Do not transform every technical risk into a policy breach. Build an explicit argument from observed behavior to a specific policy clause.
- Store detailed reasoning in `policy_compliance_report.json`; keep `extension_summary.json.policy_compliance` short.

`extension_summary.json` should include an additive top-level object:

```json
"policy_compliance": {
  "source": "Chrome Web Store Program Policies",
  "source_url": "https://developer.chrome.com/docs/webstore/program-policies/policies",
  "source_snapshot": "docs/policies/chrome_webstore_program_policies.json",
  "report": "policy_compliance_report.json",
  "critical_mechanisms_count": 0,
  "possible_breaches_count": 0,
  "confirmed_breaches_count": 0,
  "notes": "Detailed policy analysis is in policy_compliance_report.json."
}
```

After final policy report creation, run:

```text
node tools/policy_compliance_linter.js OUT_DIR
```

The final output is not acceptable if the linter reports unknown policy clause IDs, missing critical mechanism mapping, invalid policy statuses, or unsupported confirmed breach claims.
## Privacy Suite Deliverables

After the main reverse-engineering workflow produces `extension_summary.json` and copies it to `privacy_workspace/extension_summary.json`, run the appended privacy suite when the user supplied a Chrome Web Store extension ID.

Required when an extension ID is supplied and `fetch_privacy.py` succeeds:

36. `privacy_workspace/declared_privacy.json`
37. `privacy_workspace/privacy_comparison.json`

Conditional on an external privacy policy being available:

38. `privacy_workspace/external_privacy_comparison.json`
39. `privacy_workspace/internal_external_privacy_comparison.json`
40. `privacy_workspace/external_policy_claims.json`
41. `privacy_workspace/external_policy_claims_review.json`

Privacy-suite rules:

- `prompt2.md`, `prompt3.md`, `prompt4.md`, and `prompt5.md` are full reference prompts and must be read during their corresponding steps.
- If no extension ID is supplied, Step 8-11 outputs are not required; record the skip or blocker in `scan_log.txt`.
- If `fetch_privacy.py` fails, do not invent declared privacy data and do not create downstream comparison outputs from guesses.
- If no external privacy policy exists or can be retrieved, do not create `external_privacy_comparison.json` or `internal_external_privacy_comparison.json`; record the graceful skip in `scan_log.txt`.
- If an external privacy policy exists and has text, create `external_policy_claims.json` before Prompt 4 and Prompt 5 comparisons, or document the blocker in `scan_log.txt`.
- `external_policy_claims.json` is a draft candidate file. Create `external_policy_claims_review.json` by LLM adjudication and use its `final_claims[]` as the primary external-policy representation.
- Prompt4 and Prompt5 must use `external_policy_claims_review.json.final_claims[]` as the primary external-policy representation when it exists, falling back to raw `external_privacy_policy.privacy_text` only when reviewed claims are unavailable or incomplete.
- Prompt3 and Prompt4 comparisons must use `observed_privacy_data.items` as the primary observed-behavior source when present, with older summary fields only as fallback.
- Prompt3-5 are comparison steps; they must not re-scan source files or weaken the source-evidence requirements of the main reverse-engineering output.
- Do not create a separate external-privacy-policy-vs-Google-policy comparison output. External policy claims are used for external-vs-observed and internal-vs-external privacy comparisons only.

## Evidence Contract

- Every non-trivial claim in final structured output must include at least one evidence span.
- Evidence should use original file paths for normal structural claims. Privacy/risk/policy evidence in minified JavaScript may use beautified file paths when the original source path and anchor are preserved in the review artifacts.
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
- `census/source_chunks.csv` is the authoritative automated coverage queue.
- `census/high_signal_chunks.csv` is the authoritative manual review queue for privacy/risk-sensitive chunks.
- Every required row in `high_signal_chunks.csv` must have a matching `high_signal_chunk_review.csv` row by source file and line range.
- `census/source_file_inventory.csv` must explain why each JavaScript file was included as runtime-relevant. Do not silently omit manifest-declared runtime scripts.

## Streaming Contract

- Append findings to `outline.jsonl` after each manually reviewed high-signal chunk.
- Append human-readable notes to `analysis_notes.md` after each manually reviewed high-signal chunk.
- Append discovered rows to CSV outputs as items are found.
- Include `privacy_observations` in relevant chunk findings when the chunk shows privacy-relevant data being read, generated, stored, processed, transmitted, or exposed through messaging.
- Include chunk-level risk candidates in relevant chunk findings when the chunk shows concrete tracking, PII/data transfer, insecure storage, excessive permission use, remote code/config behavior, fingerprinting, policy, or other security/privacy concerns.
- Chunk-level findings are candidates. They must be reconciled into reviewed CSVs before becoming final `network`, `messaging`, `storage`, `observed_privacy_data`, or `risks`.
- Never use generated notes to pretend every source chunk was manually read. Low-signal chunks can be covered by automated census only; high-signal chunks require manual review artifacts.

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
- final evidence points to original source files, or to beautified source copies for minified privacy/risk/policy evidence with original traceability preserved
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
- policy-compliance outputs exist after Step 12-14, or missing inputs/blockers are documented
- `policy_compliance_report.json` uses known Chrome Web Store policy clause IDs and does not claim confirmed breaches without evidence

If a required output cannot be produced, record the blocker explicitly and continue with every remaining deliverable that is still possible.


