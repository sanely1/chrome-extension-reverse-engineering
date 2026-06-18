# Analysis Notes - Grammarly Extension (kbfnbcaeplbcioakkpcpgfkobkghlhen)

## Manifest Summary

- **Name**: Grammarly: AI Writing Assistant and Grammar Checker App
- **Version**: 14.1259.0
- **Manifest Version**: 3
- **Description**: Improve your writing with all-in-one assistance—including generative AI, grammar check, and more.
- **Background Script**: `sw.js` (Service Worker)
- **Content Scripts**:
  - `src/js/Grammarly-check.styles.js`, `src/js/Grammarly-check.js` (Matches: `<all_urls>`, Excludes: large list of sites, Exclude globs: `*docs.google.com*`)
  - `src/js/Grammarly.styles.js`, `src/js/Grammarly.js` (Matches: outlook, atlassian, gmail, quora, slack, etc.)
  - `src/js/Grammarly-gDocs.styles.js`, `src/js/Grammarly-gDocs.js` (Matches: `*://docs.google.com/document/*`)
  - `src/js/Grammarly-gDocsEarlyInjector.js` (Matches: `*://docs.google.com/document/*`)
  - `src/js/Grammarly-gDocsIframeCs.js` (Matches: `*://docs.google.com/*`, Excludes: document)
  - `src/js/Grammarly-overleafStartContentScript.js` (Matches: Overleaf)
- **UI Elements**:
  - Popup: `src/popup.html`
  - Side Panel: `src/sidePanel.html`
- **Permissions**: `scripting`, `sidePanel`, `tabs`, `notifications`, `cookies`, `identity`, `storage`
- **Host Permissions**: `http://*/*`, `https://*/*`
- **Optional Permissions**: `nativeMessaging`, `clipboardRead`
- **Externally Connectable**: `https://*.grammarly.com/*`
- **Evidence**: `extension/manifest.json`

## Discovered Artifacts

### File Chunk Findings: extension/sw.js (whole-file)

### File Chunk Findings: extension/src/js/Grammarly-bg.js (chunk-11/46)
- **Risks identified**: remote_code

### File Chunk Findings: extension/src/js/Grammarly-bg.js (chunk-13/46)
- **Risks identified**: remote_code

### File Chunk Findings: extension/src/js/Grammarly-bg.js (chunk-20/46)
- **APIs**: chrome.runtime.sendMessage, chrome.runtime.getURL
- **Endpoints**: https://assets.grammarly.com/icons/v1/ai-studio-icon-lg.svg, https://assets.grammarly.com/icons/v1/ai-studio-icon-lg.svg
- **Risks identified**: remote_code

### File Chunk Findings: extension/src/js/Grammarly-bg.js (chunk-21/46)
- **APIs**: chrome.runtime.getManifest, chrome.runtime.id
- **Endpoints**: https://config.extension.grammarly.com/dynamicConfig.json, https://config.extension.grammarly.com/browserplugin/config.json, https://f-log-extension.grammarly.io...
- **Risks identified**: tracking, remote_code

### File Chunk Findings: extension/src/js/Grammarly-bg.js (chunk-23/46)
- **Endpoints**: https://auth.grammarly.com/v4/api/oauth2/authorize, https://auth.grammarly.com/v4/api/oauth2/exchange, https://auth.grammarly.com/v4/api/oauth2/token...

### File Chunk Findings: extension/src/js/Grammarly-bg.js (chunk-24/46)
- **APIs**: chrome.runtime, chrome.runtime.lastError, chrome.runtime.id

### File Chunk Findings: extension/src/js/Grammarly-bg.js (chunk-25/46)
- **APIs**: chrome.runtime, chrome.runtime.lastError, chrome.cookies.set, chrome.cookie.set, chrome.cookies.remove...

### File Chunk Findings: extension/src/js/Grammarly-bg.js (chunk-26/46)
- **Endpoints**: https://gateway.grammarly.com/authorship/v1/

### File Chunk Findings: extension/src/js/Grammarly-bg.js (chunk-27/46)

