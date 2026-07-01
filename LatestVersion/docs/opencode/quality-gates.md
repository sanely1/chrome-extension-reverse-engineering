# Quality Gates

Use these gates before declaring a run complete.

## Gate 1: Manifest Fidelity

- `metadata`, `permissions`, `host_permissions`, `optional_permissions`, and entrypoint files must come directly from `extension/manifest.json` unless the field is absent.
- Do not emit `"unknown"` for `optional_permissions` when the manifest simply omits that field.
- Do not infer host permissions from content-script matches unless the final report clearly labels that distinction in notes.

## Gate 2: Messaging Completeness

- Build a message inventory from both sender sites and handler sites.
- Inspect `chrome.runtime.onMessage` logic branch by branch.
- Capture auth, login, logout, config, heuristics, support-check, analytics, and storage-proxy messages when present.
- Prefer schema-valid directions:
  - `content->background`
  - `background->content`
  - `ui->background`
  - `other`

## Gate 3: Workflow Coverage

If the code supports them, the final report should separately consider:

- installation or onboarding
- support-check or heuristics
- authentication
- analytics or telemetry
- A/B test or configuration fetch
- image processing or image search
- metadata extraction
- data-control or uninstall behavior
- external app or storage proxy behavior
- navigation monitoring behavior

Combine flows only when the code genuinely shares the same trigger and execution path.

The workflow section must remain a behavior-analysis section. Do not replace workflow extraction with privacy-only analysis.

Workflow extraction must be evidence-clustered, not just a short narrative summary:

- Create `OUT_DIR/census/workflow_candidates.csv` from reviewed endpoints, message channels, storage keys, components, permissions, listeners, and triggers.
- Create `OUT_DIR/census/workflow_candidate_review.csv` classifying each candidate as `confirmed_workflow`, `likely_workflow`, `merged_workflow`, `rejected_candidate`, or `uncertain_candidate`.
- Final `workflows` may include only confirmed/likely workflows, plus merged behavior inside the named target workflow.
- If final workflows are materially fewer than confirmed/likely workflow candidates, create `OUT_DIR/census/workflow_promotion_audit.md` with exact merge/rejection reasons.
- Run `node tools/workflow_review_linter.js OUT_DIR` after final `extension_summary.json`. A linter failure is a quality-gate failure.

For large bundled extensions, a small workflow list is acceptable only when `workflow_candidate_review.csv` and, if needed, `workflow_promotion_audit.md` explain which candidates were duplicates, merged, rejected, or uncertain. Do not force a workflow count; require reviewed coverage instead.

## Gate 4: Evidence Discipline

- Final evidence must cite extension source files, not generated notes. For normal structural claims, prefer original files. For privacy/risk/policy claims in minified JavaScript, cite beautified file/line ranges for readability and preserve original source traceability in review artifacts.
- Prefer workspace-relative paths such as `extension/background.js`.
- Use narrow line ranges whenever possible.
- If a claim is based on multiple files, cite each relevant source file directly.

## Gate 5: Background and Content Coverage

- Ensure important background handlers appear in `components`, `messaging`, or `workflows`.
- Ensure major content-script capabilities such as DOM extraction, UI injection, metadata parsing, and iframe communication appear in `components` or `workflows`.
- **Absolute API Forensic Completeness**: Grouping or summarizing Chrome APIs into overall families (like writing just `chrome.cookies` or `chrome.permissions` to cover all actions) is strictly prohibited. You must individually list every discovered specific API method (e.g. `chrome.cookies.onChanged.addListener`, `chrome.permissions.request`) to guarantee complete forensic depth. For any file exceeding 10,000 lines of code, write a script to compile this exhaustive list.
- Do not over-focus on one file at the expense of the rest of the extension.

## Gate 6: Endpoint Hygiene

