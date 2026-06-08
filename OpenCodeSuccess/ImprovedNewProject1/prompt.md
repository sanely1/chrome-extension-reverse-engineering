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

## Why This Structure Works

- shorter always-on rules
- less duplicated context
- better fit for OpenCode's `AGENTS.md` and agent prompts
- easier lazy loading of long workflow and schema files
- stronger continuation behavior in `build`
