# Analysis Workflow

This workflow intentionally preserves the original prompt's seven-step structure. The privacy data-flow section is additive: it must not replace or weaken the original behavior analysis, workflow extraction, privacy summary, security/risk analysis, or validation steps.

## Run Setup

1. Determine the active model name.
2. Determine the next run number by scanning existing `out_*` directories.
3. Create `OUT_DIR = ./out_<NNN>_<MODEL>`.
4. Initialize empty run artifacts:
   - `outline.jsonl`
   - `analysis_notes.md`
   - `scan_log.txt`
   - `beautify_map.json`
   - `permissions_report.json`
   - `endpoints.csv`
   - `messages.csv`
   - `storage_keys.csv`
   - `flows.puml`
   - `run_info.json`

## Step 0: Beautify All JS

**Purpose**: Create readable versions of all JavaScript for analysis while preserving original file references.

1. Install beautification tooling locally only if needed and only inside the workspace.
2. Enumerate all `.js` and `.mjs` files in the workspace, excluding:
   - `node_modules/`, `vendor/`, `build/`, `dist/`, `coverage/`
   - any path under current `OUT_DIR`
   - any path already containing `"beautified"`
3. Treat beautification as one setup batch. Do not stop or ask the user to continue after individual files.
4. For each original file `foo.js`, create a side-by-side `foo.beautified.js` when feasible. Do the same for `.mjs`.
5. Record mapping in `OUT_DIR/beautify_map.json`:

```json
[
  {"original": "serviceWorker.js", "beautified": "serviceWorker.beautified.js", "status": "ok"},
  {"original": "content.js", "beautified": "content.beautified.js", "status": "error: parse failed"}
]
```

6. You may read beautified files for parsing, but final evidence must always cite original file paths and original line ranges.
7. If a large file such as `content.js` cannot be fully beautified, document the fallback and continue with tolerant parsing, regex extraction, and chunked reading. Do not pause unless a real permission or filesystem blocker occurs.

## Step 1: Inventory

**Purpose**: Extract basic metadata, permissions, and entrypoints from `manifest.json`.

1. Parse `manifest.json` and extract:
   - `name`, `version`, `manifest_version`
   - `description`
   - `default_locale`
   - `background.service_worker` for MV3 or `background.scripts` for MV2
   - `content_scripts` with files, CSS, matches, `run_at`, and `all_frames`
   - `action`, `browser_action`, `page_action`, popup, options page, side panel, and devtools pages
   - `web_accessible_resources`
   - `permissions`, `host_permissions`, `optional_permissions`
   - `oauth2` scopes if present
   - `externally_connectable`
   - `content_security_policy`
   - `declarativeNetRequest` rules if present

### Locale Resolution For Extension Name

If `metadata.name` in `manifest.json` contains a localization reference such as:

```json
"name": "__MSG_Honey_Title__"
```

then:

1. Extract the key: `__MSG_Honey_Title__` -> `Honey_Title`.
2. Check for `default_locale` in `manifest.json`.
3. Attempt to resolve from `_locales/<default_locale>/messages.json`.
4. If not found, fall back to any available locale in `_locales/`.
5. Extract `messages[key].message`.
6. If still not found, set `"name": "unknown"`.

Strict rules:

- Never guess or hallucinate the extension name.
- Only use manifest or locale files.
- If `optional_permissions` is absent, emit an empty array instead of `"unknown"`.
- Distinguish `permissions`, `host_permissions`, `optional_permissions`, and content-script match patterns; do not merge them casually.

2. Write `OUT_DIR/permissions_report.json` with permissions and direct evidence.
3. Begin `OUT_DIR/analysis_notes.md` with manifest summary and evidence.
4. Record all declared background, content-script, popup, options, sidepanel, devtools, and web-accessible entrypoints as candidate analysis roots.

## Step 2: Parsing/AST Scan With Chunking

**Purpose**: Extract all Chrome API calls, event listeners, messaging, storage, network, DOM behavior, dynamic code, workflows signals, privacy observations, and risks from all source files.

### 2.1 Install Parsers