- Capture every discovered literal endpoint in `endpoints.csv`; do not collapse literal URLs into one inferred family during extraction.
- Preserve explicit `http://`, `https://`, `ws://`, `wss://`, API base URLs, redirect URLs, iframe/script URLs, analytics URLs, uninstall URLs, onboarding URLs, config URLs, support-check APIs, heuristics APIs, auth APIs, telemetry APIs, and route/path constants when evidence supports them.
- Final `network.endpoints` may normalize obvious exact duplicates, but it must not erase distinct literal endpoints or hide evidence behind a broad family such as `https://api.example.com/*`.
- Distinguish `literal`, `relative_route`, `synthesized_candidate`, and `dynamic_family` in notes when confidence differs.
- If endpoint counts look much lower than the literal URL/route census, re-scan before final synthesis.

## Gate 6A: Census Coverage For Endpoints, Messages, And Storage

- Run `node tools/source_chunk_inventory.js ./extension OUT_DIR` after inventory and before chunk review whenever JavaScript/HTML source files are available.
- Confirm `OUT_DIR/census/source_file_inventory.csv` and `OUT_DIR/census/source_chunks.csv` exist before Step 2 chunk reading continues.
- Every non-skipped row in `source_chunks.csv` must be covered by automated extraction, or a blocker/skip reason must be recorded in `scan_log.txt`.
- Run `node tools/high_signal_chunks.js ./extension OUT_DIR` after source inventory and automated extraction to create `OUT_DIR/census/high_signal_chunks.csv`.
- Every row in `high_signal_chunks.csv` with `manual_review_required = yes` must have a matching row in `OUT_DIR/census/high_signal_chunk_review.csv` by file and line range.
- Do not generate `high_signal_chunk_review.csv` as a fake coverage artifact. Helper scripts may prefill file/range/signal columns, but `manual_summary`, `privacy_data_found`, `risk_candidates_found`, `exact_anchors`, and `decision` must come from actual manual inspection of the chunk.
- Chunk findings must be reconciled with census findings. A risk/privacy-relevant signal found in chunk review must either be promoted into the relevant CSV/review table or explicitly rejected/left uncertain with a reason.
- Run `node tools/census_extractor.js ./extension OUT_DIR` immediately after Step 2 and before Step 4 whenever JavaScript/HTML source files are available.
- Immediately run `node tools/census_promoter.js OUT_DIR` after the extractor.
- Confirm these files exist before Step 4: `OUT_DIR/census/endpoints_candidates.csv`, `OUT_DIR/census/message_candidates.csv`, `OUT_DIR/census/storage_candidates.csv`, `OUT_DIR/census/promoted_endpoints.csv`, `OUT_DIR/census/promoted_messages.csv`, `OUT_DIR/census/promoted_storage_keys.csv`, `OUT_DIR/census/excluded_endpoints.csv`, `OUT_DIR/census/excluded_messages.csv`, `OUT_DIR/census/excluded_storage_keys.csv`, `OUT_DIR/census/message_candidate_review.csv`, `OUT_DIR/census/storage_candidate_review.csv`, and `OUT_DIR/census/promotion_summary.json`.
- Compare `OUT_DIR/endpoints.csv` and final `network.endpoints` against `promoted_endpoints.csv`, not raw `endpoints_candidates.csv`; if promoted candidates are excluded, record why before Step 6 risk/privacy analysis.
- Compare `OUT_DIR/messages.csv` and final `messaging.channels` against `message_candidate_review.csv`; do not mark messaging complete when promoted custom RPC/event bus candidates were not adjudicated before Step 6.
- Compare `OUT_DIR/storage_keys.csv` and final `storage.keys` against `storage_candidate_review.csv`; do not mark storage complete when promoted wrapper/cache/indexedDB/cookie candidates were not adjudicated before Step 6.
- Raw candidate rows are not automatically final findings. They are a mandatory review queue. Promote supported candidates with original source evidence and reject unsupported ones in the generated `excluded_*.csv` audit files.
- If promoted table counts remain far below census counts, document whether the gap is caused by false positives, dynamic-only construction, unreachable code, unsupported schema directions, or an actual analysis limitation before writing privacy and risks.
- For messages specifically, `promoted_messages.csv` is not enough for final JSON. The model must classify each promoted message row as `confirmed_message_channel`, `likely_message_channel`, `rejected_candidate`, or `uncertain_candidate` in `message_candidate_review.csv`.
- Final `messaging.channels` may include only `confirmed_message_channel` and `likely_message_channel` rows. It must not include generic DOM events, Promise/internal labels, HTTP methods, URLs, domains, routes, package names, CSS selectors, static asset names, human-readable log/error strings, generic object fields, or implementation/class names.
- Confirmed/likely message channels must be used to map sender/handler direction and checked during workflow, privacy, and risk analysis. Rejected/uncertain message candidates must not be used to invent workflows, privacy flows, or risks.
- Run `node tools/message_review_linter.js OUT_DIR` after writing `extension_summary.json`. A linter failure is a quality-gate failure: fix message adjudication and final `messaging.channels` before validation is accepted.
- If `messaging.channels` contains template artifacts (`${...}`), metric labels, human-readable error/UI text, MIME types, version strings, DOM mutation options, or generic names like `general`/`disconnect` without proven sender-handler context, the run fails this gate.
- For storage specifically, `promoted_storage_keys.csv` is not enough for final JSON. The model must classify each promoted storage row as `confirmed_storage_key`, `likely_storage_key`, `rejected_candidate`, or `uncertain_candidate` in `storage_candidate_review.csv`.
- Final `storage.keys` may include only `confirmed_storage_key` and `likely_storage_key` rows. It must not include class names, schema fields, UI constants, event/error labels, namespace prefixes, domains, URLs, file names, or callback strings captured by accident.
- Sensitive-looking confirmed/likely storage keys must be checked during privacy and risk analysis. Rejected/uncertain storage candidates must not be used to invent privacy flows or storage risks.


