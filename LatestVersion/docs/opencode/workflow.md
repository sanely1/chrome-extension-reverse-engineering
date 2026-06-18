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
   - `census/source_file_inventory.csv`
   - `census/source_chunks.csv`
   - `census/high_signal_chunks.csv`
   - `census/high_signal_chunk_review.csv`

## Step 0: Setup For Selective Beautification

**Purpose**: Preserve the original prompt's early beautification intent without wasting time on every bundled asset.

Do not beautify every `.js` / `.mjs` file in the extension. Large extensions often contain hundreds of lazy chunks and asset files. Broad beautification is slow and can hide the real evidence workflow.

1. Install beautification tooling locally only if needed and only inside the workspace.
2. Create `OUT_DIR/beautify_map.json` as an empty or pending map.
3. Continue immediately to manifest/source inventory. Selective beautification starts as soon as `source_file_inventory.csv` exists.

## Step 0B: Selective Runtime Beautification

**Purpose**: Create readable versions of runtime-relevant JavaScript near the beginning of the workflow.

Run this immediately after Step 2.2A creates `OUT_DIR/census/source_file_inventory.csv`:

```bash
node tools/create_beautify_map.js OUT_DIR ./extension
```

Selection rules:

- Beautify files listed in `OUT_DIR/census/source_file_inventory.csv`.
- Also beautify files listed in `OUT_DIR/census/high_signal_chunks.csv` when that file exists.
- Also beautify files listed in `OUT_DIR/census/privacy_risk_evidence_review.csv` or `OUT_DIR/census/critical_mechanisms.csv` when those files exist later in the run.
- Never fall back to beautifying every JavaScript file simply because the extension has many chunks.
- Exclude `node_modules/`, generated scan outputs, source maps, old `out_*` folders, and already beautified files.

For each selected original file `foo.js`, create a side-by-side `foo.beautified.js` when feasible. Do the same for `.mjs` and `.cjs`.

Record mapping in `OUT_DIR/beautify_map.json`:

```json
[
  {"original": "extension/serviceWorker.js", "beautified": "extension/serviceWorker.beautified.js", "status": "ok", "selection_reason": "runtime inventory: background"},
  {"original": "extension/content.js", "beautified": "extension/content.beautified.js", "status": "error: parse failed", "selection_reason": "privacy/risk evidence: user_draft_text"}
]
```

You may read beautified files for parsing. For normal structural claims, original source evidence remains acceptable. For privacy, risk, and Chrome Web Store policy claims inside huge minified JavaScript bundles, final evidence should cite the beautified file/line range for readability and preserve original file/range/anchor traceability in `privacy_risk_evidence_review.csv` or the relevant policy review artifact.

If a selected large file cannot be fully beautified, document the fallback and continue with tolerant parsing, regex extraction, and chunked reading. Do not pause unless a real permission or filesystem blocker occurs.

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
- Never silently drop manifest-declared permissions or scopes. Preserve `permissions`, `host_permissions`, `optional_permissions`, `oauth2.scopes`, `externally_connectable`, `content_security_policy`, and `declarativeNetRequest` when present.
- If `manifest.json` declares `host_permissions` and final `permissions.host_permissions` is empty, treat that as a validation failure that must be fixed or explicitly documented as a blocker.

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

### 2.2A Create Source Chunk Inventory

Before manual chunk analysis and before mechanical census promotion, create a concrete runtime-source inventory:

```bash
node tools/source_chunk_inventory.js ./extension OUT_DIR
```

If the active extension source is not in `./extension`, pass that source directory as the first argument.

This writes:

- `OUT_DIR/census/source_file_inventory.csv`
- `OUT_DIR/census/source_chunks.csv`

Immediately after this succeeds, run selective runtime beautification:

```bash
node tools/create_beautify_map.js OUT_DIR ./extension
```

This is the early beautification step preserved from the original prompt, but scoped to runtime-relevant files instead of every JavaScript asset.

`source_file_inventory.csv` is the scope decision: it records which JavaScript files are considered runtime-relevant and why. `source_chunks.csv` is the full automated source coverage queue. It is not, by itself, proof that the LLM manually read every line.

Source inventory rules:

- Manifest-declared background/service worker files and content scripts are always relevant.
- JavaScript referenced by popup/options/sidepanel/devtools/data-control HTML pages is relevant.
- JavaScript discovered through `importScripts()`, dynamic `import()`, and `chrome.scripting.executeScript({ files })` from an already relevant file is relevant.
- Web-accessible JavaScript is relevant when it is declared as a script resource or is loaded/injected by relevant code.
- Production bundles are relevant when they are actual runtime files, even if they are minified.
- Exclude generated scan outputs, `node_modules`, source maps, already beautified files, and old `out_*` directories.
- If the inventory is empty, treat that as a blocker unless the extension genuinely contains no JavaScript runtime code. Record the blocker in `scan_log.txt`.
- Do not let the mechanical census replace this inventory. Census finds strings; the source chunk inventory defines what code must be covered by extraction.

### 2.3 Chunk Each File

For each row in `OUT_DIR/census/source_chunks.csv`:

- If file is at or below 2000 lines, treat it as one chunk with `chunk.id = "whole-file"`, `start_line = 1`, and `end_line = <last line>`.
- If file is over 2000 lines, split into contiguous chunks such as `[1-2000]`, `[2001-4000]`, etc.
- Try to keep function bodies intact.
- If a single function exceeds the chunk size, subdivide it and set `same_function_group` to a stable identifier such as function name or hash.
- If a chunk is skipped because the file is unreadable or not actually runtime code, record the skip reason in `analysis_notes.md` and `scan_log.txt`. Do not silently skip source chunks.

### 2.4 Parse And Extract

For each chunk listed in `OUT_DIR/census/source_chunks.csv`:

1. Build AST using tolerant parsing.
2. If full AST fails, retry logical subranges.
3. If AST completely fails, fall back to regex scanning.
4. Note any fallback in `analysis_notes.md`.

Extract with original-file evidence:

- **Chrome API calls**: `chrome.tabs.query`, `chrome.storage.local.get`, `chrome.runtime.sendMessage`, etc. Collect every single specific unique API method from the file. For scripts larger than 10,000 lines, use an automated dynamic Node/PowerShell extraction script to ensure all methods are listed (summarization or namespace-only lists are banned).
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

### 2.4A Create High-Signal Manual Review Queue

After source inventory and automated extraction, create the manual privacy/risk review queue:

```bash
node tools/high_signal_chunks.js ./extension OUT_DIR
```

This writes:

- `OUT_DIR/census/high_signal_chunks.csv`

`high_signal_chunks.csv` is the required manual review queue for privacy/risk-sensitive code. It is derived from runtime-relevant chunks that contain signals such as:

- document text, editor text, form/input content, selected text, or page DOM extraction
- auth, identity, cookies, OAuth, account, session, token, or email behavior
- network transmission, WebSockets, beacons, runtime messaging, or `postMessage`
- telemetry, analytics, metrics, tracking, logging, or behavioral event collection
- Chrome storage, Web Storage, IndexedDB, cookies, cache, or custom persistence
- remote config, treatments, experiments, feature gates, dynamic imports, or script injection
- iframe/script injection, broad page access, observers, or content-script DOM access
- crypto, encryption, base64, encoded payloads, or serialized sensitive state

Manual review rules:

- Every row in `high_signal_chunks.csv` with `manual_review_required = yes` must be manually inspected before Step 6 privacy/risk synthesis.
- The reviewer must write `OUT_DIR/census/high_signal_chunk_review.csv`.
- Do not generate `high_signal_chunk_review.csv` from census rows alone. It must contain manual reasoning from reading the relevant chunk or an explicitly documented blocker.
- Low-signal chunks can remain `automated_only`, but they cannot be used as the sole basis for a final privacy item or risk.
- If a final privacy item or risk cites JavaScript evidence inside a high-signal chunk, the matching `high_signal_chunk_review.csv` row must be marked `manual_reviewed = yes`.