### File Chunk Findings: extension/src/js/Grammarly-bg.js (chunk-29/46)

### File Chunk Findings: extension/src/js/Grammarly-bg.js (chunk-43/46)
- **APIs**: chrome.extension, chrome.tabs, chrome.runtime, chrome.runtime.onConnect, chrome.runtime.lastError...

### File Chunk Findings: extension/src/js/Grammarly-check.js (chunk-1/8)
- **APIs**: chrome.runtime.getManifest, chrome.runtime.id
- **Endpoints**: https://f-log-extension.grammarly.io, https://extension.femetrics.grammarly.io/batch/import, https://api.iterable.com
- **Risks identified**: tracking

### File Chunk Findings: extension/src/js/Grammarly-check.js (chunk-2/8)
- **APIs**: chrome.toolbar.popup
- **Endpoints**: https://config.extension.grammarly.com/dynamicConfig.json, https://config.extension.grammarly.com/browserplugin/config.json
- **Risks identified**: remote_code

### File Chunk Findings: extension/src/js/Grammarly-check.js (chunk-5/8)
- **APIs**: chrome.runtime.sendMessage, chrome.runtime.getURL, chrome.runtime.getManifest, chrome.runtime
- **Risks identified**: remote_code

### File Chunk Findings: extension/src/js/Grammarly-check.js (chunk-7/8)
- **APIs**: chrome.runtime, chrome.runtime.lastError, chrome.storage.managed.get, chrome.storage, chrome.tabs.executeScript...
- **Endpoints**: https://auth.grammarly.com/v4/api/oauth2/authorize, https://auth.grammarly.com/v4/api/oauth2/exchange, https://auth.grammarly.com/v4/api/oauth2/token...

### File Chunk Findings: extension/src/js/Grammarly-check.js (chunk-8/8)
- **APIs**: chrome.permissions.contains, chrome.runtime.lastError, chrome.runtime.getURL, chrome.sidePanel, chrome.sidePanel.open...

### File Chunk Findings: extension/src/js/Grammarly.js (chunk-1/48)
- **Endpoints**: https://assets.grammarly.com/emoji/v1/, https://assets.grammarly.com/animations/v1/

### File Chunk Findings: extension/src/js/Grammarly.js (chunk-11/48)
- **APIs**: chrome.runtime.lastError, chrome.storage.managed.get, chrome.storage, chrome.tabs.executeScript, chrome.scripting.executeScript...

### File Chunk Findings: extension/src/js/Grammarly.js (chunk-18/48)
- **Storage keys**: gdocs_peak_collabs_dismissed

### File Chunk Findings: extension/src/js/Grammarly.js (chunk-21/48)
- **Storage keys**: gdocs_peak_collabs_dismissed

### File Chunk Findings: extension/src/js/Grammarly.js (chunk-26/48)

### File Chunk Findings: extension/src/js/Grammarly.js (chunk-28/48)
- **APIs**: chrome.runtime.getManifest, chrome.runtime.id
- **Endpoints**: https://f-log-extension.grammarly.io, https://extension.femetrics.grammarly.io/batch/import, https://api.iterable.com...
- **Risks identified**: tracking, remote_code

### File Chunk Findings: extension/src/js/Grammarly.js (chunk-29/48)

### File Chunk Findings: extension/src/js/Grammarly.js (chunk-44/48)

### File Chunk Findings: extension/src/js/Grammarly.js (chunk-46/48)
- **Endpoints**: https://auth.grammarly.com/v4/api/oauth2/authorize, https://auth.grammarly.com/v4/api/oauth2/exchange, https://auth.grammarly.com/v4/api/oauth2/token...

### File Chunk Findings: extension/src/js/Grammarly.js (chunk-48/48)
- **APIs**: chrome.runtime.sendMessage, chrome.runtime.getURL
- **Risks identified**: remote_code

### File Chunk Findings: extension/src/js/Grammarly-gDocs.js (chunk-1/53)
- **Endpoints**: https://assets.grammarly.com/emoji/v1/, https://assets.grammarly.com/animations/v1/