## Gate 6B: Final JSON Promotion, Not Top-N Summary

- Final `network.endpoints` must be built from the promoted census-reviewed CSV table. Final `messaging.channels` must be built from the message-adjudicated review table. Final `storage.keys` must be built from the storage-adjudicated review table, not raw candidates and not unreviewed `promoted_messages.csv`/`promoted_storage_keys.csv`.
- Do not cap these final arrays at 10, 15, 20, or any other arbitrary top-N count.
- If `OUT_DIR/endpoints.csv`, `OUT_DIR/messages.csv`, or adjudicated `OUT_DIR/storage_keys.csv` has many supported rows, the corresponding final JSON arrays should also be large unless rows are exact duplicates or explicitly rejected.
- When final counts are materially lower than reviewed promoted CSV counts, create `OUT_DIR/census/final_promotion_audit.md` explaining the difference before validation.
- A final JSON with materially smaller endpoint/message/storage arrays is a failure when the reviewed CSV tables contain substantially more supported rows and no exclusion audit exists.

## Gate 6C: Semantic Architecture Coverage

- Create `OUT_DIR/census/semantic_architecture_review.csv` after Step 3 reconciliation and before Step 4 components, Step 5 workflows, or Step 6 privacy/risk analysis.
- The semantic review must examine the manually reviewed high-signal chunks and reviewed census tables for architecture-level behaviors, not only literal strings. Required families include text capture, auth/token handling, telemetry/tracking, storage persistence, remote config, messaging/RPC, privacy sanitization, native/external bridges, AI/model features, and security-sensitive dynamic behavior.
- `analysis_notes.md`, `outline.jsonl`, and `high_signal_chunk_review.csv` must show real work for the high-signal chunk queue. Missing high-signal manual coverage is a quality-gate failure unless `scan_log.txt` documents a real source availability blocker.
- Semantic findings may be discovered from `analysis_notes.md` or `outline.jsonl`, but final evidence must be traced back to original source files and narrow line ranges.
- Workflows, privacy, and risks must use `semantic_architecture_review.csv` together with reviewed endpoints/messages/storage. Do not base privacy/risk only on promoted CSV rows or only on a short narrative summary.
- Every semantic architecture row with a non-empty `risk_impact` must be represented in `risk_candidate_review.csv` as confirmed, likely, mitigated low, merged, rejected, or uncertain. A risk signal may be rejected, but it must not disappear silently.
- Run `node tools/semantic_coverage_linter.js OUT_DIR` after final `extension_summary.json`. A linter failure is a quality-gate failure: continue semantic chunk analysis and update the review before validation is accepted.

## Gate 7: Privacy Evidence Inventory

