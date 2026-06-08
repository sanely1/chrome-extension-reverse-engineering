# Analysis Workflow

## Run Setup

1. Determine the active model name.
2. Determine the next run number by scanning existing `out_*` directories.
3. Create `OUT_DIR = ./out_<NNN>_<MODEL>`.
4. Initialize empty run artifacts such as `outline.jsonl`, `analysis_notes.md`, `scan_log.txt`, `beautify_map.json`, and `run_info.json`.

## Step 0: Beautify JavaScript

- If readable derived files are absent and local tooling is needed, install beautification tooling inside the workspace.
- Enumerate `.js` and `.mjs` files while excluding `node_modules`, `vendor`, `build`, `dist`, `coverage`, current `OUT_DIR`, and any path containing `beautified`.
- For each original source file, produce a side-by-side beautified artifact and record the mapping in `beautify_map.json`.
- Beautified files may be read for analysis, but all evidence must cite the original file and original line numbers.

## Step 1: Inventory

Parse `manifest.json` and extract:

- extension metadata
- manifest version
- background service worker or legacy background scripts
- content scripts and match patterns
- web-accessible resources
- permissions, host permissions, and optional permissions
- externally connectable settings
- declarativeNetRequest details when present

Inventory rules:

- Prefer direct manifest values over inference.
- If `optional_permissions` is absent, emit an empty array instead of `"unknown"`.
- Distinguish `permissions`, `host_permissions`, `optional_permissions`, and content-script match patterns; do not merge them casually.
- Record all declared background, content-script, popup, options, sidepanel, and web-accessible entrypoints as candidate analysis roots.

If `metadata.name` uses a locale reference such as `__MSG_*__`, resolve it through `_locales/<default_locale>/messages.json`, then fall back to another available locale if needed. Never guess the extension name.

Write `permissions_report.json` and begin `analysis_notes.md` with the manifest summary and evidence.

## Step 2: Parse and Extract

- Build the relevant source file list from manifest entries and discovered runtime injections.
- Use tolerant parsers first; if full parsing fails, retry with smaller ranges or regex scanning.
- Analyze one chunk at a time and stream results immediately.

For each chunk, extract with evidence:

- Chrome API calls
- event listeners
- messaging channels and likely direction
- storage operations and literal keys
- network endpoints and methods
- privacy observations for concrete data flows
- DOM interaction and sinks
- dynamic code behavior
- WebAssembly usage
- obfuscation hints
- risks

Privacy observation requirements:

- Collect privacy-relevant facts while analyzing the same chunks already required for code extraction; do not start a second privacy-only scan.
- Record concrete observed data flows, not only broad store-style categories. Examples include current URL or tab URL, page or DOM content, product metadata, images or image data, auth tokens, machine or user identifiers, analytics payload fields, browser/device info, language or locale, A/B test assignments, settings, and external storage access.
- For each observation, preserve what data is read or generated, where it comes from, what triggers it, whether it is stored, whether it is transmitted, recipient/endpoint/method/payload fields when visible, local processing, user control or consent signals, purpose observed, confidence, and source evidence.
- Use `"unknown"` for unclear fields instead of guessing. Keep Chrome Web Store-style categories only as a summary in `privacy.data_categories`; the detailed source of truth is `observed_privacy_data`.
- Append privacy observations into each relevant `outline.jsonl` chunk entry under `privacy_observations`.

Messaging extraction requirements:

- Enumerate both message senders and message handlers.
- For `chrome.runtime.onMessage` handlers, inspect every branch, switch case, and message-type constant that affects control flow.
- Recover message direction using the final schema enum vocabulary:
  - `content->background`
  - `background->content`
  - `ui->background`
  - `other`
- Include login, logout, auth propagation, analytics relay, config fetch, heuristic fetch, support-check, and session-storage proxy messages when present.
- Treat `window.postMessage` flows separately from Chrome runtime messaging and document page-to-content or iframe-to-parent direction in notes, while mapping final schema directions conservatively.

Network extraction requirements:

- Separate explicit literal endpoints from inferred or dynamic endpoint families.
- Do not duplicate the same endpoint solely because it appears in both sender and consumer code paths unless the entries convey distinct behavior.
- Identify uninstall URLs, onboarding redirects, analytics endpoints, config APIs, support-check APIs, and heuristic APIs as separate behaviors when present.

## Step 3: Intermediate Tables

As discoveries are made, append rows to:

- `endpoints.csv`
- `messages.csv`
- `storage_keys.csv`

Keep these tables synchronized with `outline.jsonl` and `analysis_notes.md`.

## Step 4: Components and Flows

Classify files into components such as:

- background
- content scripts
- injected scripts
- UI
- page-facing scripts
- remote services

Generate `flows.puml` to capture the major communication paths among components, storage, and remote services.

## Step 5: Workflows

Cluster related operations into high-level workflows using:

- message channels
- endpoint families
- storage cycles
- alarms or timers
- UI entry points

Describe each workflow with triggers, ordered steps, APIs, messages, endpoints, storage keys, and evidence.

Workflow coverage requirements:

- Keep installation/onboarding, support-check, auth, analytics, A/B config, image-processing, metadata extraction, and data-control or uninstall flows separate when the code supports that distinction.
- Do not omit a workflow simply because it is partially represented through messaging; promote it when the behavior spans multiple files or has user-facing consequences.
- If a workflow uses both message passing and network calls, include both in the same workflow entry.

## Step 6: Privacy, Security, and Compliance

Infer and document:

- data categories
- purposes
- minimization concerns
- consent signals or absence of consent
- retention behavior
- third parties
- policy and compliance concerns
- concrete risks with severity and justification

Also aggregate all per-chunk `privacy_observations` into `observed_privacy_data.items` in `extension_summary.json`.

Aggregation rules:

- Keep entries atomic enough to preserve distinct flows, such as URL support checks, persistent IDs, auth storage, analytics events, page/product metadata extraction, image processing, configuration or A/B storage, and settings access.
- Merge duplicates only when they describe the same data, trigger, storage, and transmission path.
- Every stored, generated, processed, or transmitted privacy item must have direct evidence from original source files.
- Do not let the new privacy inventory replace or weaken `network`, `messaging`, `storage`, `workflows`, `privacy`, or `risks`.
- Treat `privacy.data_categories` as a backward-compatible summary; use `observed_privacy_data.items` for the detailed evidence-first inventory.

## Step 7: Final JSON and Validation

- Populate `extension_summary.json` from the aggregated evidence.
- Copy the schema file into `OUT_DIR/schema.chrome_extension_behavior.json`.
- Copy the final summary to `privacy_workspace/extension_summary.json`.
- Validate the final JSON against `schema.chrome_extension_behavior.json`.
- Write `run_info.json` and finalize `scan_log.txt`.

Before finalizing, confirm:

- every messaging channel direction matches schema enums
- `observed_privacy_data.items` exists and has evidence-backed entries when the code observes privacy-relevant data
- privacy and risk evidence cite original source files
- important background handlers are represented in either messaging or workflows
- important content-script behaviors are represented in either components or workflows
- no required manifest fields were replaced by guesses when the manifest is readable

## Fallback Rules

- Never stop the run solely because parsing failed for one file or chunk.
- Mark unresolved values as `"unknown"` instead of guessing.
- When exact payloads or URLs cannot be fully resolved, document the limits and keep the strongest evidence available.
