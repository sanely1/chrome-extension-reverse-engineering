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

The workflow also includes a mechanical census extractor (`tools/census_extractor.js`) and a census promoter (`tools/census_promoter.js`) that run before final synthesis. The extractor creates broad candidate CSV files for endpoints, message channels, storage keys, and suspicious string constants; the promoter filters those raw candidates into promoted and excluded queues so large bundled extensions are neither undercounted nor filled with obvious package/docs/static noise.

After `extension_summary.json` is copied to `privacy_workspace/extension_summary.json`, build mode should continue with `prompt2.md`, `prompt3.md`, `prompt4.md`, and `prompt5.md` when an extension ID is available. If no extension ID is provided, the main reverse-engineering output is still valid and the privacy-suite skip should be recorded in `scan_log.txt`.

## Why This Structure Works

- shorter always-on rules
- less duplicated context
- better fit for OpenCode's `AGENTS.md` and agent prompts
- easier lazy loading of long workflow and schema files
- stronger continuation behavior in `build`