Required columns for `high_signal_chunk_review.csv`:

```text
chunk_id,file,start_line,end_line,manual_reviewed,why_high_signal,manual_summary,privacy_data_found,risk_candidates_found,exact_anchors,decision,notes
```

Allowed `decision` values:

- `privacy_or_risk_relevant`
- `benign_after_review`
- `merged_into_other_finding`
- `uncertain_needs_followup`
- `blocked_unreadable`

Chunk risk/privacy rule:

- Record risk and privacy candidates seen during high-signal chunk reading even when they are not yet final.
- These chunk-level candidates must later be reconciled into `privacy_signal_matrix.csv`, `privacy_candidate_review.csv`, and `risk_candidate_review.csv`.
- Do not drop a chunk-level risk candidate just because it was not found by the mechanical census. Census and chunk review are complementary sources.
- Do not promote a chunk-level risk directly into final `extension_summary.json` without later review and evidence checking.

Content-script coverage guard:

- Content scripts are high-risk analysis roots because they can read page URLs, DOM content, page metadata, user interactions, iframes, and `window.postMessage` traffic.
- If a content script is larger than 500 lines, do not accept a final content-script inventory that contains only one or two APIs/listeners unless a limitation is documented.
- For large content scripts, explicitly search for DOM reads/writes, `window.addEventListener`, `document.addEventListener`, `window.postMessage`, `chrome.runtime.sendMessage`, `chrome.runtime.onMessage`, `MutationObserver`, `ResizeObserver`, iframe creation, `window.open`, `sessionStorage`, `localStorage`, `navigator.*`, and URL/location access.
- If the content-script API/listener inventory remains sparse after this pass, record the limitation in `analysis_notes.md` and `scan_log.txt`; do not silently present it as complete.

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

Append privacy observations into each relevant manually reviewed high-signal chunk entry under `privacy_observations`. For low-signal chunks, automated census coverage is enough unless a later candidate review discovers a privacy/risk signal and upgrades the chunk to high-signal review.

### 2.6 Stream Manual Findings Immediately

After each manually reviewed high-signal chunk, append one JSON object to `OUT_DIR/outline.jsonl` with at least:

- file
- beautified path if applicable
- chunk id, start line, end line, same function group
- findings for Chrome APIs, listeners, messages, storage, endpoints, DOM, dynamic code, wasm, obfuscation hints, risks, and privacy observations
- evidence
- notes

Also append a human-readable high-signal chunk section to `OUT_DIR/analysis_notes.md` covering:

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

Do not use a script to fabricate these manual notes. Helper scripts may prefill file names, ranges, and extracted signals, but the `manual_summary`, `privacy_data_found`, `risk_candidates_found`, `exact_anchors`, and `decision` fields must reflect actual review.

### 2.7 Continue For All High-Signal Chunks

Repeat for every row in `OUT_DIR/census/high_signal_chunks.csv` where `manual_review_required = yes`. Do not wait until the end to backfill manual review artifacts.

Every row in `source_chunks.csv` still receives automated extraction coverage through Step 2.4 and the census tools. The manual requirement applies to high-signal chunks and to any chunk that becomes relevant to a final privacy/risk claim.

Before running Step 2.5 mechanical census extraction, perform a coverage check:

- every `source_chunks.csv` row must be covered by automated extraction or have a documented skip/blocker in `scan_log.txt`
- every `high_signal_chunks.csv` row with `manual_review_required = yes` must have a matching `high_signal_chunk_review.csv` row by file and line range
- every manually reviewed high-signal row should have a matching `outline.jsonl` entry by file and line range
- every relevant runtime source file in `source_file_inventory.csv` must have at least one chunk entry
- if a large runtime bundle produces high-signal matches but no manual review rows, continue high-signal chunk review before privacy/risk synthesis

### Messaging Extraction Requirements

- Enumerate both message senders and message handlers.
- For `chrome.runtime.onMessage` handlers, inspect every branch, switch case, and message-type constant that affects control flow.
- Include login, logout, auth propagation, analytics relay, config fetch, heuristic fetch, support-check, machine-key fetch, data-control, and storage-proxy messages when present.
- Treat `window.postMessage` flows separately from Chrome runtime messaging and document page-to-content or iframe-to-parent direction in notes.
- In final JSON, map unsupported directions conservatively to schema-valid values.

### Network Extraction Requirements

- Capture every explicit literal endpoint and every plausible endpoint candidate. Do not collapse literal URLs into broad families during extraction.
- Separate explicit literal endpoints, relative routes, synthesized endpoint candidates, and dynamic endpoint families using confidence notes.
- Do not duplicate exact same endpoint rows unless different code paths demonstrate distinct behavior.
- Identify uninstall URLs, onboarding redirects, analytics endpoints, config APIs, support-check APIs, heuristic APIs, auth APIs, telemetry APIs, web-app iframe origins, catalogue redirects, WebSocket endpoints, and dynamic image fetches when present.
- Search for relative routes such as `/api/...`, `/v1/...`, `/oauth/...`, `/batch/import`, `/track`, `/log`, `/graphql`, `/coupon`, `/cart`, and combine them only with plausible base domains from manifest, CSP, host permissions, or nearby code context. Mark these as synthesized/candidate unless the code directly constructs the full URL.

## Step 2.5: Mechanical Census Extraction

**Purpose**: Prevent undercounting of `network.endpoints`, `messaging.channels`, and `storage.keys` in large bundled extensions.

After Step 2 has identified source files and before Step 4 components/flows, Step 5 workflows, or Step 6 privacy/risk analysis, run the local census extractor:

```bash
node tools/census_extractor.js ./extension OUT_DIR
node tools/census_promoter.js OUT_DIR
```

If the active extension source is not in `./extension`, pass that source directory as the first argument. Replace `OUT_DIR` with the actual current run directory, for example `./out_001_gemini-2.5-flash`.

The extractor writes:

- `OUT_DIR/census/endpoints_candidates.csv`
- `OUT_DIR/census/message_candidates.csv`
- `OUT_DIR/census/storage_candidates.csv`
- `OUT_DIR/census/string_constants.csv`
- `OUT_DIR/census/census_summary.json`
- `OUT_DIR/census/promoted_endpoints.csv`
- `OUT_DIR/census/excluded_endpoints.csv`
- `OUT_DIR/census/promoted_messages.csv`
- `OUT_DIR/census/excluded_messages.csv`
- `OUT_DIR/census/message_candidate_review.csv`
- `OUT_DIR/census/promoted_storage_keys.csv`
- `OUT_DIR/census/excluded_storage_keys.csv`
- `OUT_DIR/census/storage_candidate_review.csv`
- `OUT_DIR/census/promotion_summary.json`

After final synthesis, `tools/message_review_linter.js` checks that message adjudication exists and that final `messaging.channels` does not contain obvious fake channels.

Census rules:

- Use manual high-signal chunk findings from `high_signal_chunk_review.csv` and `outline.jsonl` together with promoted census rows. Neither source is sufficient alone for final behavioral synthesis.
- Treat raw census files as candidate evidence aids, not final proof by themselves.
- `tools/census_promoter.js` is the mandatory first-pass filter. Raw `*_candidates.csv` rows are not eligible for final `extension_summary.json` unless they are present in the matching `promoted_*.csv` file or manually promoted with a written reason.
- Use original source file paths and line numbers from the promoted rows when adding final JSON evidence.
- Review high- and medium-confidence promoted rows first.
- Use `excluded_*.csv` as the false-positive audit trail. Do not re-add excluded rows to final JSON unless source context proves runtime behavior and the manual override is recorded in `analysis_notes.md`.
- For low-confidence synthesized endpoints, include them in `network.endpoints` only when code context supports a real request or document them in `analysis_notes.md` as candidates not promoted.
- Message candidates require an extra LLM adjudication pass. `promoted_messages.csv` is a review queue, not automatic final truth.
- Before Step 3 reconciliation, create `OUT_DIR/census/message_candidate_review.csv` by reviewing every promoted message row against its source context.
- Storage candidates require an extra LLM adjudication pass. `promoted_storage_keys.csv` is a review queue, not automatic final truth.
- Before Step 3 reconciliation, create `OUT_DIR/census/storage_candidate_review.csv` by reviewing every promoted storage row against its source context.
- Compare `endpoints.csv`, `messages.csv`, and `storage_keys.csv` against the promoted census files during Step 3, before Step 4 begins.
- If raw candidate counts are much higher than promoted rows, this is acceptable only when `excluded_*.csv` contains concrete exclusion reasons. Do not copy raw candidates into final JSON to inflate counts.

### 2.5.1 Storage Candidate Adjudication

**Purpose**: Prevent storage undercounting without polluting final `storage.keys`, privacy, and risks with minification artifacts.

After `tools/census_promoter.js` writes `OUT_DIR/census/promoted_storage_keys.csv`, manually review each promoted storage candidate and write:

```csv
key,type,operation,decision,reason,purpose,file,line_start,line_end
```

Decision values:

- `confirmed_storage_key`: direct source context shows a real `chrome.storage`, Web Storage, IndexedDB, CacheStorage, cookie, or extension storage wrapper key/store/database.
- `likely_storage_key`: context strongly supports a real storage key, but minification prevents full certainty.
- `rejected_candidate`: candidate is not a final storage key.
- `uncertain_candidate`: evidence is too ambiguous to use in final JSON, but the row is worth documenting.

Reject candidates when source context indicates any of the following instead of a stable storage key:

- class or implementation names, such as `*StorageApiImpl`
- generic object fields, such as `schema`, `name`, `value`, `type`, `keyPath`, or `autoIncrement`
- UI/CSS constants, such as `ltr`, `rtl`, `border-box`, or animation names
- event names, error event labels, logging labels, debug strings, or human-readable messages
- namespace prefixes without a concrete key suffix, such as `host.userAccount.`
- domains, URLs, routes, file names, package names, or static asset names
- callback argument strings accidentally captured from storage API callbacks

Only rows marked `confirmed_storage_key` or `likely_storage_key` may be promoted into `OUT_DIR/storage_keys.csv` and final `extension_summary.json.storage.keys`. `rejected_candidate` and `uncertain_candidate` rows must not appear in final `storage.keys`; keep them in `storage_candidate_review.csv` and, when relevant, mention the rejection reason in `analysis_notes.md`.

Privacy and risk analysis must use the adjudicated storage review:

- Confirmed/likely sensitive keys, such as auth/session/token/user/profile/device/tracking/telemetry/consent/settings/cache/config keys, must be checked for `observed_privacy_data` and `risks`.
- Rejected candidates must not be used to invent privacy data flows or storage risks.
- If a rejected or uncertain candidate still looks privacy-sensitive, document the uncertainty instead of promoting it.

### 2.5.2 Message Candidate Adjudication

**Purpose**: Prevent message undercounting without filling `messaging.channels`, workflows, privacy, and risks with generic DOM events or minification artifacts.

After `tools/census_promoter.js` writes `OUT_DIR/census/promoted_messages.csv`, manually review each promoted message candidate and write:

```csv
channel_name,direction,api,decision,reason,payload_keys,file,line_start,line_end
```

Decision values:

- `confirmed_message_channel`: direct source context shows a real Chrome runtime/tabs message, port message, `window.postMessage`, iframe bridge message, custom RPC/event-bus channel, or handler branch.
- `likely_message_channel`: context strongly supports a real message channel, but minification prevents full certainty.
- `rejected_candidate`: candidate is not a final message channel.
- `uncertain_candidate`: evidence is too ambiguous to use in final JSON, but the row is worth documenting.

Reject candidates when source context indicates any of the following instead of a stable extension message channel:

- generic DOM event names such as `click`, `load`, `error`, `resize`, `focus`, `blur`, or `message` without a concrete payload type
- Promise/callback/internal JS labels such as `resolve`, `reject`, `success`, `failure`, `flush`, or `onreadystatechange`
- HTTP methods, URLs, domains, routes, package names, file names, CSS selectors, or static asset names
- human-readable log/error strings rather than protocol names
- generic object fields such as `type`, `name`, `value`, `data`, `payload`, or `callback`
- implementation/class names rather than protocol channels
- one-sided strings with no sender, handler, branch, payload object, or postMessage/runtime/sendMessage context

Only rows marked `confirmed_message_channel` or `likely_message_channel` may be promoted into `OUT_DIR/messages.csv` and final `extension_summary.json.messaging.channels`. `rejected_candidate` and `uncertain_candidate` rows must not appear in final `messaging.channels`; keep them in `message_candidate_review.csv` and, when relevant, mention the rejection reason in `analysis_notes.md`.

Hard reject candidates even when their automated promotion score is high if they are:

- template/minification artifacts containing `${`, `.concat`, `_duration_ms`, `Histogram`, `_total`, `_count`, `_sum`, or `_bucket`
- human-readable log, error, or UI text beginning with `Failed`, `Could not`, `Unable`, `Invalid`, `Unknown`, `An error`, or `Something went wrong`
- bare generic names such as `general`, `disconnect`, `start`, `remove`, `change`, `root`, `element`, `text`, or `icon` unless source context proves a real protocol sender and handler
- MIME types, version strings, domains, URLs, routes, asset filenames, DOM mutation options, CSS/UI roles, or metric labels

When adjudicating messages, sort/group the review by:

- Chrome runtime/tabs messaging
- Port/connect messaging
- `window.postMessage` and iframe/page bridges
- custom RPC/event-bus channels
- handler-only branches that still need sender lookup
- rejected/uncertain candidates

Workflows, privacy, and risk analysis must use the adjudicated message review:

- Confirmed/likely message channels carrying auth, tokens, user profile data, page text, URLs, telemetry, settings, consent, storage access, or remote commands must be checked for `observed_privacy_data` and `risks`.
- Rejected candidates must not be used to invent workflows, privacy data flows, or risks.
- If a confirmed handler branch lacks a sender, document the missing sender instead of dropping the channel silently.

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

Before continuing to Step 4, explicitly reconcile the three main CSV tables with the census files:

- Promote supported endpoint candidates into `OUT_DIR/endpoints.csv`.
- Promote only `confirmed_message_channel` and `likely_message_channel` rows from `OUT_DIR/census/message_candidate_review.csv` into `OUT_DIR/messages.csv`.
- Promote only `confirmed_storage_key` and `likely_storage_key` rows from `OUT_DIR/census/storage_candidate_review.csv` into `OUT_DIR/storage_keys.csv`.
- Record rejected high/medium-confidence candidates with a short reason in `analysis_notes.md`.

Step 3.5, Step 4, Step 5, and Step 6 must use these promoted census-reviewed, message-adjudicated, and storage-adjudicated tables. Do not assess workflows, privacy, or risks from raw candidates or pre-census tables only.

Chunk/census reconciliation rules:

- Add supported endpoints/messages/storage discovered during chunk review even if the mechanical census missed them.
- Add supported census findings even if the chunk narrative only summarized the surrounding behavior.
- If chunk review and census disagree, inspect the original source range and document the decision.
- If a chunk-level risk or privacy observation depends on an endpoint/message/storage item, make sure the linked item exists in the corresponding final CSV or document why it remains a candidate only.
- Do not build final workflows, privacy, or risks from `outline.jsonl` alone. Use chunk findings as evidence-backed candidates and reconcile them with reviewed endpoints, messages, storage, semantic architecture, and workflows.

## Step 3.5: Semantic Architecture Review

**Purpose**: Prevent the run from becoming a shallow string census. Before components, workflows, privacy, or risks are finalized, analyze the source chunks semantically and identify architecture-level behaviors that raw endpoint/message/storage extraction can miss.

This step is mandatory for normal source-code analysis runs. It is especially important for large bundled extensions where sensitive behavior is hidden behind minified classes, wrapper APIs, internal RPC layers, generated event names, or dynamic configuration.

### 3.5.1 Inputs

Use the same source chunks and reviewed tables already produced by Step 2, Step 2.5, and Step 3:

- `OUT_DIR/census/source_file_inventory.csv`
- `OUT_DIR/census/source_chunks.csv`
- `OUT_DIR/census/high_signal_chunks.csv`
- `OUT_DIR/census/high_signal_chunk_review.csv`
- `OUT_DIR/outline.jsonl`
- `OUT_DIR/analysis_notes.md`
- `OUT_DIR/endpoints.csv`
- `OUT_DIR/messages.csv`
- `OUT_DIR/storage_keys.csv`
- `OUT_DIR/census/promoted_endpoints.csv`
- `OUT_DIR/census/message_candidate_review.csv`
- `OUT_DIR/census/storage_candidate_review.csv`
- extension source files or approved beautified readability copies, never generated summaries as final evidence

### 3.5.2 Required Semantic Families

For every high-signal background, service worker, content script, injected script, popup, side panel, options page, and web-accessible script, manually inspect the relevant chunks for these behavior families. Use automated census results to guide the search, but do not treat raw string matches as semantic conclusions:

- `text_capture`: typing trackers, text deltas, editor/document state, selections, keystrokes, copy/paste, input/change handlers, DOM text extraction, contenteditable/textarea monitoring
- `auth_tokens`: OAuth clients, identity flows, session cookies, access tokens, refresh tokens, PKCE, account/profile fetches, login/logout propagation
- `telemetry_tracking`: analytics clients, event specs, batching, persistent identifiers, feature usage, interaction tracking, performance/error logging, marketing automation
- `storage_persistence`: Chrome storage, Web Storage, IndexedDB, CacheStorage, cookies, custom storage wrappers, database/store names, migrations, retention/eviction logic
- `remote_config`: feature flags, experiments, treatment/gate services, dynamic config, remotely controlled UI or behavior
- `messaging_rpc`: Chrome runtime/tabs messaging, ports, native messaging, custom RPC/event buses, iframe/page bridges, `window.postMessage`
- `privacy_sanitization`: DLP, redaction, masking, encryption, hashing, local-only processing, data minimization, consent/data-control checks
- `native_external_bridge`: `chrome.runtime.connectNative`, externally connectable pages, page-to-extension bridges, third-party SaaS integrations
- `ai_or_model_features`: generative AI, rewrite agents, local or remote ML models, prompt/context construction, streamed AI responses
- `security_sensitive_code`: dynamic imports, script injection, CSP reporting, crypto implementations, permission escalation, broad host access, remote behavior changes

### 3.5.3 Required Output

Create `OUT_DIR/census/semantic_architecture_review.csv` before Step 4.

```csv
family,component,file,line_start,line_end,finding,data_or_behavior,related_endpoints,related_messages,related_storage,privacy_impact,risk_impact,confidence,evidence_quality,notes
```

Rules:

- Each row must cite source-file evidence with the narrowest accurate line range.
- Do not cite `analysis_notes.md`, `outline.jsonl`, CSV files, or other generated notes as final evidence.
- If a semantic finding is discovered from notes, outline, or census first, trace it back to original source lines or an approved beautified readability copy with original traceability before using it in final JSON.
- Include negative/unknown findings when a required family is expected from permissions or APIs but not found; set `confidence` to `unknown` and explain the gap.
- For large bundled extensions, a semantic review with fewer than five substantive rows is suspicious unless `scan_log.txt` documents that source files were unavailable or unreadable.

### 3.5.4 How To Use The Review

Step 4 components, Step 5 workflows, and Step 6 privacy/risk analysis must use `semantic_architecture_review.csv` alongside the promoted endpoint/message/storage tables.

In particular:

- Confirmed text capture, document processing, or AI-context rows must be checked for `observed_privacy_data` and `pii_exfiltration`.
- Confirmed auth/session/token rows must be checked for `observed_privacy_data`, `insecure_storage`, and account/session risks.
- Confirmed telemetry/tracking rows must be checked for `tracking`, `fingerprinting`, and third-party sharing risks.
- Confirmed remote config/experiment rows must be checked for `remote_code`, policy, and dynamic behavior risks.
- Confirmed native/external bridge rows must be checked for attack-surface and data-sharing risks.
- Confirmed storage persistence rows must be checked for retention and sensitive local storage risks.
- Every row with a non-empty `risk_impact` must produce a row in `OUT_DIR/census/risk_candidate_review.csv` with one of: `confirmed_risk`, `likely_risk`, `mitigated_low_risk`, `merged_risk`, `rejected_candidate`, or `uncertain_candidate`.
- Do not add privacy items or risks merely to satisfy a count. If a signal is weak, create a rejected or uncertain review row with the reason instead of inventing a final finding.
- Use `mitigated_low_risk` when code evidence supports a real privacy/security concern, but mitigations, user intent, optional triggering, encryption, local-only scope, or lack of confirmed abuse make the severity low. These rows should appear in final `risks` with `severity: low`.

Before finalizing `extension_summary.json`, run:

```bash
node tools/semantic_coverage_linter.js OUT_DIR
node tools/high_signal_review_linter.js OUT_DIR ./extension
```

If either linter fails, do not finalize. Continue the high-signal manual review, update `high_signal_chunk_review.csv`, `analysis_notes.md`, `outline.jsonl`, and `semantic_architecture_review.csv`, then re-run the linters.

## Step 4: Components And Flows

**Purpose**: Identify architectural components and communication patterns.

Step 4 dependency: use the promoted census-reviewed `endpoints.csv`, message-adjudicated `messages.csv`, storage-adjudicated `storage_keys.csv`, and `OUT_DIR/census/semantic_architecture_review.csv` from Step 3.5. If those tables have not been reconciled or the semantic review has not been created, return to Step 3/3.5 first.

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

Step 5 dependency: cluster workflows using the promoted census-reviewed endpoint table, message-adjudicated message table, storage-adjudicated storage table, and `OUT_DIR/census/semantic_architecture_review.csv`. Do not build workflows from raw candidates, the smaller pre-census scan, or product intuition alone.

### 5.1 Cluster Related Operations

Create `OUT_DIR/census/workflow_candidates.csv` before writing final workflows. Build candidates from connected evidence, not from memory or broad product intuition.

Use these evidence signals:

- message channels, such as all handlers for login or support-check messages
- endpoint families, such as analytics, catalog, CMS/config, auth, or onboarding APIs
- storage read/write cycles, such as token storage and retrieval
- timers, alarms, navigation hooks, or startup/install events
- UI entry points, such as popup button click, action click, context menu click, or injected UI click
- semantic architecture rows, such as text capture, OAuth/token handling, telemetry clients, DLP/sanitization, AI agents, remote config, native bridges, or storage engines
- component boundaries, such as background, content script, popup, side panel, options page, iframe, injected script, native host, or service worker
- permission-backed behavior, such as cookies, identity, nativeMessaging, sidePanel, scripting, tabs, alarms, notifications, downloads, or declarativeNetRequest

