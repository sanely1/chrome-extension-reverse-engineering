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

## Gate 4: Evidence Discipline

- Final evidence must cite original source files, not generated notes.
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
- A final JSON with tiny arrays such as 15 endpoints, 15 messages, and 15 storage keys is a failure when the reviewed CSV tables contain hundreds or dozens of supported rows and no exclusion audit exists.
## Gate 7: Privacy Evidence Inventory

- `extension_summary.json` must include `observed_privacy_data.items`.
- The inventory must be populated from the same code-analysis pass used for components, messaging, storage, network, and workflows; do not re-read the entire extension only for privacy.
- Each privacy item that is stored, generated, processed, or transmitted must cite original source-file evidence.
- Preserve concrete data flows instead of collapsing them into broad categories such as `user_activity`; keep broad categories only in the legacy `privacy.data_categories` summary.
- Use `"unknown"` rather than guessing storage retention, consent, recipients, payload fields, or purpose.
- Confirm that adding privacy detail did not reduce coverage of workflows, messaging channels, endpoints, storage keys, or risks.

## Gate 8: Risk Preservation

- The `risks` section must be generated independently from the privacy detail section.
- Do not treat `observed_privacy_data` as a substitute for `risks`.
- Consider tracking, fingerprinting, PII exfiltration, excessive permissions, remote code/config behavior, insecure storage, policy violations, and other concrete risks when supported by evidence.
- Each risk must include type, severity, justification, and original source-file evidence.
- If fewer risks are reported than the evidence suggests, document why in `analysis_notes.md`.

## Gate 9: Original Workflow Parity

- The migrated OpenCode workflow must preserve the original prompt's main stages: beautification, inventory, parsing/chunking, intermediate tables, components/flows, core workflows, privacy/security/compliance, final JSON, and validation.
- Do not shorten a stage so much that required extraction details disappear.
- Privacy additions are allowed only as additive requirements inside the existing scan and synthesis path.

## Gate 10: Appended Privacy Suite

- Do not stop after Step 7 when the user supplied a Chrome Web Store extension ID and the privacy-suite inputs are available.
- Step 8 must read and follow `prompt2.md`, run `fetch_privacy.py <extension_id>`, and produce `privacy_workspace/declared_privacy.json` when extraction succeeds.
- If `fetch_privacy.py` fails, do not invent Chrome Web Store declarations; document the blocker and stop downstream privacy-suite comparisons.
- Step 9 must read and follow `prompt3.md` and produce `privacy_workspace/privacy_comparison.json` from `declared_privacy.json` and `privacy_workspace/extension_summary.json`.
- Step 10 must read and follow `prompt4.md` and create `privacy_workspace/external_privacy_comparison.json` only when an external privacy policy exists.
- Step 11 must read and follow `prompt5.md` and create `privacy_workspace/internal_external_privacy_comparison.json` only when Step 10 produced the external-policy comparison.
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
- Do not cite generated artifacts, notes, CSV files, or beautified paths as final evidence for behavioral claims.
- Use `remote_code` only for behavior where remote data can execute code, load executable scripts, inject active remote content, or alter executable logic in a security-significant way.
- Use `policy_violation` only when the evidence supports a concrete platform/user-control concern; if user intent is clear or the issue is speculative, lower severity or move it to `other` or notes.
- Do not describe OAuth scopes or broad permissions as confirmed data exfiltration unless source evidence shows actual collection or transmission.



