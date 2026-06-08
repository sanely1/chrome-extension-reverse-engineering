# Reverse Engineering Analysis Notes - kbfnbcaeplbcioakkpcpgfkobkghlhen

This document contains chunk-by-chunk and overall findings for the Chrome extension with ID `kbfnbcaeplbcioakkpcpgfkobkghlhen` (Grammarly).

## Manifest Summary

- **Name**: Grammarly: AI Writing Assistant and Grammar Checker App (Short Name: Superhuman Go (Beta))
- **Version**: 14.1259.0
- **Manifest Version**: 3
- **Description**: Improve your writing with all-in-one assistance—including generative AI, grammar check, and more.
- **Service Worker / Background Entrypoint**: `sw.js` (which points to `src/js/Grammarly-bg.js` inside)
- **Content Scripts**:
  - `src/js/Grammarly-check.styles.js`, `src/js/Grammarly-check.js` (Match: `<all_urls>`, excluding several mail, chat, productivity domains, `run_at`: `document_idle`)
  - `src/js/Grammarly.styles.js`, `src/js/Grammarly.js` (Matches: Atlassian, Gmail, Quora, Slack, Facebook, LinkedIn, Twitter, etc., `run_at`: `document_idle`)
  - `src/js/Grammarly-gDocs.styles.js`, `src/js/Grammarly-gDocs.js` (Match: `*://docs.google.com/document/*`, `run_at`: `document_idle`)
  - `src/js/Grammarly-gDocsEarlyInjector.js` (Match: `*://docs.google.com/document/*`, `run_at`: `document_start`)
  - `src/js/Grammarly-gDocsIframeCs.js` (Match: `*://docs.google.com/document/*` excluding, `run_at`: `document_idle`)
  - `src/js/Grammarly-overleafStartContentScript.js` (Match: `*://*.overleaf.com/*`, `run_at`: `document_start`)
- **UI & Injected Pages**:
  - Popup: `src/popup.html`
  - Side Panel: `src/sidePanel.html`
  - Sandbox: `src/gOS-sandbox.html`
  - Debug Page: `src/debug.html`
- **Permissions**:
  - Required API permissions: `scripting`, `sidePanel`, `tabs`, `notifications`, `cookies`, `identity`, `storage`
  - Optional permissions: `nativeMessaging`, `clipboardRead`
  - Host permissions: `http://*/*`, `https://*/*`
- **Externally Connectable**: `https://*.grammarly.com/*`
- **Content Security Policy (extension_pages)**: Connects to numerous `*.grammarly.com`, `*.grammarly.io`, CloudFront, Capi, Dox, Inkwell, Gnar, Chipmunk, Treatment, Gates, GoldenGate, FeMetrics, Iterable, Skills, Gateway, Coda, and Subscription endpoints.
- **Storage Managed Schema**: `src/schema.json`

### Direct Evidence
- `extension/manifest.json` (lines 1-365)

## Components and Flows

### 1. Identified Architectural Components
- **Background Service Worker**:
  - Main file: `extension/sw.js` (which imports `extension/src/js/Grammarly-bg.js`).
  - Responsibilities: Manages state machine (`WSError`, `idle`), WebSocket connections with Grammarly's Client API (CAPI), session cookie syncs, managed configuration schemas, side panel initialization, telemetry relays, and background lifecycle operations.
- **Content Scripts**:
  - **Check CS**: `src/js/Grammarly-check.js` (Match: `<all_urls>`, idle) — default checker injected globally to detect text inputs, textareas, and inject Grammarly's floating assistance button.
  - **Site-Specific CS**: `src/js/Grammarly.js` (Matches: Atlassian, Gmail, Slack, Facebook, etc., idle) — tailors editing experience, styles, and integrations for individual productive platforms.
  - **Google Docs Integration CS**: `src/js/Grammarly-gDocs.js` (Match: Google Docs document view, idle) — coordinates complex canvas-based or HTML-based editor overlays.
  - **Google Docs Early Injector CS**: `src/js/Grammarly-gDocsEarlyInjector.js` (Match: Google Docs, start) — hooks early into page initialization to intercept document actions and frame loads.
  - **Overleaf Integration CS**: `src/js/Grammarly-overleafStartContentScript.js` (Match: Overleaf, start) — bootstraps early editor interceptors in LaTeX web editors.
- **UI & Panels**:
  - Popup: `src/popup.html` / `src/js/Grammarly-popup.js` — displays fast account options, quick settings toggle, and tone diagnostics.
  - Side Panel: `src/sidePanel.html` / `src/js/Grammarly-sidePanel.js` — full assistant container hosting deep rewrite suggestions, synonyms, document diagnostics, and premium feature prompts.
  - Devtools/Sandbox: `src/gOS-sandbox.html` / `src/js/gOS-sandbox.js` — used as a secure frame/iframe environment for evaluating certain SDUI schemas or isolated code blocks.