- `extension_summary.json` must include `observed_privacy_data.items`.
- The inventory must be populated from the same code-analysis pass used for components, messaging, storage, network, and workflows; do not re-read the entire extension only for privacy.
- Each privacy item that is stored, generated, processed, or transmitted must cite source-file evidence. Minified JavaScript evidence should cite the beautified file/line range in final output and preserve the original file/range/anchor in `privacy_risk_evidence_review.csv`.
- Preserve concrete data flows instead of collapsing them into broad categories such as `user_activity`; keep broad categories only in the legacy `privacy.data_categories` summary.
- Use `"unknown"` rather than guessing storage retention, consent, recipients, payload fields, or purpose.
- Confirm that adding privacy detail did not reduce coverage of workflows, messaging channels, endpoints, storage keys, or risks.

## Gate 8: Risk Preservation

- The `risks` section must be generated independently from the privacy detail section.
- Do not treat `observed_privacy_data` as a substitute for `risks`.
- Consider tracking, fingerprinting, PII exfiltration, excessive permissions, remote code/config behavior, insecure storage, policy violations, and other concrete risks when supported by evidence.
- Each risk must include type, severity, justification, and source-file evidence. Minified JavaScript evidence should cite the beautified file/line range in final output and preserve the original file/range/anchor in `privacy_risk_evidence_review.csv`.
- If fewer risks are reported than the evidence suggests, document why in `analysis_notes.md`.

## Gate 8A: Privacy/Risk Evidence Review

- Before Step 7 final JSON synthesis, create `OUT_DIR/census/privacy_signal_matrix.csv` from source chunk findings, reviewed endpoints, adjudicated messages, adjudicated storage keys, semantic architecture findings, workflow candidates, permissions, CSP, content-script page access, telemetry, auth/account behavior, config/treatment behavior, UI state, external bridges, and storage/cookie behavior.
- Create `OUT_DIR/census/privacy_candidate_review.csv` and classify each candidate as `confirmed_privacy_flow`, `likely_privacy_flow`, `merged_privacy_flow`, `rejected_candidate`, or `uncertain_candidate`.
- Create `OUT_DIR/census/risk_candidate_review.csv` and classify each candidate as `confirmed_risk`, `likely_risk`, `mitigated_low_risk`, `merged_risk`, `rejected_candidate`, or `uncertain_candidate`.
- Create `OUT_DIR/census/privacy_risk_evidence_review.csv` and confirm the narrowest evidence range for every final privacy item and risk.
- Final `observed_privacy_data.items` may include only confirmed/likely privacy flows plus documented merges. Rejected/uncertain candidates must not be used to invent privacy findings.
- Final `risks` may include confirmed, likely, and mitigated low risks plus documented merges. Rejected/uncertain candidates must not be used to inflate risk findings.
- Every major privacy item must be checked for corresponding risk impact. If no risk is supported, record the mitigating reason in `risk_candidate_review.csv`.
- Privacy/risk analysis must use the reviewed signal set. Do not base final privacy/risk only on `privacy.data_categories`, only on declared store privacy labels, or only on a short narrative workflow summary.
- Do not use fixed numeric minimums to force extra privacy items or risks. A small final set is acceptable only when the candidate reviews and audit explain why other semantic signals were rejected, merged, or uncertain.
- Use `mitigated_low_risk` instead of `rejected_candidate` when the behavior is real and privacy/security-relevant but mitigated, optional, user-triggered, encrypted, local-only, or not proven harmful. These rows should remain visible in final `risks` with low severity.
- Unsupported policy/compliance claims such as â€œfully compliantâ€ are forbidden unless directly evidenced. Use `"unknown"` when compliance cannot be determined from code.
- Final privacy/risk evidence ranges wider than 80 lines are a failure unless `privacy_risk_evidence_review.csv` justifies them and `census/privacy_risk_audit.md` explains why narrower evidence was not possible.
- Final privacy/risk evidence must not cite huge minified original JavaScript as bare `1-1`, `1-2`, or `2-2`. Beautify the evidence-bearing file and cite the beautified line range in final JSON.
- The anchor, matched snippet, offset, or context in `privacy_risk_evidence_review.csv` must be traceable to the original source file. If the final evidence cites a beautified file, the review row must preserve the original file/range and the original anchor.
- Every final privacy item and risk that cites JavaScript evidence must be backed by a matching manually reviewed high-signal chunk unless `privacy_risk_audit.md` explains a genuine low-signal exception. For final evidence that cites a `*.beautified.js` readability copy, high-signal coverage is matched through `original_evidence_file`, `original_start`, and `original_end`; do not change anchors just to satisfy path matching.
- `privacy_risk_audit.md` is not an override for mismatched counts. Final privacy/risk arrays must not contain more standalone entries than the confirmed/likely review rows.
- Any summary-generation script must compile from reviewed artifacts and must not hardcode extension-specific privacy items or risks.
- Run `node tools/privacy_risk_linter.js OUT_DIR` after final `extension_summary.json`. A linter failure is a quality-gate failure unless `OUT_DIR/census/privacy_risk_audit.md` explains a genuine low-signal result.
- Run `node tools/high_signal_review_linter.js OUT_DIR ./extension` after final `extension_summary.json`. A linter failure is a quality-gate failure: fix high-signal manual review coverage, final evidence files, or mismatched anchors before validation is accepted.

