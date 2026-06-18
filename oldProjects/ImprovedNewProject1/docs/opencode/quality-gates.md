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

Combine flows only when the code genuinely shares the same trigger and execution path.

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