### 2. Major Communication and Data Flows
- **Initialization Handshake**:
  - Content scripts establish long-lived ports with the background service worker using `chrome.runtime.onConnect`. They pass initial details about the page context and configuration (`handshake`).
- **Real-Time Editing and Text Synchronization**:
  - The content script captures user keyboard inputs and input field changes, packaging them into Operational Transformation (OT) delta messages such as `submit_ot` and `submit_ot_chunk`.
  - These are sent through the background service worker to the remote CAPI WebSocket: `wss://capi.grammarly.com`.
  - Suggestions and grammar errors returned by CAPI are dispatched back to the content script, which handles inline rendering (`SduiInlineCardRenderer`), CSS highlights, and popovers.
- **Action Control and Telemetry**:
  - When a user dismisses, edits, or accepts suggestions, actions like `pushed_content:executeAction` or `user_action` are triggered.
  - These are communicated back to the background worker to adjust internal state caches and relay telemetry payloads via POST request to `https://gnar.grammarly.com/` or `https://f-log-extension.grammarly.io/`.
- **UI Control and Panel Toggles**:
  - Actions like `closeSidePanel` or `side-panel-close-status` are used to open or collapse panels inside the host browser tab, responding to document state changes or user-initiated sidepanel close events.

## Core Workflows

### 1. Onboarding, Installation, and Update Flow
- **Triggers**: `chrome.runtime.onInstalled` / service worker startup.
- **Workflow Steps**:
  1. The background script listens for extension installation or updates.
  2. Register uninstallation landing page via `chrome.runtime.setUninstallURL("https://www.grammarly.com/extension-uninstall")` or dynamic configuration.
  3. Load and inspect local configuration schema (`src/schema.json`) to establish initial extension preferences.
  4. Cache startup state using private storage markers (e.g., `isBGInitialized`, `bgInitFail`).
- **APIs used**: `chrome.runtime.onInstalled`, `chrome.runtime.setUninstallURL`, `chrome.storage.local`.
- **Evidence**: `src/js/Grammarly-bg.js`

### 2. Supported Website Check & Heuristics Flow
- **Triggers**: Navigating to any web document.
- **Workflow Steps**:
  1. The browser checks manifest match patterns. Broad matches exist (`<all_urls>`), but are gated by a long list of site exclusions (`exclude_matches` for Outlook, Trello, Whatsapp, Wix, Overleaf, Google Docs document pages, etc.).
  2. For matched domains, the browser loads either `Grammarly-check.js` or specialized site integrations like `Grammarly.js` or `Grammarly-gDocs.js`.
  3. Content script executes at `document_idle` (or `document_start` for early injectors) and scans the DOM tree using `MutationObserver` and query selectors to verify text inputs.
  4. Check against user domain blocklists or enterprise policy configurations to see if grammar checking should be disabled.
- **APIs used**: `MutationObserver`, `document.addEventListener`, `chrome.storage.local.get`.
- **Evidence**: `src/js/Grammarly-check.js`, `src/js/Grammarly.js`

### 3. Authentication and Session Synchronization Flow
- **Triggers**: Navigation, cookie changes, or user interaction with the popup.
- **Workflow Steps**:
  1. The background script monitors changes in cookies under `*.grammarly.com` domains (`chrome.cookies.onChanged.addListener`).
  2. Syncs user login tokens (e.g. `grauth`) and managed enrollment identifiers (`GrammarlyEnrollmentToken`) to the extension session context.
  3. Uses `chrome.identity` to resolve active user accounts, enabling secure user authentication with Grammarly's login servers (`https://auth.grammarly.com`).
  4. Sets appropriate headers/tokens for socket authorization in background connections.
- **APIs used**: `chrome.cookies.onChanged`, `chrome.cookies.get`, `chrome.identity`, `chrome.storage.local`.
- **Evidence**: `src/js/Grammarly-bg.js`

### 4. Real-Time Editing and Suggestion Flow (CAPI WebSocket Loop)
- **Triggers**: Keyboard input, focus events, or editor changes in matched inputs.
- **Workflow Steps**:
  1. User edits text inside an active editor element.
  2. Content script captures text modifications, computes incremental edits, and sends Operational Transformation (OT) updates (`submit_ot`, `submit_ot_chunk`) to the background worker.
  3. Background worker relays the payload to Grammarly's CAPI WebSocket: `wss://capi.grammarly.com/` using a customized transport layer (`CAPIWebSocketTransport`).
  4. Remote WebSocket server returns real-time suggestions, grammar errors, style suggestions, and tone metrics.
  5. Background dispatches results to content script, which displays highlighting overlays in the DOM and renders card details (`SduiInlineCardRenderer`).