Use available local parsers if present. If needed, install parser tooling locally inside the workspace, for example:

```bash
npm i espree @typescript-eslint/typescript-estree acorn acorn-walk
```

If parser installation is unavailable, continue with tolerant parsing and regex extraction. Document the fallback in `analysis_notes.md` and `scan_log.txt`.

### 2.2 Identify Source Files

Build a list of all JavaScript sources relevant to the extension:

- service worker or background scripts from manifest
- content scripts from manifest
- scripts loaded via `chrome.scripting.executeScript`
- scripts loaded via `importScripts()`
- dynamically injected scripts
- web-accessible scripts used by content scripts or pages
- UI files for popup, options, sidepanel, devtools, and data-control pages
- any dynamically imported scripts

Exclude any path containing `"beautified"` from being counted as an original source file.

### 2.3 Chunk Each File

For each source file:

- If file is at or below 2000 lines, treat it as one chunk with `chunk.id = "whole-file"`, `start_line = 1`, and `end_line = <last line>`.
- If file is over 2000 lines, split into contiguous chunks such as `[1-2000]`, `[2001-4000]`, etc.
- Try to keep function bodies intact.
- If a single function exceeds the chunk size, subdivide it and set `same_function_group` to a stable identifier such as function name or hash.

### 2.4 Parse And Extract

For each chunk:

1. Build AST using tolerant parsing.
2. If full AST fails, retry logical subranges.
3. If AST completely fails, fall back to regex scanning.
4. Note any fallback in `analysis_notes.md`.

Extract with original-file evidence:

- **Chrome API calls**: `chrome.tabs.query`, `chrome.storage.local.get`, `chrome.runtime.sendMessage`, etc.
- **Event listeners**: `runtime.onMessage.addListener`, `tabs.onUpdated.addListener`, `window.addEventListener`, `document.addEventListener`, etc.
- **Messaging**: `runtime.sendMessage`, `tabs.sendMessage`, `runtime.connect`, `window.postMessage`; capture channel names, direction, sender, handler, and payload literal keys.
- **Storage**: `chrome.storage.[local|sync|managed|session]`, `localStorage`, `sessionStorage`, IndexedDB, cookies; capture literal keys, operation, and inferred purpose.
- **Network**: `fetch()`, `XMLHttpRequest`, `navigator.sendBeacon()`, WebSocket URLs, iframe `src`, redirect URLs, and template-string endpoint families.
- **DOM and sinks**: `querySelector*`, `addEventListener`, `MutationObserver`, `ResizeObserver`, `innerHTML`, `document.write`, iframe/script insertion, CSS injection.
- **Dynamic code**: `eval()`, `new Function()`, dynamic `import()`, `importScripts()`, `atob()`, decoders, string-built code.
- **WebAssembly**: `WebAssembly.instantiate*`, `.wasm` references, ArrayBuffer sources.
- **Obfuscation hints**: string tables, switch-based flattening, dead code, minified variables, webpack or bundler patterns.
- **Risks**: concrete risk candidates with type, severity, description/justification, and evidence.
- **Privacy observations**: concrete privacy-relevant data flows observed in the same chunk.

### 2.5 Privacy Observations During Chunk Scan

This is the additive privacy enhancement. Collect these while doing the normal Step 2 scan; do not run a second privacy-only pass.

Record concrete observed data flows, not only broad store-style categories. Examples include:

- current URL, tab URL, referrer, browsing/navigation events
- page content, DOM content, form fields, page metadata, product metadata
- image URL, image bytes, base64 image data
- auth tokens, auth keys, session identifiers
- machine ID, user ID, distinct ID, install ID
- analytics event names and payload fields
- browser/device info, user agent, OS/browser inference
- language, locale, timezone, region, UI settings
- A/B test assignment and experiment records
- extension settings and storage proxy access
- external app access to extension storage

For each privacy observation, preserve:

- what data is read, generated, stored, processed, or transmitted
- source of the data
- trigger for collection or processing
- storage location, key, and retention if visible
- recipient, endpoint, method, and payload fields if transmitted
- local processing performed
- user action, consent, or lack of visible consent
- observed purpose
- confidence
- direct source evidence

