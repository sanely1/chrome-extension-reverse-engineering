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
- Do not over-focus on one file at the expense of the rest of the extension.

## Gate 6: Endpoint Hygiene

- Separate literal endpoints from inferred endpoint families.
- Avoid duplicating the same endpoint unless different code paths demonstrate distinct behavior.
- Include uninstall URLs, onboarding redirects, analytics calls, config endpoints, support-check APIs, and heuristics APIs when present.

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