`workflow_candidates.csv` format:

```csv
candidate_name,category,trigger_signals,message_signals,endpoint_signals,storage_signals,component_signals,evidence_files,confidence,notes
```

### 5.1.1 Workflow Candidate Categories

Review these generic categories for every extension. Include a category only when there is source evidence, but do not silently skip a category when matching signals exist:

- lifecycle/install/update/startup/onboarding
- auth/account/session/identity/cookies
- config/feature flags/experiments/remote settings
- telemetry/analytics/error reporting/diagnostics
- content-script page interaction, DOM reading, metadata extraction, text capture, form interaction, or page modification
- UI/popup/options/sidepanel/injected overlay/widget behavior
- user action handling, command handling, context menu, browser action, shortcut, or notification behavior
- storage/cache/sync/IndexedDB/cookie persistence or cleanup
- network API/data sync/recommendation/search/catalog/payment/shopping behavior
- document/text/media/image processing
- cross-frame, external app, native messaging, or `window.postMessage` bridge behavior
- permissions/DNR/webRequest/scripting/injection/security behavior
- privacy/consent/data-control/uninstall behavior

### 5.1.2 Workflow Candidate Review

Create `OUT_DIR/census/workflow_candidate_review.csv` before final `extension_summary.json`.

```csv
candidate_name,decision,reason,category,triggers,steps_summary,apis,messages,endpoints,storage_keys,evidence_files
```

Decision values:

- `confirmed_workflow`: source evidence supports a distinct behavior with trigger, operations, and at least one API/message/endpoint/storage/component signal.
- `likely_workflow`: source evidence strongly suggests a distinct behavior, but minification prevents complete sender/handler or trigger reconstruction.
- `merged_workflow`: candidate is real but should be merged with another workflow; name the target in `reason`.
- `rejected_candidate`: candidate is not a workflow or is only a duplicate/noise signal.
- `uncertain_candidate`: not enough evidence for final workflows; document the gap.

Final `extension_summary.json.workflows` may include only `confirmed_workflow` and `likely_workflow` rows, plus real `merged_workflow` behavior inside the target workflow. Do not include rejected or uncertain candidates.

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

Additional generic coverage guard:

- If there are confirmed/likely messages for a behavior, there should usually be a workflow or an explicit rejection/merge reason.
- If there are endpoints for auth, telemetry, config, search/catalog, AI/text processing, or policy/consent, those endpoint families should usually appear in workflows.
- If there are storage keys for auth/session/user/profile/telemetry/config/document/cache/settings, those storage families should usually appear in workflows.
- If there are popup/sidepanel/options/content-script components with listeners or messages, those UI/content behaviors should usually appear in workflows.

Do not collapse distinct behaviors into one workflow if the code clearly supports separate install, auth, analytics, support-check, image-processing, configuration, UI, content-script, storage/cache, external-bridge, or data-control flows.

If the extension is large and final workflows are fewer than the reviewed workflow candidates, create `OUT_DIR/census/workflow_promotion_audit.md` explaining exact merges/rejections. A large bundled extension with many confirmed messages/endpoints/storage keys and only three workflows is suspicious unless the audit proves the extra candidates are duplicates or false positives.

### 5.3 Log Workflows

Append a `Workflows` section to `analysis_notes.md` with triggers, ordered steps, APIs, messages, endpoints, storage, and evidence for each workflow.

Before continuing to Step 6, run workflow review lint if `extension_summary.json` exists already, or schedule it for Step 7:

```bash
node tools/workflow_review_linter.js OUT_DIR
```

## Step 6: Privacy, Security, Compliance

**Purpose**: Assess privacy implications and security risks based on collected evidence.

Step 6 dependency: privacy and risk analysis must use the automated source coverage (`OUT_DIR/census/source_chunks.csv`), mandatory manual high-signal review (`OUT_DIR/census/high_signal_chunks.csv`, `OUT_DIR/census/high_signal_chunk_review.csv`, and matching `OUT_DIR/outline.jsonl` entries for manually reviewed chunks), promoted census-reviewed `endpoints.csv`, message-adjudicated `messages.csv`, storage-adjudicated `storage_keys.csv`, `OUT_DIR/census/semantic_architecture_review.csv`, and workflows. If high-signal review, promotion, reconciliation, message adjudication, storage adjudication, or semantic review has not happened, stop Step 6 and return to Step 2/2.5/3/3.5 first.

This step has three separate outputs:

1. legacy `privacy` summary
2. additive `observed_privacy_data` detail section
3. `risks` security/privacy risk list

Do not replace any one of these with another.

Before writing those outputs, create a privacy/risk evidence matrix from the reviewed behavioral artifacts:

```text
OUT_DIR/census/privacy_signal_matrix.csv
```

The matrix must include every privacy- or risk-relevant signal from:

- `OUT_DIR/census/source_file_inventory.csv`
- `OUT_DIR/census/source_chunks.csv`
- `OUT_DIR/census/high_signal_chunks.csv`
- `OUT_DIR/census/high_signal_chunk_review.csv`
- `OUT_DIR/outline.jsonl`
- `OUT_DIR/endpoints.csv`
- `OUT_DIR/messages.csv`
- `OUT_DIR/storage_keys.csv`
- `OUT_DIR/census/semantic_architecture_review.csv`
- `OUT_DIR/census/workflow_candidate_review.csv`
- manifest permissions, host permissions, optional permissions, OAuth scopes, CSP, and web-accessible resources
- content-script DOM/page access, URL access, cookie access, IndexedDB/Web Storage usage, telemetry, auth/account flows, config/treatment fetches, injected iframes/scripts, and external bridges

Recommended columns:

```csv
signal_id,source_section,signal_type,name_or_url,operation,data_type,recipient_or_storage,trigger,purpose_guess,sensitivity,evidence_file,evidence_start,evidence_end,privacy_candidate,risk_candidate,notes
```

Use this matrix as the bridge from raw discovery to final privacy/risk conclusions. Do not start final `privacy`, `observed_privacy_data`, or `risks` synthesis until the matrix exists.

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

Create an explicit privacy candidate review table:

```text
OUT_DIR/census/privacy_candidate_review.csv
```

Recommended columns:

```csv
data_name,data_type,source_signal_ids,operation,collection_trigger,storage_type,storage_key,transmitted,recipient,endpoint,payload_fields,local_processing,user_control_or_consent,purpose_observed,decision,confidence,evidence_file,evidence_start,evidence_end,reason
```

Decision values:

- `confirmed_privacy_flow`
- `likely_privacy_flow`
- `merged_privacy_flow`
- `rejected_candidate`
- `uncertain_candidate`

Only `confirmed_privacy_flow` and `likely_privacy_flow` rows may appear as standalone final `observed_privacy_data.items`. `merged_privacy_flow` rows must be represented inside the target privacy item and explained in `reason`. Rejected and uncertain rows must not be used to invent privacy data.

Coverage expectations:

- If the extension reads page text, form fields, selected text, document content, product metadata, image data, cookies, auth tokens, user IDs, account state, browser/device identifiers, active tab URL, domain, browsing events, locale, user settings, telemetry payloads, crash/error data, or feature-treatment state, either create a privacy item or explain in the review table why it is not privacy-relevant.
- If `network.endpoints` contains analytics, logging, auth, account, telemetry, WebSocket, config, treatment, upload, sync, or report endpoints, check whether those endpoints carry personal data or behavioral data.
- If `storage.keys` contains sensitive-looking or persistent identifiers, auth/account keys, document/content caches, telemetry buffers, settings, dismissal state, or enterprise/managed policy keys, check whether they imply a stored privacy item.
- If `messaging.channels` moves auth, page content, selected text, document state, URLs, telemetry, settings, or external bridge data, check whether the sender/recipient path is a privacy flow.
- If `workflows` describe auth, telemetry, content extraction, AI/text processing, config/treatment, UI state, or external bridges, privacy items should usually reference those workflows or their evidence.

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