### File Chunk Findings: extension/src/js/Grammarly-gDocs.js (chunk-11/53)
- **APIs**: chrome.runtime.lastError, chrome.storage.managed.get, chrome.storage, chrome.tabs.executeScript, chrome.scripting.executeScript...

### File Chunk Findings: extension/src/js/Grammarly-gDocs.js (chunk-13/53)
- **APIs**: chrome.storage, chrome.runtime.id, chrome.runtime.onMessage, chrome.runtime.sendMessage, chrome.runtime.getManifest...

### File Chunk Findings: extension/src/js/Grammarly-gDocs.js (chunk-19/53)
- **Storage keys**: gdocs_peak_collabs_dismissed

### File Chunk Findings: extension/src/js/Grammarly-gDocs.js (chunk-21/53)
- **Storage keys**: gdocs_peak_collabs_dismissed

### File Chunk Findings: extension/src/js/Grammarly-gDocs.js (chunk-30/53)

### File Chunk Findings: extension/src/js/Grammarly-gDocs.js (chunk-32/53)
- **APIs**: chrome.runtime.getManifest, chrome.runtime.id
- **Endpoints**: https://f-log-extension.grammarly.io, https://extension.femetrics.grammarly.io/batch/import, https://api.iterable.com
- **Risks identified**: tracking

### File Chunk Findings: extension/src/js/Grammarly-gDocs.js (chunk-33/53)
- **Endpoints**: https://config.extension.grammarly.com/dynamicConfig.json, https://config.extension.grammarly.com/browserplugin/config.json
- **Risks identified**: remote_code

### File Chunk Findings: extension/src/js/Grammarly-gDocs.js (chunk-49/53)

### File Chunk Findings: extension/src/js/Grammarly-gDocs.js (chunk-52/53)
- **Endpoints**: https://auth.grammarly.com/v4/api/oauth2/authorize, https://auth.grammarly.com/v4/api/oauth2/exchange, https://auth.grammarly.com/v4/api/oauth2/token...

### File Chunk Findings: extension/src/js/Grammarly-gDocs.js (chunk-53/53)
- **APIs**: chrome.runtime.sendMessage, chrome.runtime.getURL
- **Risks identified**: remote_code

### File Chunk Findings: extension/src/js/Grammarly-gDocsEarlyInjector.js (whole-file)
- **APIs**: chrome.runtime.id, chrome.runtime.getURL
- **Listeners**: addListener:e

### File Chunk Findings: extension/src/js/Grammarly-gDocsIframeCs.js (chunk-2/5)
- **APIs**: chrome.runtime.getManifest, chrome.runtime.id
- **Endpoints**: https://config.extension.grammarly.com/dynamicConfig.json, https://config.extension.grammarly.com/browserplugin/config.json, https://f-log-extension.grammarly.io...
- **Risks identified**: tracking, remote_code

### File Chunk Findings: extension/src/js/Grammarly-gDocsIframeCs.js (chunk-4/5)
- **APIs**: chrome.runtime, chrome.runtime.lastError, chrome.storage.managed.get, chrome.storage, chrome.tabs.executeScript...

### File Chunk Findings: extension/src/js/Grammarly-gDocsIframeCs.js (chunk-5/5)
- **APIs**: chrome.tabs.remove, chrome.tabs.update, chrome.tabs.sendMessage, chrome.tabs.onUpdated, chrome.tabs.onRemoved...

### File Chunk Findings: extension/src/js/Grammarly-overleafStartContentScript.js (whole-file)
- **APIs**: chrome.runtime.getURL, chrome.runtime.id

### File Chunk Findings: extension/src/js/Grammarly-popup.js (chunk-8/26)
- **APIs**: chrome.runtime.getURL, chrome.runtime.getPlatformInfo
- **Endpoints**: https://gateway.grammarly.com/api/jira/tickets/create

### File Chunk Findings: extension/src/js/Grammarly-popup.js (chunk-9/26)
- **APIs**: chrome.runtime.getManifest, chrome.runtime.id, chrome.runtime, chrome.runtime.lastError
- **Endpoints**: https://f-log-extension.grammarly.io, https://extension.femetrics.grammarly.io/batch/import, https://api.iterable.com...
- **Risks identified**: tracking, remote_code