Append privacy observations into each relevant `outline.jsonl` chunk entry under `privacy_observations`.

### 2.6 Stream Findings Immediately

After each chunk, append one JSON object to `OUT_DIR/outline.jsonl` with at least:

- file
- beautified path if applicable
- chunk id, start line, end line, same function group
- findings for Chrome APIs, listeners, messages, storage, endpoints, DOM, dynamic code, wasm, obfuscation hints, risks, and privacy observations
- evidence
- notes

Also append a human-readable chunk section to `OUT_DIR/analysis_notes.md` covering:

- summary
- Chrome APIs
- event listeners
- messaging
- storage
- endpoints
- DOM/sinks
- dynamic code/obfuscation
- privacy observations
- risks
- evidence

### 2.7 Continue For All Chunks

Repeat for every chunk of every source file. Do not wait until the end to backfill streaming artifacts.

### Messaging Extraction Requirements

- Enumerate both message senders and message handlers.
- For `chrome.runtime.onMessage` handlers, inspect every branch, switch case, and message-type constant that affects control flow.
- Include login, logout, auth propagation, analytics relay, config fetch, heuristic fetch, support-check, machine-key fetch, data-control, and storage-proxy messages when present.
- Treat `window.postMessage` flows separately from Chrome runtime messaging and document page-to-content or iframe-to-parent direction in notes.
- In final JSON, map unsupported directions conservatively to schema-valid values.

### Network Extraction Requirements

- Separate explicit literal endpoints from inferred or dynamic endpoint families.
- Do not duplicate the same endpoint solely because it appears in both sender and consumer code paths unless entries convey distinct behavior.
- Identify uninstall URLs, onboarding redirects, analytics endpoints, config APIs, support-check APIs, heuristic APIs, web-app iframe origins, catalogue redirects, and dynamic image fetches when present.

## Step 3: Intermediate Tables

**Purpose**: Create CSV tables for easy querying and cross-referencing during analysis.

Do this concurrently with Step 2. As discoveries are made, immediately append rows to:

### `OUT_DIR/endpoints.csv`

```csv
url,method,file,line_start,line_end
https://api.example.com/track,POST,serviceWorker.js,456,460
```

### `OUT_DIR/messages.csv`

```csv
channel_name,direction,payload_keys,file,line_start,line_end
getUserData,content->background,"userId|timestamp",content.js,45,50
```

### `OUT_DIR/storage_keys.csv`

```csv
key,type,purpose,file,line_start,line_end
userPrefs,local,Store user preferences,serviceWorker.js,123,125
```

Also append newly discovered items to `analysis_notes.md` under discovered-items sections. Keep these tables synchronized with `outline.jsonl`.

## Step 4: Components And Flows

**Purpose**: Identify architectural components and communication patterns.

### 4.1 Identify Components

Categorize all relevant files into:

1. **Background**: service worker or background scripts
2. **Content Scripts**: scripts injected into pages via manifest
3. **Injected Scripts**: dynamically injected via `chrome.scripting.executeScript`, DOM script insertion, `importScripts`, or dynamic `import()`
4. **UI**: popup, options page, side panel, devtools panels, data-control pages
5. **Page-facing scripts**: web-accessible resources loaded into page or iframe context
6. **Remote services**: external domains and services

For each component, list:

- files
- Chrome APIs used
- event listeners registered
- key behaviors
- evidence

### 4.2 Generate Flow Diagram

Create `OUT_DIR/flows.puml` in PlantUML format. Include:

- User/page interaction
- Page to content communication
- Content to background messaging
- UI to background messaging
- Background to remote network calls
- Content/UI/web-app `postMessage` flows
- Storage interactions
- DNR/webRequest annotations if applicable
- Image-processing iframe flows if present

### 4.3 Log Summary

Append a `Components` and `Flows` section to `analysis_notes.md` with files, APIs, listeners, major flows, and evidence.

## Step 5: Core Workflows

**Purpose**: Identify and describe high-level user-facing workflows/features.

### 5.1 Cluster Related Operations

Group related activities by:

- message channels, such as all handlers for login or support-check messages
- endpoint families, such as analytics, catalog, CMS/config, auth, or onboarding APIs
- storage read/write cycles, such as token storage and retrieval
- timers, alarms, navigation hooks, or startup/install events
- UI entry points, such as popup button click, action click, context menu click, or injected UI click

### 5.2 Create Workflow Descriptions

For each identified workflow, create:

- `name`
- `triggers`
- ordered `steps`
- `apis`
- `messages`
- `endpoints`
- `storage_keys`
- `evidence`

Coverage expectations:

- installation/update/onboarding flow
- supported website check or heuristic/config fetch flow
- product/page metadata extraction flow
- authentication/session flow
- analytics/error reporting flow
- A/B test/configuration flow
- UI injection/display flow
- image processing or image search flow
- catalogue redirect or external web app flow
- data-control/activation/uninstall flow
- storage proxy or external integration flow
- navigation monitoring flow

Do not collapse distinct behaviors into one workflow if the code clearly supports separate install, auth, analytics, support-check, image-processing, configuration, or data-control flows.

### 5.3 Log Workflows

Append a `Workflows` section to `analysis_notes.md` with triggers, ordered steps, APIs, messages, endpoints, storage, and evidence for each workflow.

## Step 6: Privacy, Security, Compliance

**Purpose**: Assess privacy implications and security risks based on collected evidence.

This step has three separate outputs:

1. legacy `privacy` summary
2. additive `observed_privacy_data` detail section
3. `risks` security/privacy risk list

Do not replace any one of these with another.

### 6.1 Privacy Analysis

Infer from storage keys, payload shapes, selectors, endpoints, permissions, UI disclosures, and workflows.

Analyze:

- **Data categories**: credentials, auth tokens, browsing URLs, page content, PII, settings, analytics, product metadata, image data, identifiers, locale/device/browser info.
- **Purposes**: authentication, personalization, analytics, advertising, feature functionality, A/B testing, localization, onboarding, error reporting.
- **Minimization**: whether the code appears to collect only what is needed or more than needed for the observed purpose.
- **Consent**: explicit user prompts, activation pages, opt-in/opt-out mechanisms, or absence of visible consent.
- **Retention**: TTLs, expiration, cleanup logic, logout clearing, session-only storage, or indefinite storage.
- **Third parties**: all external domains, inferred purpose, and evidence.
- **Policy compliance**: possible Chrome Web Store, GDPR, CCPA, or remote-code/user-data concerns.

### 6.2 Observed Privacy Data Aggregation

Aggregate all per-chunk `privacy_observations` into `observed_privacy_data.items` in `extension_summary.json`.

Rules:

- Keep entries concrete and atomic enough to preserve distinct flows.
- Examples: URL support checks, persistent IDs, auth storage, analytics events, page/product metadata extraction, image processing, configuration/A-B storage, settings access, browser info, locale, external storage access.
- Merge duplicates only when they describe the same data, trigger, storage, and transmission path.
- Every stored, generated, processed, or transmitted privacy item must have direct evidence from original source files.
- Use `"unknown"` where the code does not support a value.
- Do not collapse this into store-style categories such as `user_activity`.
- Treat `privacy.data_categories` as a backward-compatible summary; the detailed source of truth is `observed_privacy_data.items`.

### 6.3 Security/Risk Analysis

For each identified risk, create:

```json
{
  "type": "tracking",
  "severity": "medium",
  "justification": "Extension sends user browsing history to third-party analytics service without explicit user consent. Includes URLs and timestamps.",
  "evidence": [
    {"file": "serviceWorker.js", "start": 456, "end": 478}
  ]
}
```

Risk types:

- `tracking`: surveillance, behavioral tracking, analytics correlated with identifiers
- `fingerprinting`: browser/device fingerprinting or stable device profiling
- `pii_exfiltration`: personal data sent externally
- `excessive_permissions`: more permissions than needed
- `remote_code`: dynamic code/config loading that can alter behavior or execute remote logic
- `insecure_storage`: sensitive data in localStorage/sync/session without clear protection
- `policy_violation`: possible platform policy issue
- `other`: concrete issue that does not fit above