Risk typing discipline:

- Do not label behavior as `remote_code` merely because the extension fetches JSON configuration, uses a third-party library, or loads remote media. Use `remote_code` only when remote data can execute code, load executable scripts, alter executable logic in a security-significant way, or inject remote-controlled active content.
- Do not label behavior as `policy_violation` merely because it looks unusual. The justification must identify the potentially relevant platform or user-control issue and cite the exact user trigger or lack of user trigger. If the code shows clear user intent, lower severity or move the concern to `other` or notes.
- Do not inflate severity when the evidence only supports capability rather than observed use. For example, an OAuth scope can support a PII risk, but it should not be described as confirmed email exfiltration unless code evidence shows collection or transmission.
- Each risk must be traceable to a concrete behavior, not only a broad category from `privacy.data_categories`.

Severity:

- `low`: minor issue or limited user impact
- `medium`: significant privacy/security concern
- `high`: critical issue or immediate user harm potential

Important: do not omit risk generation because `observed_privacy_data` is detailed. Privacy observations should feed risk analysis, not replace it.

Create an explicit risk candidate review table:

```text
OUT_DIR/census/risk_candidate_review.csv
```

Recommended columns:

```csv
risk_name,risk_type,severity,source_signal_ids,affected_data,trigger,recipient_or_surface,why_it_matters,mitigating_evidence,decision,confidence,evidence_file,evidence_start,evidence_end,reason
```

Decision values:

- `confirmed_risk`
- `likely_risk`
- `mitigated_low_risk`
- `merged_risk`
- `rejected_candidate`
- `uncertain_candidate`

Only `confirmed_risk`, `likely_risk`, and `mitigated_low_risk` rows may appear as standalone final `risks`. `mitigated_low_risk` rows must use `severity: low` and explain the mitigation or limitation in `reason`. `merged_risk` rows must be represented inside the target risk and explained in `reason`. Rejected and uncertain rows must not be used to inflate risk count.

Risk coverage expectations:

- Consider a `tracking` risk when identifiers, URLs/domains, telemetry events, active-tab activity, user actions, or document interaction events are sent to analytics/logging endpoints.
- Consider a `pii_exfiltration` risk when page text, document content, form input, selected text, images, account identifiers, cookies, tokens, email, profile data, or other personal data are transmitted externally.
- Consider an `insecure_storage` risk when sensitive data is stored persistently or broadly synced without clear cleanup/protection evidence.
- Consider an `excessive_permissions` risk when host permissions, `tabs`, `cookies`, `identity`, `scripting`, `clipboardRead`, `nativeMessaging`, or similar capabilities are broader than the observed core behavior requires.
- Consider a `fingerprinting` risk only when stable device/browser/user profiling signals are collected or combined beyond ordinary feature operation.
- Consider `remote_code` conservatively, only when remote data can execute code or materially alter active executable behavior.
- Consider `policy_violation` conservatively, only when a specific platform/user-data policy concern is supported by code evidence.
- For every major privacy item, decide whether it also creates a risk; if not, record the mitigating reason in `risk_candidate_review.csv`.
- "Consider" means create a review row. It does not mean force a final risk. A considered candidate may be confirmed, likely, merged, rejected, or uncertain, but it must not disappear silently.
- Do not use numeric minimums such as "at least 5 privacy items" or "at least 4 risks". Completeness is judged by reviewed signal coverage, not by hitting a fixed count.
- Prefer `mitigated_low_risk` over `rejected_candidate` when the behavior is real and privacy/security-relevant but low severity. Examples include device/browser telemetry without a dedicated fingerprinting identifier, token or document storage with encryption/session/managed controls, optional native messaging, or policy/user-control concerns with partial mitigations.

### 6.3.1 Privacy/Risk Evidence Precision Review

Before final JSON synthesis, create:

```text
OUT_DIR/census/privacy_risk_evidence_review.csv
```

Recommended columns:

```csv
claim_section,claim_name,claim_type,source_review_row,original_evidence_file,original_start,original_end,beautified_evidence_file,beautified_start,beautified_end,evidence_file,draft_start,draft_end,precise_start,precise_end,anchor,matched_snippet_or_anchor,decision,reason
```

Decision values:

- `narrow_evidence_confirmed`
- `broad_range_justified`
- `needs_rescan`
- `rejected_evidence`

Rules:

- For every final `observed_privacy_data.items[]` entry and every final `risks[]` entry, find the narrowest source range that proves the claim.
- Prefer the exact function, branch, message handler, storage operation, fetch/WebSocket call, payload construction, permission declaration, DOM extraction block, or config/telemetry callsite.
- If the proving code is in a huge minified JavaScript bundle, run `node tools/create_beautify_map.js OUT_DIR ./extension` again after this review table is created. The tool will include evidence-bearing files from `privacy_risk_evidence_review.csv`.
- For minified JavaScript privacy/risk evidence, final `extension_summary.json` should cite `beautified_evidence_file` and `beautified_start`/`beautified_end` for human-readable verification. Preserve `original_evidence_file`, `original_start`/`original_end`, and an original anchor/snippet in this review table.
- Draft evidence ranges wider than 80 lines are not acceptable in final privacy/risk output unless `privacy_risk_evidence_review.csv` marks the row as `broad_range_justified` and explains why the code cannot be narrowed, for example heavily minified one-line bundles or unavoidable generated wrapper code.
- Broad evidence is never a substitute for specific explanation. The `reason` column must say what exact operation inside the range supports the claim.
- If source is minified into one or two huge lines and the original evidence range is `1-1`, `2-2`, or similarly tiny-but-huge, the review row must include both a beautified evidence location and `anchor`, `matched_snippet_or_anchor`, `offset`, or `context`. A bare original `line 2-2` in a minified JS bundle is not enough.
- Prefer evidence files that best represent the behavior. For text capture risks, check content/checking scripts as well as background bundles before settling on a generic minified background line.
- If the precise supporting line cannot be found, mark `needs_rescan` and rescan the relevant file before finalizing.

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
- `network.endpoints`: from endpoint discovery and the promoted census-reviewed `OUT_DIR/endpoints.csv`
- `messaging.channels`: from message discovery and the adjudicated `OUT_DIR/messages.csv`
- `storage.keys`: from storage key discovery and the adjudicated `OUT_DIR/storage_keys.csv`
- `workflows`: from adjudicated workflow clustering in `OUT_DIR/census/workflow_candidate_review.csv`
- `observed_privacy_data`: from Step 6.2, built from `privacy_candidate_review.csv`, `privacy_signal_matrix.csv`, and chunk-level privacy observations reconciled from `outline.jsonl`
- `privacy`: from Step 6.1
- `risks`: from Step 6.3, built from `risk_candidate_review.csv` and chunk-level risk candidates reconciled from `outline.jsonl`
- `code_signals`: aggregate from Step 2 source chunk review and Step 2.5 mechanical census extraction

Critical rules:

- For final privacy/risk evidence in minified JavaScript, cite the beautified file and line range when available. Do not leave final JS evidence as bare original `1-1` or `1-2` ranges. Keep original traceability in `privacy_risk_evidence_review.csv`.

