# Analysis Notes - Grammarly (kbfnbcaeplbcioakkpcpgfkobkghlhen)

Initial analysis notes.

## Discovered Core Workflows

### 1. Installation or Onboarding Flow
- **Triggers**: Extension installed/updated (`chrome.runtime.onInstalled`).
- **Steps**: Initializes storage, registers background service worker state, sets `isBGInitialized` inside sessionStorage to manage background service worker lifecycle (`FV.StartType.firstStart` vs `wakeUp`), sends installation telemetry `sendFemetricsRate("pingDaily")`.
- **APIs**: `chrome.runtime.onInstalled`, `chrome.storage.session.set`, `chrome.storage.local.set`
- **Storage Keys**: `isBGInitialized`
- **Evidence**: `extension/sw.js` / `src/js/Grammarly-bg.js`

### 2. Heuristic/Configuration Fetch Flow
- **Triggers**: Tab connection or timer.
- **Steps**: Fetches experiment flags, checks gates (`isGateEnabled` for `ShowPerformanceCard` or `AssistantInSidePanel`), downloads treatments.
- **APIs**: `chrome.storage.local.get`
- **Endpoints**: `https://config.extension.grammarly.com`, `https://treatment.grammarly.com`, `https://gates.grammarly.com`
- **Storage Keys**: `feMetricsAlarms`
- **Evidence**: `src/js/Grammarly-bg.js`

### 3. Writing Diagnostics / Real-time Text Correction Flow
- **Triggers**: DOM mutations on text fields, keypress events.
- **Steps**: Content scripts intercept writing using observers/listeners, send text change events via `chrome.runtime.sendMessage`, background worker relays text payload over a Secure WebSocket connection to `wss://capi.grammarly.com/fpws` (CAPI check), receives suggestions, background worker forwards corrections back to content script, content script highlights errors (underlines) and injects floats (widget).
- **APIs**: `chrome.runtime.sendMessage`, `chrome.runtime.onMessage.addListener`
- **Messages**: `CODE_SPLITTING_INJECT`
- **Endpoints**: `wss://capi.grammarly.com/fpws`
- **Storage Keys**: `human_writing_report` (IndexedDB for caching results)
- **Evidence**: `src/js/Grammarly-bg.js`, `src/js/Grammarly-check.js`

### 4. Telemetry & Client Performance Metrics Flow
- **Triggers**: Scheduled intervals or event-driven triggers.
- **Steps**: Gnar client logs events (`gnar.track`), metrics logger compiles rates/timers, caches in sessionStorage `feMetricsData` or `feMetricsAlarms`, flushes metrics in batches via `fetch` to `https://inkwell.femetrics.grammarly.io/batch/import` or `https://f-log-extension.grammarly.io/batch/log`.
- **APIs**: `chrome.storage.session.get`, `chrome.storage.session.set`, `chrome.alarms`
- **Messages**: `gnar.track`
- **Endpoints**: `https://f-log-extension.grammarly.io/logv2`, `https://inkwell.femetrics.grammarly.io/batch/log`, `https://inkwell.femetrics.grammarly.io/batch/import`
- **Storage Keys**: `feMetricsData`, `feMetricsAlarms`
- **Evidence**: `src/js/Grammarly-bg.js`, `src/js/Grammarly-check.js`

### 5. Authentication and Session Lifecycle Flow
- **Triggers**: User opening the sidepanel or trying to sign in.
- **Steps**: Intercepts `login-attempt` or `session-invalidate`, updates user status, queries auth cookies or calls `chrome.identity`, updates user model in background state, syncs user authentication across the extension.
- **APIs**: `chrome.identity`, `chrome.cookies`
- **Messages**: `login-attempt`, `session-invalidate`
- **Endpoints**: `https://auth.grammarly.com`
- **Storage Keys**: `cookie`
- **Evidence**: `src/js/Grammarly-bg.js`, `src/js/Grammarly-sidePanel.js`

### 6. Assistant Side Panel Open & Context Passing Flow
- **Triggers**: User opening the Assistant Side Panel.
- **Steps**: Invokes `alwaysAvailableAssistant.openSidePanel`, stores context data in sessionStorage `alwaysOnAssistantOnOpenData` (such as assistantSessionId and selectedText), reads context data inside Sidepanel, initializes assistant UI.
- **APIs**: `chrome.sidePanel`
- **Messages**: `agentStateChanged`, `stateUpdated`, `deeplinkRequested`
- **Endpoints**: `https://skills.grammarly.com`, `https://skills-proxy.grammarly.com`
- **Storage Keys**: `isSidePanelOpen`, `alwaysOnAssistantOnOpenData`
- **Evidence**: `src/js/Grammarly-sidePanel.js`, `src/js/AAA-initAssistant.common.chunk.js`

## Privacy, Security, and Compliance Risks

### 1. PII Exfiltration (Medium Severity)
- **Justification**: The extension intercepts typed text from input DOM fields and transmits it in real-time over WebSocket connections (`wss://capi.grammarly.com/fpws`) to Grammarly's servers for processing. This presents a high exposure risk for typed sensitive PII, passwords, or transactional details.
- **Evidence**: `src/js/Grammarly-bg.js`, `src/js/Grammarly-check.js`.

### 2. Tracking / Behavioral Surveillance (Medium Severity)
- **Justification**: Detailed client performance metrics, active webpage domains, and user-triggered event parameters are aggregated and periodically sent via `fetch` batches to Grammarly telemetry nodes (`femetrics.grammarly.io`, `f-log-extension.grammarly.io`) and third-party servers.
- **Evidence**: `src/js/Grammarly-bg.js`, `src/js/Grammarly-check.js`.

### 3. Excessive Host Permissions (Low Severity)
- **Justification**: Declares MV3 `host_permissions: ["http://*/*", "https://*/*"]`, allowing script injection and page reading across `<all_urls>` (virtually all websites). While default exclusions are set for some domains, this broad power represents an inherently high-privilege access model.
- **Evidence**: `manifest.json`.


