# OpenCode Runbook

This project uses project rules plus referenced workflow and schema files as the main control surface.

OpenCode should read:

1. `AGENTS.md` for always-on project rules
2. `docs/opencode/output-contract.md` for required deliverables and evidence rules
3. `docs/opencode/workflow.md` when it needs the step-by-step execution pipeline
4. `schema.chrome_extension_behavior.json` when producing or validating `extension_summary.json`

## How To Use In OpenCode

1. Open this project folder in OpenCode.
2. Let OpenCode load `AGENTS.md` automatically.
3. Start in `plan` if you want a dry analysis of what will happen.
4. Switch to `build` for the actual run that creates artifacts.
5. Ask for the reverse-engineering run in normal language; the project rules now define the workflow.
6. For the full appended privacy suite, include the Chrome Web Store extension ID in the start request.

The final `extension_summary.json` includes the normal behavior sections plus an additive `observed_privacy_data` section for concrete privacy-relevant data flows discovered during the same scan. This privacy addition must not replace the original workflow's risks, workflows, messaging, storage, network, or privacy summary.

Before the mechanical census, build mode must run `tools/source_chunk_inventory.js` to create `OUT_DIR/census/source_file_inventory.csv` and `OUT_DIR/census/source_chunks.csv`. These files define the runtime-relevant JavaScript files and exact automated coverage chunks. Immediately after that, run `tools/create_beautify_map.js OUT_DIR ./extension` for selective beautification of runtime-relevant files; do not beautify every JavaScript asset in the extension. Then run `tools/high_signal_chunks.js` to create `OUT_DIR/census/high_signal_chunks.csv`. Every high-signal row with `manual_review_required = yes` must be manually reviewed in `OUT_DIR/census/high_signal_chunk_review.csv`; low-signal chunks may remain automated-only unless they become evidence for final privacy/risk claims.

The workflow also includes a mechanical census extractor (`tools/census_extractor.js`) and a census promoter (`tools/census_promoter.js`) that run before final synthesis. The extractor creates broad candidate CSV files for endpoints, message channels, storage keys, and suspicious string constants; the promoter filters those raw candidates into promoted and excluded queues so large bundled extensions are neither undercounted nor filled with obvious package/docs/static noise. Census findings and chunk-review findings must be reconciled together; neither source replaces the other.

After census reconciliation, build mode must run the semantic architecture review before components, workflows, privacy, or risks. It creates `OUT_DIR/census/semantic_architecture_review.csv` and uses the reviewed source chunks for behavior families such as text capture, auth/token handling, telemetry/tracking, storage persistence, remote config, messaging/RPC, DLP/sanitization, native/external bridges, AI/model features, and security-sensitive dynamic behavior. This is the guardrail that prevents a shallow string scan from missing privacy and risk issues.

Privacy/risk review is signal-driven, not count-driven. Build mode must not add privacy items or risks just to satisfy a numeric threshold. Instead, every semantic architecture row with a non-empty `risk_impact` must be represented in `risk_candidate_review.csv` as confirmed, likely, mitigated low, merged, rejected, or uncertain. Use `mitigated_low_risk` for real evidence-backed concerns that should remain visible but are low severity because they are mitigated, optional, user-triggered, encrypted, local-only, or not proven harmful.

Messages have one additional review step: after promotion, build mode must create `OUT_DIR/census/message_candidate_review.csv` and classify every promoted message candidate as confirmed, likely, rejected, or uncertain. Final `messaging.channels`, workflows, privacy analysis, and risk analysis should use only confirmed/likely message rows, while rejected/uncertain rows stay in the audit trail. Build mode must also run `node tools/message_review_linter.js OUT_DIR` after writing `extension_summary.json` and fix obvious fake channels before finalizing.

Storage has one additional review step: after promotion, build mode must create `OUT_DIR/census/storage_candidate_review.csv` and classify every promoted storage candidate as confirmed, likely, rejected, or uncertain. Final `storage.keys`, privacy analysis, and risk analysis should use only confirmed/likely storage rows, while rejected/uncertain rows stay in the audit trail.

