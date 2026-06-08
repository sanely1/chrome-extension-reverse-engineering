# Analysis Notes

Extension ID: kbfnbcaeplbcioakkpcpgfkobkghlhen
Model: gemini-3.5-flash
Date: Sun Jun 07 2026

## Setup & Initialization
Run directory `./out_001_gemini-3.5-flash` created.
Initial tracking files successfully created.

## Step 1: Manifest & Metadata Inventory
Successfully parsed `extension/manifest.json`.

### Metadata Summary
- **Name**: Grammarly: AI Writing Assistant and Grammar Checker App (Resolved directly from manifest.json)
- **Short Name**: Superhuman Go (Beta)
- **Version**: 14.1259.0
- **Description**: Improve your writing with all-in-one assistance—including generative AI, grammar check, and more.
- **Manifest Version**: 3
- **Minimum Chrome Version**: 88

### Permissions & Security Boundaries
- **Permissions**: `scripting`, `sidePanel`, `tabs`, `notifications`, `cookies`, `identity`, `storage` (manifest.json, lines 322-330)
- **Host Permissions**: `http://*/*`, `https://*/*` (manifest.json, lines 315-318) - Enables full web access across all HTTP/HTTPS endpoints.
- **Optional Permissions**: `nativeMessaging`, `clipboardRead` (manifest.json, lines 357-360)

### Major Architectural Entry Points
- **Background Service Worker**: `sw.js` (manifest.json, lines 9-11)
- **Content Scripts**:
  1. `src/js/Grammarly-check.js` (matches `<all_urls>`, runs at `document_idle`, line 21)
  2. `src/js/Grammarly.js` (matches 70+ domains like atlassian.net, slack.com, facebook.com, runs at `document_idle`, line 132)
  3. `src/js/Grammarly-gDocs.js` (matches `*://docs.google.com/document/*`, runs at `document_idle`, line 255)
  4. `src/js/Grammarly-gDocsEarlyInjector.js` (matches `*://docs.google.com/document/*`, runs at `document_start`, line 265)
  5. `src/js/Grammarly-gDocsIframeCs.js` (matches `*://docs.google.com/*`, runs at `document_idle`, line 276)
  6. `src/js/Grammarly-overleafStartContentScript.js` (matches `https://*.overleaf.com/*`, runs at `document_start`, line 289)
- **UI Interfaces**:
  - Popup: `src/popup.html` (manifest.json, lines 4-8)
  - Side Panel: `src/sidePanel.html` (manifest.json, lines 306-308)

### Content Security Policy (CSP) Allowed connect-src Domains
The extension defines a massive list of allowed connections in its CSP:
- `https://auth.grammarly.com` (Auth and session handling)
- `https://capi.grammarly.com` / `wss://capi.grammarly.com` (Main Grammarly API communication and WebSockets)
- Telemetry/logging: `https://data.grammarly.com`, `https://gnar.grammarly.com`, `https://in.grammarly.com`, `https://f-log-extension.grammarly.io`, `https://f-log-editor.grammarly.io`, `https://f-log-inkwell.grammarly.io`, `https://femetrics.grammarly.io`
- Config/Experiments: `https://config.extension.grammarly.com`, `https://treatment.grammarly.com`, `https://gates.grammarly.com`, `https://goldengate.grammarly.com`
- Generative AI & Skills: `https://skills.grammarly.com`, `https://skills-proxy.grammarly.com`, `https://gateway.grammarly.com`
- Collaborations/Integrations: `https://coda.io`, `https://codahosted.io`
- Email marketing: `https://api.iterable.com`

## Step 4: Components and Flows
Identified the architectural classification and verified communications mapping.

### Component Breakdown
1. **Background**: `sw.js` acts as the service worker entry point, loading/registering `src/js/Grammarly-bg.js` which maintains the core business logic.
   - *APIs used*: `chrome.cookies`, `chrome.identity`, `chrome.storage`, `chrome.runtime`, `chrome.tabs`, `chrome.permissions`, `chrome.sidePanel`, `chrome.notifications`, `chrome.action`
   - *Listeners registered*: `chrome.runtime.onMessage.addListener`, `chrome.runtime.onConnect.addListener`, `chrome.cookies.onChanged.addListener`, `chrome.permissions.onAdded.addListener`, `chrome.permissions.onRemoved.addListener`
   - *Key behaviors*: Manages configuration state, coordinates authentication, starts alarms for metrics, opens sidepanel assistant, acts as central messaging broker, maintains cookie synchronization.