## Gate 9: Original Workflow Parity

- The OpenCode workflow must preserve the core analysis stages: beautification, inventory, parsing/chunking, intermediate tables, components/flows, core workflows, privacy/security/compliance, final JSON, and validation.
- Do not shorten a stage so much that required extraction details disappear.
- Privacy additions are allowed only as additive requirements inside the existing scan and synthesis path.

## Gate 10: Appended Privacy Suite

- Do not stop after Step 7 when the user supplied a Chrome Web Store extension ID and the privacy-suite inputs are available.
- Step 8 must read and follow `prompt2.md`, run `fetch_privacy.py <extension_id>`, and produce `privacy_workspace/declared_privacy.json` when extraction succeeds.
- If Step 8 retrieves an external privacy policy with non-empty text, run `node tools/extract_external_policy_claims.js ./privacy_workspace` before Prompt 4/5 comparisons and produce `privacy_workspace/external_policy_claims.json`.
- If `external_policy_claims.json` exists, create `privacy_workspace/external_policy_claims_review.json` by LLM adjudication before Prompt 4/5 comparisons. Run `node tools/external_policy_claim_review_linter.js ./privacy_workspace`.
- If `fetch_privacy.py` fails, do not invent Chrome Web Store declarations; document the blocker and stop downstream privacy-suite comparisons.
- Step 9 must read and follow `prompt3.md` and produce `privacy_workspace/privacy_comparison.json` from `declared_privacy.json` and `privacy_workspace/extension_summary.json`.
- Step 10 must read and follow `prompt4.md` and create `privacy_workspace/external_privacy_comparison.json` only when an external privacy policy exists. When `external_policy_claims_review.json` exists, it is the primary source for external-policy categories and claim evidence.
- Step 11 must read and follow `prompt5.md` and create `privacy_workspace/internal_external_privacy_comparison.json` only when Step 10 produced the external-policy comparison. When `external_policy_claims_review.json` exists, it is the primary source for external-policy categories and claim evidence.
- Prompt3 and Prompt4 must use `observed_privacy_data.items` as the primary observed-behavior source when present, with legacy fields only as fallback.
- Prompt3-5 are comparison-only stages; they must not re-scan source files or rewrite the main evidence basis.
- If no extension ID is supplied, the main reverse-engineering run can still pass, but Step 8-11 must be skipped or blocked with a clear note in `scan_log.txt`.
- Privacy-suite outputs must not overwrite, shrink, or remove `network`, `messaging`, `storage`, `workflows`, `privacy`, `observed_privacy_data`, or `risks` from `extension_summary.json`.

## Gate 11: Manifest and Coverage Self-Audit

- Compare final `metadata`, `permissions`, `components`, and entrypoints directly against `manifest.json` before completion.
- If `manifest.json` declares `host_permissions`, final `permissions.host_permissions` must not be empty unless a blocker is explicitly documented.
- Preserve `oauth2.scopes`, `externally_connectable`, `content_security_policy`, and `declarativeNetRequest` when present.
- Every manifest-declared background script, service worker, content script, popup/options/sidepanel/devtools page, and web-accessible resource must appear in `components` or be documented as unanalyzed.
- Do not confuse content-script `matches` with `host_permissions`; keep both concepts distinct.