### File Chunk Findings: extension/src/js/Grammarly-popup.js (chunk-20/26)

### File Chunk Findings: extension/src/js/Grammarly-popup.js (chunk-25/26)
- **APIs**: chrome.runtime.sendMessage, chrome.runtime.getURL, chrome.runtime.lastError, chrome.storage.managed.get, chrome.storage...
- **Risks identified**: remote_code

### File Chunk Findings: extension/src/js/Grammarly-popup.js (chunk-26/26)
- **APIs**: chrome.runtime.getURL, chrome.action, chrome.browserAction, chrome.storage, chrome.notifications...

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-1/88)
- **Endpoints**: https://assets.grammarly.com/emoji/v1/, https://assets.grammarly.com/animations/v1/

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-3/88)
- **Endpoints**: https://assets.grammarly.com/icons/v1/ai-studio-icon.svg, https://assets.grammarly.com/icons/v1/ai-studio-icon.svg, https://assets.grammarly.com/cheetah/v1/actions/simplify.svg...

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-4/88)
- **Endpoints**: https://assistant.femetrics.grammarly.io
- **Risks identified**: tracking

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-11/88)
- **Endpoints**: https://assets.grammarly.com/cheetah/v1/voice-profile/cheetah-my-voice-bg.svg)

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-30/88)
- **APIs**: chrome.runtime.lastError, chrome.storage.managed.get, chrome.storage, chrome.tabs.executeScript, chrome.scripting.executeScript...

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-31/88)
- **APIs**: chrome.management.uninstallSelf, chrome.runtime.getURL, chrome.permissions, chrome.permissions.onAdded.addListener, chrome.permissions.onAdded.removeListener...

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-32/88)
- **APIs**: chrome.runtime.getManifest, chrome.runtime.id, chrome.runtime, chrome.runtime.lastError
- **Endpoints**: https://f-log-extension.grammarly.io, https://extension.femetrics.grammarly.io/batch/import, https://api.iterable.com...
- **Risks identified**: tracking, remote_code

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-39/88)

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-44/88)

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-54/88)
- **Risks identified**: remote_code

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-55/88)
- **Risks identified**: remote_code

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-59/88)

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-60/88)
- **Endpoints**: https://assets.grammarly.com/icons/v1/ai-studio-icon-lg.svg, https://assets.grammarly.com/icons/v1/ai-studio-icon-lg.svg

### File Chunk Findings: extension/src/js/Grammarly-sidePanel.js (chunk-88/88)
- **APIs**: chrome.runtime.sendMessage, chrome.runtime.getURL
- **Risks identified**: remote_code

## Architectural Components

The Grammarly extension consists of four primary structural tiers:

1. **Background Service Worker (`sw.js` / `src/js/Grammarly-bg.js`)**:
   - Orchestrates port-based communication (channels: `"message:to-priv"`, `"side-panel-close-status"`, `"message-bus-port"`).
   - Manages dynamic configuration syncing from `config.extension.grammarly.com`.
   - Handles the authentication lifecycle, OAuth2 authorization exchanges, and session token persistence.
   - Proxies server communications for checking and writing suggestions to the remote `capi.grammarly.com` and `dox.grammarly.com` servers.

2. **Content Scripts (`src/js/Grammarly.js`, `src/js/Grammarly-check.js`, `src/js/Grammarly-gDocs.js`)**:
   - Injected into all matching page contexts (and Google Docs specifically).
   - Monitors user text areas and input fields via the DOM and MutationObservers.
   - Extracts page-level and document metadata.
   - Performs text segmentation and delta compression, routing spelling and style checking payloads to the background service worker or directly.
   - Renders in-line highlights, suggestions cards, and floating widgets.

3. **User Interface Components**:
   - **Popup (`src/js/Grammarly-popup.js`)**: Displays the extension state, enables user logins, sets custom toggles, and coordinates toolbar status.
   - **Side Panel (`src/js/Grammarly-sidePanel.js`)**: Modern Global Writing Assistant UI, housing suggestions detail lists, tone adjusters, and AI content rewrite blocks.