- **APIs used**: `chrome.runtime.onConnect`, `chrome.runtime.sendMessage`, WebSockets (`wss://`).
- **Evidence**: `src/js/Grammarly-check.js`, `src/js/Grammarly-bg.js`, `src/inkwell/assets/CAPIWebSocketTransport-DztTrDg1-DSQiisKE.js`

### 5. Analytics and Performance Telemetry Flow
- **Triggers**: Suggestion accepted/rejected, document closed, performance timer ticks, or error events.
- **Workflow Steps**:
  1. Events are raised by content scripts (`user_action`, `perfstats`) or background timers (`feMetricsAlarms`).
  2. Accumulate client performance metrics and counts into local cache store (`feMetricsData`).
  3. Dispatch batched telemetry events via POST requests to:
     - `https://gnar.grammarly.com/`
     - `https://f-log-extension.grammarly.io/logv2`
     - `https://in.grammarly.com/`
- **APIs used**: `chrome.storage.local`, `fetch()`, `performance.now()`.
- **Evidence**: `src/js/Grammarly-bg.js`, `src/js/Grammarly-check.js`


## Privacy, Security, and Compliance

### 1. Privacy Analysis & Data Categories
Grammarly's operation relies heavily on real-time natural language processing, which demands significant access to user text data and page contexts.
- **User Typed Content**: Raw keystrokes and document texts are read dynamically from matched fields.
- **Contextual URL metadata**: The active domain and page location are gathered to contextualize corrections, handle blocked sites, and tag telemetry streams.
- **Credentials & Session Identifiers**: Synchronized session cookies and identity payloads manage premium user statuses and validate socket authorizations.
- **Telemetry Event Logs**: batched diagnostic performance data and active user selections are recorded to trace UI interactions.

### 2. Concrete Observed Privacy Data Inventory
- **Typed Input Text**:
  - *Source*: Content scripts reading input elements in matched DOM nodes.
  - *Collection Trigger*: Keyboard entries, copy-paste events, and input focus changes.
  - *Storage*: Cached in memory or transient IndexedDB document states.
  - *Transmission*: WebSocket stream over TLS to `wss://capi.grammarly.com`.
  - *Purpose*: AI sentence corrections, completions, grammar diagnostics, and tone assessments.
- **Host Domain & Path URL**:
  - *Source*: Browser window location or tab metadata.
  - *Collection Trigger*: Tab focus shifting or content script injection.
  - *Storage*: Stored in memory.
  - *Transmission*: Included in WebSocket connect headers and HTTP POST telemetry uploads.
  - *Purpose*: Site support heuristics, blocklist matching, and telemetry contextualization.
- **User Authentication Identity Cookies**:
  - *Source*: Grammarly domain cookies.
  - *Collection Trigger*: Cookie state changes.
  - *Storage*: Synced to extension storage sync/local caches.
  - *Transmission*: Headers in socket requests and logins to `https://auth.grammarly.com`.
  - *Purpose*: Sync premium subscription levels and check account preferences.
- **User Clicks & UI Telemetry**:
  - *Source*: Sidepanel and popover card event listeners.
  - *Collection Trigger*: Suggestion accept/reject clicks, tab closes, button toggles.
  - *Storage*: Batched locally in `feMetricsData` local storage.
  - *Transmission*: POST requests to `https://gnar.grammarly.com` and `https://f-log-extension.grammarly.io/logv2`.
  - *Purpose*: Trace suggestion acceptance rates, client crash diagnostics, and performance debugging.

### 3. Identified Risks
- **PII Exfiltration / Text Surveillance (Severity: Medium)**:
  - *Justification*: The extension captures and transmits highly detailed document content and user typed texts over remote networks. While this matches the expected capability of an AI editor, any compromise of these networks or backend endpoints exposes raw personal identifiable data (PII) or user text contents.
  - *Evidence*: `src/js/Grammarly-check.js` (lines 1-50)
- **Insecure Storage (Severity: Low)**:
  - *Justification*: Synced preferences, performance diagnostics, and telemetry logs are written directly to standard browser local storage and IndexedDB tables without custom file-level encryption.
  - *Evidence*: `src/js/Grammarly-bg.js` (lines 1-150)
- **Fingerprinting / Profiling (Severity: Low)**:
  - *Justification*: The extension queries and logs standard user agents, acceptance languages, locale values, and exact browser name properties to generate diagnostic reports.
  - *Evidence*: `src/js/Grammarly-bg.js` (lines 1-120)