- Top-N compression is forbidden for `network.endpoints`, `messaging.channels`, and `storage.keys`. Do not copy only a representative 10-15 rows from the reviewed CSV tables.
- Final `network.endpoints` should include every supported, non-duplicate row from `OUT_DIR/endpoints.csv`, which must be based on `OUT_DIR/census/promoted_endpoints.csv`; exact duplicates may be merged, but distinct supported URLs/routes/origins must not be dropped just to keep the JSON short.
- Final `messaging.channels` should include every supported, non-duplicate row from `OUT_DIR/messages.csv`, which must be based on `OUT_DIR/census/message_candidate_review.csv`; merge only true duplicates of the same channel/direction/payload behavior.
- Final `storage.keys` should include every supported, non-duplicate row from `OUT_DIR/storage_keys.csv`, which must be based on `OUT_DIR/census/storage_candidate_review.csv`; merge only true duplicates of the same key/storage type/purpose.
- Final `workflows` should include every confirmed/likely workflow from `OUT_DIR/census/workflow_candidate_review.csv`, except rows explicitly merged into another workflow with a documented reason.
- Do not include rows rejected in `excluded_endpoints.csv`, `excluded_messages.csv`, or `excluded_storage_keys.csv` unless a manual override explains why the generic filter was too strict.
- If final counts are materially lower than reviewed promoted CSV counts, write `OUT_DIR/census/final_promotion_audit.md` before validation. The audit must list CSV row counts, final JSON counts, exact duplicate counts, rejected false-positive categories, and concrete reasons for exclusions.
- Do not proceed to privacy-suite Step 8 until this promotion audit exists or final counts are close to the reviewed promoted CSV counts.
- Every non-empty behavioral claim must include evidence.
- Use original file paths for normal structural evidence. For privacy/risk/policy evidence in minified JavaScript, use beautified file paths when available and preserve original traceability in `privacy_risk_evidence_review.csv`.
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

### 7.3.1 Coverage Self-Audit

Before accepting schema validation as sufficient, run a coverage self-audit:

- Compare `manifest.json` directly against `metadata`, `permissions`, `host_permissions`, `optional_permissions`, `oauth2_scopes`, `components`, `web_accessible_resources`, and declared entrypoints.
- If the manifest declares `host_permissions` but final `permissions.host_permissions` is empty, fix the summary before finalizing.
- If the manifest declares content scripts, ensure each declared content script appears in `components.content_scripts` with meaningful APIs/listeners or an explicit limitation note.
- If a large content script has fewer than three APIs or fewer than two listener/message mechanisms reported, rescan it for DOM, messaging, storage, URL, iframe, observer, and page-metadata behavior.
- Confirm expected behavior families were considered when supported by files or APIs: install/onboarding, support checks, product-page heuristics, authentication, analytics/error reporting, A/B/config fetches, image search/processing, metadata extraction, data-control/uninstall, external storage access, navigation monitoring, popup/UI control, and session/local/sync storage proxying.
- Confirm `observed_privacy_data.items` covers all privacy-relevant flows found in `network`, `messaging`, `storage`, and `workflows`.

### 7.3.2 Evidence Precision Audit

Evidence may start broad during exploration, but final evidence should be narrow.

Rules:

- Avoid whole-file or near-whole-file evidence ranges in final JSON when a narrower span can support the claim.
- Treat ranges larger than 150 lines as suspicious unless the claim genuinely concerns an entire file or generated bundle section.
- For broad ranges that cannot be narrowed, add a limitation note in `analysis_notes.md` and prefer adding at least one narrower supporting evidence span.
- Do not cite a manifest whole-file range when the relevant field has a specific line range.
- Do not cite generated artifacts as behavioral evidence.

### 7.3.3 Message Review Lint

After writing `extension_summary.json`, run:

```bash
node tools/message_review_linter.js OUT_DIR
```

If it fails, do not finalize. Fix `message_candidate_review.csv`, `messages.csv`, and `extension_summary.json.messaging.channels` so obvious fake channels are rejected and real confirmed/likely channels remain. Re-run the linter before schema validation is treated as sufficient.

### 7.3.4 Workflow Review Lint

After message lint and after writing final workflows, run:

```bash
node tools/workflow_review_linter.js OUT_DIR
```

If it fails, do not finalize. Fix `workflow_candidate_review.csv`, `workflows`, or `census/workflow_promotion_audit.md`. The correct fix is not always to add more workflows: if a candidate is duplicate/noise, reject or merge it with a concrete reason. But a large extension with many message/endpoint/storage/component signals must not silently collapse into only a few broad workflows.

### 7.3.5 Privacy/Risk Review Lint

After workflow lint and after writing final `observed_privacy_data`, `privacy`, and `risks`, run:

```bash
node tools/privacy_risk_linter.js OUT_DIR
node tools/high_signal_review_linter.js OUT_DIR ./extension
```

If either linter fails, do not finalize. Fix `high_signal_chunk_review.csv`, `privacy_risk_evidence_review.csv`, `privacy_signal_matrix.csv`, `privacy_candidate_review.csv`, `risk_candidate_review.csv`, `extension_summary.json.observed_privacy_data`, `extension_summary.json.privacy`, or `extension_summary.json.risks`.

If a low privacy/risk count is genuinely correct, create:

```text
OUT_DIR/census/privacy_risk_audit.md
```

The audit must explain why reviewed endpoints, messages, storage keys, workflows, permissions, and content-script behavior do not support additional privacy items or risks.

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

## Step 12: Critical Mechanism Mapping

**Purpose**: Identify the extension mechanisms that matter for Chrome Web Store Program Policy analysis, without replacing the existing privacy/risk analysis.

Mandatory references:

- Read `docs/policies/chrome_webstore_program_policies.json`.
- Read `docs/policies/policy_signal_mapping.json`.
- Use the raw policy reference `docs/policies/chrome_webstore_program_policies.md` only for human-readable context.

Inputs:

- `OUT_DIR/extension_summary.json`
- `OUT_DIR/census/privacy_signal_matrix.csv`
- `OUT_DIR/census/privacy_candidate_review.csv`
- `OUT_DIR/census/risk_candidate_review.csv`
- `OUT_DIR/census/privacy_risk_evidence_review.csv`
- `OUT_DIR/census/semantic_architecture_review.csv`
- reviewed endpoints, messages, storage keys, workflows, permissions, CSP, and privacy-suite comparison outputs when available

Create:

```text
OUT_DIR/census/critical_mechanisms.csv
```

Required columns:

```text
mechanism_id,mechanism_type,description,source_finding,derived_from_findings,evidence_file,evidence_start,evidence_end,policy_clause_ids,criticality_reason,decision,notes
```

Mechanism types should be specific and evidence-grounded. Examples:

- `browsing_activity_collection`
- `page_or_document_content_access`
- `auth_or_cookie_handling`
- `third_party_data_transfer`
- `analytics_or_tracking`
- `broad_permission_surface`
- `remote_logic_or_config`
- `external_messaging_bridge`
- `storage_of_sensitive_data`
- `affiliate_or_ad_behavior`
- `listing_or_declared_privacy_mismatch`
- `single_purpose_or_unexpected_behavior`

Decision values:

- `critical_mechanism`
- `supporting_mechanism`
- `benign_or_not_policy_relevant`
- `merged_into_other_mechanism`
- `uncertain_needs_followup`

Rules:

- A mechanism is critical when it connects observed behavior to user data, browsing activity, permissions, third-party transfer, consent/disclosure, secure handling, remote logic, misleading behavior, ads/affiliate behavior, listing accuracy, or single-purpose concerns.
- Do not mark a mechanism critical because it sounds bad. Tie it to one or more concrete policy clause IDs from `chrome_webstore_program_policies.json`.
- Do not let the mechanism hide the original findings. `derived_from_findings` must trace the mechanism back to the concrete source findings that created it.
- Use semicolon-separated references in `derived_from_findings`, for example:

```text
observed_privacy_data:Edited Document Text;risk:pii_exfiltration;workflow:Realtime Text Checking;endpoint:wss://capi.grammarly.com;storage:AuthToken
```

- Valid source prefixes include `observed_privacy_data`, `risk`, `workflow`, `endpoint`, `message`, `storage`, `permission`, `semantic_architecture`, `privacy_comparison`, `external_policy_comparison`, and `manifest`.
- Every `critical_mechanism` and `supporting_mechanism` row must have at least one meaningful `derived_from_findings` reference. If the row cannot be traced to a source finding, mark it `uncertain_needs_followup` or reject/merge it.
- Do not invent policy clauses. Every `policy_clause_ids` value must exist in the structured policy JSON.
- A risk can map to several critical mechanisms, and one mechanism can support several policy findings. Keep merges explicit.
- Use original source evidence for behavior. Generated CSV files can explain review decisions, but final behavior evidence must still point to original extension files.
- If store listing, dashboard, consent, or external policy data is missing, keep the mechanism but record the missing information in `notes`.

## Step 13: Chrome Web Store Policy Compliance Analysis

**Purpose**: Build a structured argument about possible Chrome Web Store Program Policy breaches using the policy clauses and the extension findings.

Inputs:

- `docs/policies/chrome_webstore_program_policies.json`
- `docs/policies/policy_signal_mapping.json`
- `OUT_DIR/census/critical_mechanisms.csv`
- `OUT_DIR/extension_summary.json`
- privacy-suite outputs from Steps 8-11 when available

Create:

```text
OUT_DIR/policy_compliance_report.json
```

Report shape:

```json
{
  "source_policy": {
    "name": "Chrome Web Store Program Policies",
    "source_url": "https://developer.chrome.com/docs/webstore/program-policies/policies",
    "snapshot": "docs/policies/chrome_webstore_program_policies.json"
  },
  "summary": {
    "critical_mechanisms_count": 0,
    "findings_count": 0,
    "confirmed_breaches_count": 0,
    "likely_breaches_count": 0,
    "possible_breaches_count": 0,
    "not_enough_evidence_count": 0
  },
  "findings": []
}
```

Each `findings[]` entry must include:

- `finding_id`
- `status`
- `policy_clause_ids`
- `policy_area`
- `mechanism_ids`
- `source_finding_refs`
- `observed_behavior`
- `evidence`
- `breach_argument`
- `confidence`
- `missing_info`
- optional `declared_privacy_evidence`
- optional `external_policy_evidence`
- optional `disclosure_evidence`

Allowed statuses:

- `confirmed_breach`
- `likely_breach`
- `possible_breach`
- `compliance_concern`
- `not_enough_evidence`
- `not_applicable`

Status rules:

- Use `confirmed_breach` only when source behavior and disclosure/declaration/policy evidence together prove a concrete policy conflict.
- Use `likely_breach` when the code and available disclosure evidence strongly indicate a conflict but one non-critical input is incomplete.
- Use `possible_breach` when the code shows behavior that could conflict with a policy clause, but store listing, consent, declared privacy, or external policy evidence is incomplete.
- Use `compliance_concern` when the behavior is policy-relevant but not enough to argue a breach.
- Use `not_enough_evidence` when the policy question cannot be answered from available artifacts.
- Use `not_applicable` when the clause does not apply to this extension or behavior.

Argument rules:

- Do not treat every technical risk as a policy breach.
- Do not rely on mechanism IDs alone. `source_finding_refs` must point back to the original privacy items, risks, workflows, endpoints, messages, storage keys, permissions, semantic rows, or privacy-suite comparison findings used for the policy argument.
- Do not write "fully compliant" unless all relevant disclosure, consent, listing, external privacy policy, and code evidence are available and consistent.
- Prefer `"unknown"` or `not_enough_evidence` when dashboard fields, store listing text, consent UI, or external policy text are unavailable.
- Cite specific policy clause IDs and explain why the observed behavior matches or does not match the clause.
- Include missing information explicitly, for example: store listing text unavailable, privacy policy unavailable, no consent UI evidence, or backend purpose unknown.

After creating `policy_compliance_report.json`, update `OUT_DIR/extension_summary.json` with a short top-level summary:

```json
"policy_compliance": {
  "source": "Chrome Web Store Program Policies",
  "source_url": "https://developer.chrome.com/docs/webstore/program-policies/policies",
  "source_snapshot": "docs/policies/chrome_webstore_program_policies.json",
  "report": "policy_compliance_report.json",
  "critical_mechanisms_count": 0,
  "possible_breaches_count": 0,
  "confirmed_breaches_count": 0,
  "notes": "Detailed policy analysis is in policy_compliance_report.json."
}
```

The top-level summary is additive. It must not overwrite `privacy.policy_compliance`, `observed_privacy_data`, `risks`, or privacy-suite outputs.

## Step 14: Final Validation

**Purpose**: Validate the complete run after the main reverse-engineering output, privacy suite, critical mechanism mapping, and policy-compliance report are all handled.

Run:

```text
node tools/policy_compliance_linter.js OUT_DIR
```

Also ensure all previously required linters and schema validation from Step 7 have passed or have documented blockers:

- schema validation
- `node tools/message_review_linter.js OUT_DIR`
- `node tools/workflow_review_linter.js OUT_DIR`
- `node tools/semantic_coverage_linter.js OUT_DIR`
- `node tools/privacy_risk_linter.js OUT_DIR`
- `node tools/high_signal_review_linter.js OUT_DIR ./extension`

Step 14 completion rules:

- If policy references are missing, fix the local policy files.
- If a policy report references unknown clause IDs, fix the report or the mapping.
- If `confirmed_breach` lacks disclosure/declaration/policy evidence, downgrade it to the strongest evidence-supported status.
- If critical mechanisms exist but no policy findings are possible, write `not_enough_evidence` findings explaining the missing inputs instead of inventing breaches.
- Record Step 12-14 completion, skips, or blockers in `scan_log.txt`.

Before declaring the run complete, confirm:

- required deliverables exist
- schema validation passed or failure is explicitly documented
- coverage self-audit passed or failures were fixed/documented
- evidence precision audit passed or unavoidable broad ranges were documented
- message review lint and workflow review lint passed, or blockers were documented
- `messaging`, `storage`, `network`, `workflows`, `privacy`, `observed_privacy_data`, and `risks` are all present
- risks were generated independently from the privacy data-flow section
- final evidence cites original source files, or beautified source copies for minified privacy/risk/policy evidence with original traceability
- no manifest-derived field was guessed when manifest or locale files were readable
- manifest-declared permissions, especially `host_permissions`, were not lost
- large content scripts were not summarized as empty or API-poor without a rescan
- if an extension ID was supplied, Steps 8-9 completed or their blocker is documented
- if an external privacy policy was available, Steps 10-11 completed or their blocker is documented
- if no extension ID or external policy was available, privacy-suite skips are recorded in `scan_log.txt`
- Step 12 critical mechanism mapping exists or the absence of policy-relevant mechanisms is documented
- Step 13 policy compliance report exists and uses concrete Chrome Web Store policy clause IDs
- Step 14 policy compliance validation passed or has a documented blocker

## Fallback Rules

- Never stop the run solely because parsing failed for one file or chunk.
- Mark unresolved values as `"unknown"` instead of guessing.
- When exact payloads or URLs cannot be fully resolved, document the limits and keep the strongest evidence available.
- Continue through the workflow without asking for confirmation between successful steps.
- Do not let Step 8-11 failures invalidate completed Step 0-7 reverse-engineering artifacts when the failure is caused by missing extension ID, failed Chrome Web Store extraction, or missing external policy.
- Do not let missing store listing, consent UI, dashboard, or external privacy policy evidence turn a possible policy concern into a confirmed breach.




