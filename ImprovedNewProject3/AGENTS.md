# Chrome Extension Reverse Engineering

## Source Of Truth

- `prompt.md` is the complete project specification.
- Read `prompt.md` before planning or running analysis.
- Follow the workflow, schemas, deliverables, filenames, logging rules, evidence rules, and validation rules defined in `prompt.md`.
- If any instruction in this file conflicts with `prompt.md`, follow `prompt.md`.

## Execution

- For a full run, execute the workflow in `prompt.md` from setup through final validation.
- Produce the exact deliverables requested in `prompt.md`.
- Keep the final output in the structured schema described in `prompt.md`.
- Do not replace required JSON, CSV, JSONL, PlantUML, log, or schema artifacts with prose-only summaries.
- Continue to the next step when the current step is complete unless there is a real blocker.

## Shell Compatibility

- `prompt.md` includes command examples.
- When an example command is shell-specific, use the equivalent command for the current shell while preserving the same file operation and output behavior.
- Append-only rules still apply even if the append syntax differs by shell.

## Evidence And Validation

- Evidence must point to extension source files, not beautified files or generated notes.
- Every non-trivial claim in `extension_summary.json` must include evidence as required by `prompt.md`.
- Validate `extension_summary.json` against the schema from `prompt.md`.
- If validation fails, fix the output or document the blocker in the required run artifacts.

## Final Normalization Rules

Before writing the final `extension_summary.json`, run a normalization pass over the collected findings.

- Use schema-valid values only. If a value is not allowed by the schema, normalize it or update the schema copy before validation.
- Keep `network.endpoints[].methods` and `network.endpoints[].headers` as arrays of strings, never scalar strings.
- Keep every `payload_schema` as an object. Use `{}` when the payload is unknown.
- Prefer runtime storage key values over constant names. For example, if `AUTH_KEY = "authKey"`, report `authKey`, not `AUTH_KEY`.
- Use `session` for `chrome.storage.session` and `sessionStorage` only when the active schema allows it. Include `retention: "session_only"` where appropriate.
- Do not put ordinary `JSON.parse`, `JSON.stringify`, `RegExp`, or `crypto.getRandomValues` in `code_signals.dynamic_code` unless the surrounding code uses them to execute or decode dynamic code.
- Reserve `dynamic_code` for `eval`, `new Function`, dynamic `import`, `importScripts`, suspicious decoder chains, and WebAssembly loading.

## Messaging Direction Rules

- Infer message direction from send sites such as `chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`, `port.postMessage`, `window.postMessage`, and `event.source.postMessage`.
- Do not infer direction from a handler alone. A `chrome.runtime.onMessage.addListener` block in `background.js` usually means the background receives a message; it does not mean `background->ui`.
- Use handler evidence as supporting evidence only after at least one sender or caller has been mapped.
- Use the schema direction enum where applicable: `content->background`, `background->content`, `ui->background`, or `other`.
- For page, iframe, external app, new tab, and web app communication, use `direction: "other"` and make the route clear in the channel name, purpose, payload fields, and evidence.
- Do not include plain DOM clicks, `window.open`, or navigation events as messaging channels unless they carry message-like payloads. Capture them in workflows and code signals instead.

## Risk Calibration Rules

- Severity must be based on observed code behavior, not only hypothetical sensitive browsing contexts.
- Use `high` only when the code shows clear broad collection, sensitive data handling, remote transmission, or a concrete user-harm path.
- Use `medium` for plausible privacy or security concerns that depend on context, policy disclosure, or backend behavior not visible in the code.
- Use `low` for narrow, mostly local, or clearly user-initiated concerns.
- Do not label a finding `pii_exfiltration` unless the evidence shows personal data or sensitive tokens being transmitted externally. If the code only sends product/page metadata that may be sensitive in some contexts, prefer `tracking` or `other`.
- Do not label a finding `remote_code` unless remote content is executed as code or can directly control executed code. Remote configuration, iframe communication, and local script injection are usually `other`, `tracking`, or `policy_violation` unless code execution is shown.
- Phrase policy findings as potential compliance concerns unless the exact policy violation is directly evidenced.