2. **Content Scripts**: Injected into target webpages (`<all_urls>` or surface-specific domains) to scrape text, intercept editor canvas structures, render suggestion cards inline, and proxy messaging.
   - *Key Scripts*:
     - `Grammarly-check.js` (Global loader context)
     - `Grammarly.js` (Rich editor surfaces injection like Gmail, Slack, Twitter)
     - `Grammarly-gDocs.js` & `Grammarly-gDocsEarlyInjector.js` (Bespoke Google Docs canvas synchronization and iframe integrations)
   - *APIs used*: `chrome.runtime.sendMessage`, `chrome.runtime.onMessage.addListener`
   - *Key behaviors*: Reads DOM text structures, listens for user input events, intercepts Document canvas renders, displays Grammarly UI widget layers.
3. **UI Elements**: Popup & Side Panel
   - *Scripts*: `Grammarly-popup.js` (Extension popup) and `Grammarly-sidePanel.js` (Side Panel editor assistance)
   - *APIs used*: `chrome.runtime.sendMessage`, `chrome.runtime.onMessage.addListener`, `chrome.storage.local.get`
   - *Key behaviors*: Render custom settings panel, login interfaces, show status checks, render side panel chat interface for generative AI assistant.
4. **Sandboxed Pages / Custom iframe bridges**:
   - *Key Components*: `src/inkwell/index.html` (Inkwell custom editor) and `src/gOS-sandbox.html`
   - *Key behaviors*: Hosts localized editor components, handles WebSocket channels (`capiWebSocketMessage`) and synchronizes text document states.
5. **Remote Services**:
   - *Primary REST/WS APIs*: `wss://capi.grammarly.com` (CAPI protocol via WebSocket for real-time proofreading), `https://auth.grammarly.com` (Identity & account), `https://config.extension.grammarly.com` (Experiment gating), `https://f-log-extension.grammarly.io` (Diagnostic logging).

### Flow Interactions (Mapped to PlantUML)
- **User Input -> Injected UI**: User inputs text in a webpage text area. Content script (`Grammarly.js`) intercepts the input.
- **Content Script -> Background**: CS packages text differences and sends an asynchronous message (`chrome.runtime.sendMessage`) to the background broker.
- **Background -> Remote Engine**: BG coordinates state and forwards the document updates over the active WebSocket transport to `wss://capi.grammarly.com`.
- **Remote Engine -> Background -> Content Script**: Core Grammarly analysis engine responds with proofreading diagnostics. BG routes this back to the content script, which paints card highlights and corrective recommendations inline.
- **Side Panel Assistant -> AI Gateway**: Side panel assistant communicates with `https://skills.grammarly.com` to deliver generative AI writing capabilities (rephrasing, tone adjustments).

## Step 5: Core Workflows
Clustered related operations into six distinct core behavioral workflows, and compiled candidate & review tables inside the `census` subfolder.

### Mapped Core Workflows
1. **Extension Lifecycle and Onboarding**:
   - *Trigger*: `chrome.runtime.onInstalled` or `chrome.runtime.onStartup`.
   - *Steps*: 
     1. Service Worker (`sw.js`) activates.
     2. Fetches remote experiments, gating config, and rules from `https://config.extension.grammarly.com`.
     3. Initializes internal flags in `chrome.storage.local` (`isBGInitialized`, `bgInitFail`).
     4. Sets up the uninstall page redirect via `chrome.runtime.setUninstallURL`.
   - *Evidence File*: `extension/src/js/Grammarly-bg.js`
2. **Authentication and User Session**:
   - *Trigger*: `chrome.cookies.onChanged` or user action triggering SSO auth flow.
   - *Steps*: 
     1. Background worker listens to changes on Grammarly auth cookies.
     2. Synchronizes identity state with `https://auth.grammarly.com`.
     3. Saves or updates the `GrammarlyEnrollmentToken` in `chrome.storage.local`.
   - *Evidence File*: `extension/src/js/Grammarly-bg.js`
3. **Real-Time Document Analysis (CAPI)**:
   - *Trigger*: User edits text or enters characters in text areas/inputs on supported domains.
   - *Steps*:
     1. Content script (`Grammarly.js`) intercepts keystrokes.
     2. Delivers text delta edits via `chrome.runtime.sendMessage` using the custom CAPI messaging protocol (`capiWebSocketMessage`).
     3. Background script receives edits and streams them via WebSocket to `wss://capi.grammarly.com`.
     4. Background caches document metadata inside IndexedDB database stores (`document_state`, `document_state_enc`).
     5. Diagnostic results are returned and rendered as inline card highlights in the page.
   - *Evidence Files*: `extension/src/js/Grammarly-bg.js`, `extension/src/js/Grammarly.js`