4. **Remote Services**:
   - **`capi.grammarly.com` & `dox.grammarly.com`**: Primary grammar, spelling, and semantic checking engines.
   - **`gnar.grammarly.com` & `femetrics.grammarly.io`**: High-frequency telemetric and behavioral event logging.
   - **`auth.grammarly.com`**: OAuth2 access token and userInfo managers.

## Communication Flows

All communications flow patterns are defined inside `flows.puml` in PlantUML format.

1. **User typing feedback**: `User Input` -> `MutationObserver/DOM` -> `Content Script` -> `Background Service Worker` -> `Text Processing Engine (capi.grammarly.com)` -> `Content Script` -> `In-line Highlights/Injected UI`.
2. **Auth propagation**: `Popup / Login Click` -> `Background Script` -> `auth.grammarly.com (OAuth2 Flow)` -> `Token Storage (storage.local / cookies)`.
3. **Telemetry collection**: `User UI Action` -> `femetrics / GNAR Log` -> `femetrics.grammarly.io / gnar.grammarly.com (HTTP POST)`.

## Core Workflows

The extension executes six primary behaviors, each mapped directly to underlying source implementation blocks:

### 1. Installation and Onboarding Workflow
- **Trigger**: `chrome.runtime.onInstalled` / Extension startup.
- **Ordered Steps**:
  1. Initializes local state preferences (e.g., default dialect: `"en-US"`, dictionary overrides, site bypasses).
  2. Sets up the uninstall URL to route users back to Grammarly feedback portal: `chrome.runtime.setUninstallURL("https://www.grammarly.com/uninstall...")`.
  3. Spawns introductory welcome/onboarding tab.
- **Evidence**: `extension/src/js/Grammarly-bg.js` (line 84898).

### 2. Supported Site Detection & Config Sync
- **Trigger**: Web page loaded or background worker initializes.
- **Ordered Steps**:
  1. Background script polls dynamic config files from `https://config.extension.grammarly.com/dynamicConfig.json` and `https://config.extension.grammarly.com/browserplugin/config.json`.
  2. Resolves current site domain against content scripts match exclusion tables (e.g., skips Outlook, Jira, Salesforce when needed).
  3. Fetches user treatment rules and experiment gates to decide if SidePanel or specific AI widgets are enabled.
- **Evidence**: `extension/src/js/Grammarly-bg.js` (line 84890, 85011).

### 3. Real-time Document Checking & Writing Assistance
- **Trigger**: User types, modifies input selections, or triggers document editor updates.
- **Ordered Steps**:
  1. Content script hooks events (keystrokes, text input) and parses input elements or Google Docs document nodes using MutationObservers.
  2. Segments text blocks and calculates delta edits to minimize latency.
  3. Packages and routes document content to background script via Port channel `"message:to-priv"`.
  4. Background worker proxies or direct sockets dispatch checking requests to Grammarly server cores (`capi.grammarly.com` / `dox.grammarly.com`).
  5. Content script processes the returns and paints underlines, displays suggestions hover-cards, or highlights edits.
- **Evidence**: `extension/src/js/Grammarly.js` (chunk-28/48), `extension/src/js/Grammarly-bg.js` (line 47808).

### 4. Authentication and Session Integration
- **Trigger**: Extension starts up, popup opens, or user clicks "Log In".
- **Ordered Steps**:
  1. Content or background script checks authorization status via cookies or `chrome.storage.local`.
  2. Redirects to `https://auth.grammarly.com/v4/api/oauth2/authorize` for browser SSO or logs in via Google/identity provider.
  3. Exchanges authorization code for access tokens at `https://auth.grammarly.com/v4/api/oauth2/token`.
  4. Resolves user details (`v4/api/userinfo`) and writes persistent states into sync storage, activating premium rules.
- **Evidence**: `extension/src/js/Grammarly-bg.js` (chunk-23/46).