## Gate 12: Content-Script Depth

- Large content scripts must be rescanned if their final API/listener inventory looks suspiciously small.
- For each large content script, explicitly look for DOM access, metadata extraction, selectors, iframe creation, `window.postMessage`, runtime messaging, storage access, URL/location access, observers, user-event handlers, and navigation handling.
- If a large content script still has sparse findings after rescan, record the limitation in `analysis_notes.md` and `scan_log.txt`.
- Do not mark messaging complete until both senders and handlers are mapped for discoverable content-script channels.

## Gate 13: Evidence and Risk Precision

- Avoid final evidence ranges larger than 150 lines when a narrower range can support the claim.
- Whole-file evidence is acceptable only for file-level claims or as a documented fallback with narrower supporting evidence where possible.
- Do not cite generated notes or CSV files as final evidence for behavioral claims. Beautified source copies may be cited only for privacy/risk/policy evidence in minified JavaScript when original source traceability is preserved.
- Use `remote_code` only for behavior where remote data can execute code, load executable scripts, inject active remote content, or alter executable logic in a security-significant way.
- Use `policy_violation` only when the evidence supports a concrete platform/user-control concern; if user intent is clear or the issue is speculative, lower severity or move it to `other` or notes.
- Do not describe OAuth scopes or broad permissions as confirmed data exfiltration unless source evidence shows actual collection or transmission.

## Gate 14: Chrome Web Store Policy Compliance

- The policy-compliance layer must use `docs/policies/chrome_webstore_program_policies.json` and `docs/policies/policy_signal_mapping.json`.
- The structured policy JSON must remain comprehensive enough to cover the Chrome Web Store Program Policies page, including privacy, limited use, permissions, disclosure, handling, malicious products, misleading behavior, ads, affiliate behavior, listing accuracy, single purpose, spam, technical requirements, MV3 remote logic, and enforcement context.
- Create `OUT_DIR/census/critical_mechanisms.csv` before `policy_compliance_report.json`.
- Critical mechanisms must connect observed extension behavior to specific policy clause IDs. Do not mark a mechanism critical only because it sounds suspicious.
- Critical mechanisms must preserve traceability to original findings through `derived_from_findings`. A row that cannot identify the privacy item, risk, workflow, endpoint, message, storage key, permission, semantic review row, or privacy-suite comparison finding it came from is not ready for final policy analysis.
- `policy_compliance_report.json` must cite exact policy clause IDs that exist in the structured policy JSON.
- A policy finding must include observed behavior, source finding references, source evidence, breach argument, confidence, and missing information.
- Do not turn every technical risk into a confirmed policy breach. A risk can produce `possible_breach`, `compliance_concern`, or `not_enough_evidence` when disclosure, consent, store listing, or external policy evidence is missing.
- Use `confirmed_breach` only when both behavior evidence and disclosure/declaration/policy evidence prove a concrete conflict.
- A direct mismatch between declared no-data/no-category/no-collection claims and confirmed observed privacy data is a concrete disclosure conflict. It should be reported as `confirmed_breach` when both sides are evidenced.
- If `declared_privacy.json`, `privacy_comparison.json`, external privacy policy data, or store listing data is unavailable, the report must explicitly say what cannot be determined.
- Avoid absolute compliance/downplaying language such as "fully compliant", "fully conforms", "this is compliant", "not a breach", or "supports compliance" unless the report has code evidence and disclosure/declaration/policy evidence for every relevant clause and there is no contradictory observed privacy data.
- Add a short top-level `policy_compliance` object to `extension_summary.json` pointing to `policy_compliance_report.json`; do not overwrite `privacy.policy_compliance`.
- Run `node tools/policy_compliance_linter.js OUT_DIR` after writing `policy_compliance_report.json` and updating `extension_summary.json`.
- A policy-compliance linter failure is a quality-gate failure unless a real missing-input blocker is documented in `scan_log.txt`.