4. **Telemetry and Diagnostics**:
   - *Trigger*: Scheduled alarm events (`feMetricsAlarms`).
   - *Steps*:
     1. Periodic timer fires, triggering check on cached telemetry buffer.
     2. Reads events, performance benchmarks, or error reports stored in local storage (`feMetricsData`).
     3. Emits structured payloads to `https://femetrics.grammarly.io` or `https://data.grammarly.com`.
   - *Evidence Files*: `extension/src/js/Grammarly-bg.js`, `extension/src/js/Grammarly.js`
5. **Generative Writing Assistant (Side Panel)**:
   - *Trigger*: User clicks Grammarly widget icon or triggers Side Panel action.
   - *Steps*:
     1. User interaction calls `chrome.sidePanel.open` to launch the side panel frame (`src/sidePanel.html`).
     2. Assistant component (`Grammarly-sidePanel.js`) fetches state context via `alwaysOnAssistantOnOpenData` message.
     3. Sends generative text prompts to the Grammarly AI Gateway `https://skills.grammarly.com`.
     4. Renders generative rewriting options in side panel view.
   - *Evidence Files*: `extension/src/js/Grammarly-sidePanel.js`, `extension/src/js/Grammarly-bg.js`
6. **Google Docs Canvas Integration**:
   - *Trigger*: Opening any Google Doc URL matching `docs.google.com/document/*`.
   - *Steps*:
     1. `Grammarly-gDocsEarlyInjector.js` runs at `document_start` to override Google Docs canvas rendering mechanisms.
     2. Canvas content script (`Grammarly-gDocs.js`) is injected to read canvas coordinates and synchronizes keystroke editing states over custom message frames.
     3. Displays specialized collaboration notifications which can be dismissed (`gdocs_peak_collabs_dismissed`).
   - *Evidence File*: `extension/src/js/Grammarly-gDocs.js`

## Step 6: Privacy, Security, Compliance
Conducted a thorough privacy and risk assessment of the extension, creating the `privacy_signal_matrix.csv`, `privacy_candidate_review.csv`, `risk_candidate_review.csv`, and `privacy_risk_evidence_review.csv` under the `census` subfolder.

### Mapped Privacy-Relevant Data Flows
1. **User Written Content**: Text edits typed by the user in text areas, editor canvases, or inputs are captured and formatted into operational transformation (OT) deltas. These are transmitted to the cloud engine (`wss://capi.grammarly.com`) for analysis and are encrypted/stored inside local IndexedDB stores (`document_state_enc`, `document_state`). (Evidence: `extension/src/js/Grammarly-bg.js`, line 2,2)
2. **Authentication Session Tokens**: User session logins, SSO parameters, and cookies are actively synchronized with `https://auth.grammarly.com` and stored inside localized browser sync settings (`GrammarlyEnrollmentToken`). (Evidence: `extension/src/js/Grammarly-bg.js`, line 2,2)
3. **Client Telemetry and Performance Reports**: Diagnosed client errors, metrics, event tracking tags, and performance variables are periodically synced from local storage buffers (`feMetricsData`) and uploaded to metrics logging end points (`https://femetrics.grammarly.io`). (Evidence: `extension/src/js/Grammarly-bg.js`, line 2,2)

### Mapped Security & Compliance Risks
1. **Cloud Text Transmission (Severity: Medium)**: Continuous real-time transmission of written document content to `wss://capi.grammarly.com` presents an inherent privacy tracking risk as user inputs could contain sensitive personal or confidential details. (Evidence: `extension/src/js/Grammarly-bg.js`, line 2,2)
2. **Excessive Broad Host Permissions (Severity: Low)**: Manifest declares broad host permissions (`http://*/*`, `https://*/*`), which technically exposes wide DOM capabilities across the web, though restricted via target website exclusion matches in the script declarations. (Evidence: `extension/manifest.json`, lines 315-318)
3. **Cross-domain Cookie Monitoring (Severity: Low)**: Accessing the `cookies` permission and listening to `chrome.cookies.onChanged` allows monitoring of authentication cookies to synchronize Grammarly's user status, posing a slight security risk that is mitigated by restricting cookie captures specifically to Grammarly identities. (Evidence: `extension/manifest.json`, lines 322-330)