### 5. Telemetry & High-frequency Product Tracking
- **Trigger**: Accept suggestions, close widget, select text, dismiss popup, or input typed.
- **Ordered Steps**:
  1. Event handlers in content script or sidePanel record behavior payload (including identifiers and context keys).
  2. Batches and queues events locally to avoid network thrashing.
  3. Transmits JSON packets via HTTP POST requests to `https://gnar.grammarly.com` and `https://extension.femetrics.grammarly.io/batch/import`.
- **Evidence**: `extension/src/js/Grammarly-bg.js` (chunk-21/46), `extension/src/js/Grammarly-sidePanel.js` (chunk-4/88).

### 6. Interactive Writing SidePanel Integration
- **Trigger**: User opens SidePanel via toolbar click or suggested correction expansion.
- **Ordered Steps**:
  1. UI initializes rendering elements using `css/assistantUiKit.styles.css` and `css/Grammarly-sidePanel.styles.css`.
  2. Renders rephrasing cards and fetches remote SVG assets (voice profiles, tone indicators, suggestions illustrations) from `https://assets.grammarly.com/...`.
  3. Communicates rewrite prompts back to background proxy to invoke AI generative models, writing the results back into the user document.
- **Evidence**: `extension/src/js/Grammarly-sidePanel.js` (chunk-3/88, chunk-4/88).

## Privacy, Security, and Compliance Analysis

This section analyzes the extension's privacy postures, concrete data flows, and security risk indicators discovered during code audit.

### 1. Privacy Posture Summary
- **Data Categories Collected**: Full document text, selection/highlights, cookies, access tokens, machine/install IDs, UI interaction logs, settings.
- **Observed Purposes**: Spell checking, automated rephrasing, generative AI text completion, session management, product telemetry.
- **Data Minimization Evaluation**: The extension reads and transmits raw text typed by users into text areas across `<all_urls>` (with specific site exclusions). This high-fidelity access is necessary for grammar check but results in significant exposure of personal, professional, or sensitive data.
- **User Control and Consent**: Toggles are provided in the popup to pause checking on the active domain. Standard implicit consent applies.
- **Data Retention**: Unknown (server-side parameters). Local access tokens are retained indefinitely in sync/local storage or cookies until an explicit logout is triggered.
- **Third-Party Recipients**: Telemetry is routed directly to `gnar.grammarly.com`, `femetrics.grammarly.io`, and `api.iterable.com`.

### 2. Concrete Observed Privacy Data Flows
1. **Document Content**: Raw text segments typed by the user. Transmitted to `capi.grammarly.com` or `dox.grammarly.com` via background socket proxy to perform real-time editing check. Triggered by text input events.
2. **Authentication Credentials**: JWT/OAuth2 access keys and refresh tokens. Saved in `chrome.storage.local` and browser cookies. Exchanged with `auth.grammarly.com` during login and session refresh.
3. **User Telemetry & Behavior Event Logs**: High-frequency click events, accepts/dismissals of suggestions, and hover records. Buffered in memory and POSTed to `gnar.grammarly.com` / `femetrics.grammarly.io`.
4. **Extension Settings**: Language preference, ignored words, and excluded domains list. Saved locally in `chrome.storage.local` and synchronized.

### 3. Key Risks Identified

- **Risk: Telemetry Tracking (Severity: Medium)**: Continuous product usage telemetry and distinct client identifiers are shipped to GNAR and Femetrics endpoints. This behavioral tracking is conducted silently in the background.
  - *Evidence*: `extension/src/js/Grammarly-bg.js` (lines 85019-85025).
- **Risk: Dynamic Runtime Configuration (Severity: Medium)**: Feature flags, code paths, and experimental treatments are resolved dynamically from remote JSON config servers, bypassing static extension bundle reviews.
  - *Evidence*: `extension/src/js/Grammarly-bg.js` (line 84890).
- **Risk: High Exposure of Inputted PII (Severity: Medium)**: Operating on `<all_urls>` means any typed text (which can include credentials, emails, or financial forms) is read by content scripts and sent externally, unless site-specific exclusions match.
  - *Evidence*: `extension/manifest.json` (line 315).