Workflows also have a review step: build mode must create `OUT_DIR/census/workflow_candidates.csv` from reviewed endpoints, messages, storage keys, components, permissions, listeners, and triggers, then create `OUT_DIR/census/workflow_candidate_review.csv`. Final workflows should come from confirmed/likely workflow candidates, with merges/rejections documented. Build mode must run `node tools/workflow_review_linter.js OUT_DIR` after writing `extension_summary.json` and fix under-clustered or category-missing workflows before finalizing.

Privacy and risks also have a review step: build mode must create `OUT_DIR/census/privacy_signal_matrix.csv`, `OUT_DIR/census/privacy_candidate_review.csv`, `OUT_DIR/census/risk_candidate_review.csv`, and `OUT_DIR/census/privacy_risk_evidence_review.csv` before final synthesis. Final `observed_privacy_data.items` and `risks` should come from confirmed/likely review rows, not from a generic three-item summary. Their evidence should cite the narrowest accurate readable source range, not broad ranges like `1-150` unless justified. For huge minified JavaScript, run `tools/create_beautify_map.js OUT_DIR ./extension` again after `privacy_risk_evidence_review.csv` exists, cite the beautified file/line range in final JSON, and preserve the original file/range/anchor in the evidence review row. Build mode must run `node tools/privacy_risk_linter.js OUT_DIR` and `node tools/high_signal_review_linter.js OUT_DIR ./extension` after writing `extension_summary.json` and fix missing review files, unsupported compliance claims, broad evidence, mismatched anchors, missing high-signal manual review, or underdeveloped privacy/risk output before finalizing.

Build mode must also run `node tools/semantic_coverage_linter.js OUT_DIR` after writing `extension_summary.json`. If `source_chunks.csv`, `high_signal_chunks.csv`, `high_signal_chunk_review.csv`, or `semantic_architecture_review.csv` are missing, the run is not complete; continue high-signal manual review or document a real blocker, then re-run validation.

When source is minified into one or two huge JavaScript lines, bare original evidence such as `line 2-2` is not enough for final privacy/risk claims. Beautify the evidence-bearing file, cite the beautified line range in final privacy/risk/policy evidence, and add the original file/range plus anchor, matched snippet, offset, or context in `privacy_risk_evidence_review.csv`.

After `extension_summary.json` is copied to `privacy_workspace/extension_summary.json`, build mode should continue with `prompt2.md`, `prompt3.md`, `prompt4.md`, and `prompt5.md` when an extension ID is available. If no extension ID is provided, the main reverse-engineering output is still valid and the privacy-suite skip should be recorded in `scan_log.txt`.

When Step 8 retrieves an external privacy policy with text, build mode should run `node tools/extract_external_policy_claims.js ./privacy_workspace` before Prompt 4 and Prompt 5. The output `privacy_workspace/external_policy_claims.json` is a deterministic draft candidate file. Build mode must then create `privacy_workspace/external_policy_claims_review.json` by LLM adjudication, run `node tools/external_policy_claim_review_linter.js ./privacy_workspace`, and use reviewed `final_claims[]` as the primary external-policy representation for Prompt 4 and Prompt 5. Raw `external_privacy_policy.privacy_text` remains a fallback.

After the privacy suite is handled, build mode should continue into Chrome Web Store policy analysis. It must read `docs/policies/chrome_webstore_program_policies.json` and `docs/policies/policy_signal_mapping.json`, create `OUT_DIR/census/critical_mechanisms.csv`, create `OUT_DIR/policy_compliance_report.json`, and add a short top-level `policy_compliance` pointer object to `extension_summary.json`. Critical mechanisms must preserve `derived_from_findings` references back to the original privacy items, risks, workflows, endpoints, messages, storage keys, permissions, semantic review rows, or privacy-suite comparison findings. Policy findings must cite concrete policy clause IDs and must not claim confirmed breaches unless code evidence plus disclosure/declaration/policy evidence proves the conflict.

Do not run a separate comparison between the external privacy policy and Google policy clauses. Reviewed external policy claims are kept for Prompt 4 and Prompt 5 privacy disclosure comparisons, not for a standalone external-policy-vs-Google-policy output.

## Why This Structure Works

- shorter always-on rules
- less duplicated context
- better fit for OpenCode's `AGENTS.md` and agent prompts
- easier lazy loading of long workflow and schema files
- stronger continuation behavior in `build`

