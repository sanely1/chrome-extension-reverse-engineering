You are executing a Chrome extension reverse-engineering run inside OpenCode.

Behavior requirements:

- Continue automatically from one successful step to the next.
- Do not pause for confirmation between routine workflow stages.
- Treat intermediate milestones as incomplete until all required artifacts are produced and validated.
- If a task is partially blocked, complete every unblocked deliverable before stopping.
- If you must make an assumption, choose the safest reasonable one, record it in the run artifacts, and keep going.
- Prefer forensic completeness over elegant summarization when the two conflict.
- Do not finish if message handlers, auth flows, analytics flows, or manifest-declared behaviors appear underrepresented in the final JSON.
- Capture concrete privacy observations during the normal chunk scan and aggregate them into `observed_privacy_data` without sacrificing existing workflow, messaging, network, storage, privacy, or risk coverage.
- Preserve the original workflow's functionality. The privacy enhancement is additive only; it must not replace risk analysis, workflow extraction, messaging extraction, storage extraction, endpoint extraction, or validation.
- During final synthesis, verify that `risks` is populated as its own section and that `observed_privacy_data` did not absorb or remove risk findings.
- Before finalizing, run the manifest and coverage self-audit from `workflow.md` and `quality-gates.md`.
- Immediately after Step 2 and before Step 4/5/6, run `node tools/census_extractor.js ./extension OUT_DIR` and review `OUT_DIR/census/endpoints_candidates.csv`, `OUT_DIR/census/message_candidates.csv`, and `OUT_DIR/census/storage_candidates.csv`.
- Do not start workflow clustering, privacy analysis, or risk analysis until high/medium-confidence census candidates have either been promoted into `endpoints.csv`, `messages.csv`, `storage_keys.csv`, or explicitly rejected in `analysis_notes.md`.
- Treat missing manifest-declared `host_permissions` in final JSON as a failure to fix, not as an acceptable empty value.
- If a large content script has only sparse APIs/listeners in the draft summary, rescan it for DOM, messaging, storage, URL, iframe, observer, navigation, and page-metadata behavior.
- Narrow final evidence ranges where possible. Do not leave whole-file or very broad evidence ranges unless they are unavoidable and documented.
- Type-check `remote_code` and `policy_violation` risks conservatively; do not use those labels for weak or speculative concerns.
- After Step 7 produces `extension_summary.json` and copies it to `privacy_workspace/extension_summary.json`, continue into the appended privacy suite when the user supplied a Chrome Web Store extension ID.
- For Step 8, read and follow `prompt2.md`, then run `fetch_privacy.py <extension_id>` to create `privacy_workspace/declared_privacy.json`.
- For Step 9, read and follow `prompt3.md` to create `privacy_workspace/privacy_comparison.json`.
- For Step 10, read and follow `prompt4.md` to create `privacy_workspace/external_privacy_comparison.json` only if an external privacy policy exists.
- For Step 11, read and follow `prompt5.md` to create `privacy_workspace/internal_external_privacy_comparison.json` only if the external-policy comparison exists.
- Do not stop after reverse engineering when the privacy-suite inputs are available.
- If no extension ID is supplied, record the Step 8-11 skip in `scan_log.txt` and keep the main reverse-engineering output valid.
- If `fetch_privacy.py` fails, do not invent declared privacy data; document the failure and stop downstream privacy-suite steps.
- Prompt3 and Prompt4 must use `observed_privacy_data.items` as the primary observed-behavior source when present, with older fields only as fallback.
- Prompt3-5 are comparison-only steps and must not re-scan extension source files.

Working style:

- Use the project `AGENTS.md` as the top-level rules file.
- Read referenced workflow or schema files only when needed for the current subtask.
- Prefer concise progress updates while you work, but keep momentum toward completion.
- Keep evidence precise and outputs schema-compliant.
- Run a final self-audit against the quality gates before declaring success.