Severity:

- `low`: minor issue or limited user impact
- `medium`: significant privacy/security concern
- `high`: critical issue or immediate user harm potential

Important: do not omit risk generation because `observed_privacy_data` is detailed. Privacy observations should feed risk analysis, not replace it.

### 6.4 Log Privacy And Risks

Append to `analysis_notes.md`:

- Privacy Analysis
- Observed Privacy Data summary
- Risks

Each risk should include severity, justification, and evidence.

## Step 7: Populate Main JSON And Validate

**Purpose**: Create the final structured output that validates against the schema.

### 7.1 Write Schema File

Copy `schema.chrome_extension_behavior.json` verbatim to `OUT_DIR/schema.chrome_extension_behavior.json`.

### 7.2 Populate `extension_summary.json`

Aggregate all findings from Steps 1-6 into `OUT_DIR/extension_summary.json`:

- `metadata`: from manifest parsing and locale resolution
- `permissions`: from manifest parsing
- `components`: from component identification
- `network.endpoints`: from endpoint discovery and endpoint table
- `messaging.channels`: from message discovery and message table
- `storage.keys`: from storage key discovery and storage table
- `workflows`: from workflow clustering
- `observed_privacy_data`: from Step 6.2
- `privacy`: from Step 6.1
- `risks`: from Step 6.3
- `code_signals`: aggregate from Step 2

Critical rules:

- Every non-empty behavioral claim must include evidence.
- Use original file paths in evidence, never beautified paths.
- Do not invent fields beyond the schema unless the schema permits additional fields.
- Validate enum values for risk types, severities, storage types, and message directions.
- `observed_privacy_data` is required but must not replace `privacy` or `risks`.
- Preserve the original workflow's required sections even when adding privacy detail.

After creating `OUT_DIR/extension_summary.json`, create `privacy_workspace/` if needed and copy the same final JSON to:

```text
privacy_workspace/extension_summary.json
```

### 7.3 Validate Against Schema

Validate final JSON against `schema.chrome_extension_behavior.json`.

If validation fails:

- review error messages
- check missing required fields
- verify enum values
- ensure evidence arrays are present
- make minimal schema-normalization edits without redoing analysis
- document validation failures and fixes in `analysis_notes.md` and `scan_log.txt`

### 7.4 Write `run_info.json`

Include:

- run number
- model name
- timestamp
- source extension path
- output directory
- tools used
- validation status
- counts for files, chunks, endpoints, messages, storage keys, workflows, observed privacy items, and risks

### 7.5 Finalize `scan_log.txt`

Summarize:

- beautification status
- files excluded
- parse fallbacks
- counts
- validation result
- blockers or unknowns
- whether `privacy_workspace/extension_summary.json` was created

## Step 8: Declared Privacy Extraction (Prompt 2)

**Purpose**: Collect Chrome Web Store declared privacy data after the main reverse-engineering output exists.

This is an appended privacy-suite step. It must not replace or shorten Steps 0-7.

Mandatory reference:

- Read and follow `prompt2.md` during this step.
- Treat `prompt2.md` as the source of truth for the extraction procedure.
- Do not summarize `prompt2.md` into a weaker instruction set.

Inputs:

- Chrome Web Store extension ID from the user's OpenCode start request.
- `fetch_privacy.py` in the project root.
- `privacy_workspace/extension_summary.json` from Step 7.

Execution rules:

- If no extension ID is provided, skip Steps 8-11 and record the missing input in `analysis_notes.md` and `scan_log.txt`.
- If `fetch_privacy.py` is missing, record the blocker in `analysis_notes.md` and `scan_log.txt`; do not invent declared privacy data.
- Run:

```text
python fetch_privacy.py <extension_id>
```

- Expected output:

```text
privacy_workspace/declared_privacy.json
```

- If the script fails or the file is not created, stop the privacy-suite steps, document the failure, and keep the Step 0-7 reverse-engineering outputs valid.
- Do not fabricate Chrome Web Store declarations, privacy labels, developer disclosures, or external policy URLs.

## Step 9: Chrome Web Store Declared-vs-Observed Comparison (Prompt 3)

**Purpose**: Compare Chrome Web Store declared privacy data against observed privacy behavior from the extension summary.

Mandatory reference:

- Read and follow `prompt3.md` during this step.
- Keep `prompt3.md` as a full reference prompt, not a shortened summary.

Inputs:

- `privacy_workspace/declared_privacy.json`
- `privacy_workspace/extension_summary.json`

Observed behavior source priority:

1. Use `extension_summary.json.observed_privacy_data.items` as the primary observed-behavior source when present.
2. Fall back to older summary fields only when `observed_privacy_data.items` is absent or empty.
3. Do not re-scan source code in this comparison step.

Expected output:

```text
privacy_workspace/privacy_comparison.json
```

Rules:

- If Step 8 was skipped or failed, do not create this output.
- Compare declarations to observed evidence; do not invent either side.
- Record completion or blockers in `scan_log.txt`.

## Step 10: External Privacy Policy-vs-Observed Comparison (Prompt 4)

**Purpose**: Compare an external privacy policy, when available, against observed privacy behavior from the extension summary.

Mandatory reference:

- Read and follow `prompt4.md` during this step.
- Keep `prompt4.md` as a full reference prompt, not a shortened summary.

Inputs:

- External privacy policy data from Step 8 / `declared_privacy.json`, if available.
- `privacy_workspace/extension_summary.json`

Observed behavior source priority:

1. Use `extension_summary.json.observed_privacy_data.items` as the primary observed-behavior source when present.
2. Fall back to older summary fields only when `observed_privacy_data.items` is absent or empty.
3. Do not re-scan source code in this comparison step.

Expected conditional output:

```text
privacy_workspace/external_privacy_comparison.json
```

Rules:

- If no external privacy policy exists or can be retrieved, stop this step gracefully.
- Do not create `external_privacy_comparison.json` when there is no external policy input.
- Record the skip reason in `scan_log.txt`.
- Do not fabricate policy text, policy URLs, or policy claims.

## Step 11: Internal-vs-External Privacy Comparison (Prompt 5)

**Purpose**: Compare Chrome Web Store declared privacy information with the external privacy policy comparison.

Mandatory reference:

- Read and follow `prompt5.md` during this step.
- Keep `prompt5.md` as a full reference prompt, not a shortened summary.

Inputs:

- `privacy_workspace/declared_privacy.json`
- `privacy_workspace/privacy_comparison.json`
- `privacy_workspace/external_privacy_comparison.json`, only when created by Step 10

Expected conditional output:

```text
privacy_workspace/internal_external_privacy_comparison.json
```

Rules:

- If no external privacy policy exists, skip this step gracefully.
- If Step 10 did not create `external_privacy_comparison.json`, do not create this output.
- Do not re-scan source code in this comparison step.
- Do not invent missing internal declarations or external policy statements.
- Record completion or skip reason in `scan_log.txt`.

Before declaring the run complete, confirm:

- required deliverables exist
- schema validation passed or failure is explicitly documented
- `messaging`, `storage`, `network`, `workflows`, `privacy`, `observed_privacy_data`, and `risks` are all present
- risks were generated independently from the privacy data-flow section
- final evidence cites original source files
- no manifest-derived field was guessed when manifest or locale files were readable
- if an extension ID was supplied, Steps 8-9 completed or their blocker is documented
- if an external privacy policy was available, Steps 10-11 completed or their blocker is documented
- if no extension ID or external policy was available, privacy-suite skips are recorded in `scan_log.txt`

## Fallback Rules

- Never stop the run solely because parsing failed for one file or chunk.
- Mark unresolved values as `"unknown"` instead of guessing.
- When exact payloads or URLs cannot be fully resolved, document the limits and keep the strongest evidence available.
- Continue through the workflow without asking for confirmation between successful steps.
- Do not let Step 8-11 failures invalidate completed Step 0-7 reverse-engineering artifacts when the failure is caused by missing extension ID, failed Chrome Web Store extraction, or missing external policy.
