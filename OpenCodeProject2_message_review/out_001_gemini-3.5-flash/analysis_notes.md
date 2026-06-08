# CHROME EXTENSION REVERSE ENGINEERING ANALYSIS NOTES

**Target Extension ID:** kbfnbcaeplbcioakkpcpgfkobkghlhen
**Extension Name:** Grammarly: AI Writing Assistant and Grammar Checker App
**Model Used:** gemini-3.5-flash
**Run Number:** 001

---

## 1. MANIFEST & METADATA SUMMARY

- **Manifest Version:** 3
- **Version:** 14.1259.0
- **Description:** "Improve your writing with all-in-one assistance—including generative AI, grammar check, and more."
- **Permissions:** `scripting`, `sidePanel`, `tabs`, `notifications`, `cookies`, `identity`, `storage` (Manifest: lines 322–330)
- **Host Permissions:** `http://*/*`, `https://*/*` (Manifest: lines 315–318)
- **Optional Permissions:** `nativeMessaging`, `clipboardRead` (Manifest: lines 357–360)
- **Content Scripts:**
  - `src/js/Grammarly-check.js` (Matches `<all_urls>`, idle)
  - `src/js/Grammarly.js` (Matches specialized sites, idle)
  - `src/js/Grammarly-gDocs.js` (Matches Google Docs, idle)
  - `src/js/Grammarly-gDocsEarlyInjector.js` (Matches Google Docs, start)
  - `src/js/Grammarly-gDocsIframeCs.js` (Matches Google Docs subdomains, idle)
  - `src/js/Grammarly-overleafStartContentScript.js` (Matches Overleaf, start)
- **Background Worker:** `sw.js` (which imports `src/js/Grammarly-bg.js` via `importScripts`)

---

## 2. CHUNKS SCAN & COMPONENT MAPPING

### Background Service Worker Component
- **Source File:** `extension/src/js/Grammarly-bg.js`
- **APIs Used:** `chrome.cookies.get`, `chrome.cookies.getAll`, `chrome.cookies.set`, `chrome.cookies.remove`, `chrome.storage.managed.get`, `chrome.sidePanel.open`, `chrome.runtime.setUninstallURL`
- **Listeners Registered:** `chrome.cookies.onChanged.addListener`, `chrome.permissions.onAdded.addListener`, `chrome.runtime.onConnect.addListener`, `chrome.runtime.onMessage.addListener`
- **Key Behaviors:** Coordinates active document checking sessions; handles authentication session tracking; connects to native messaging port optionally; flushes timing metrics to telemetry endpoints.

### Content Scripts Component
- **Source Files:** `extension/src/js/Grammarly-check.js`, `extension/src/js/Grammarly.js`
- **APIs Used:** `chrome.runtime.sendMessage`, `chrome.runtime.connect`
- **Listeners Registered:** `chrome.runtime.onMessage.addListener`
- **Key Behaviors:** Watches inputs and changes in textareas or Google Docs canvas. Wraps input content and forwards it via messaging pathways. Spawns visual popup suggestion cards on top of marked sentences.

---

## 3. CORE WORKFLOWS

### Workflow 1: Onboarding and Background Startup
- **Triggers:** Extension startup, install, or worker wake-up event.
- **Ordered Steps:**
  1. Background worker wakes up and executes.
  2. Queries `sessionStorage` key `isBGInitialized` to check if this is the first start or a wake-up event.
  3. If first start, registers `bgInitFail` count and calls `chrome.runtime.setUninstallURL`.
  4. Reads managed storage policy token `GrammarlyEnrollmentToken`.
- **APIs:** `chrome.storage.session.get`, `chrome.runtime.setUninstallURL`, `chrome.storage.managed.get`
- **Storage Keys:** `isBGInitialized`, `GrammarlyEnrollmentToken`, `bgInitFail`
- **Evidence:** `src/js/Grammarly-bg.js` (Lines 11–12, 15)

### Workflow 2: CAPI Text Checking & Operational Transformation (OT)
- **Triggers:** User types text into text fields on a supported web editor.
- **Ordered Steps:**
  1. Content script DOM listeners (`MutationObserver`) capture the typing event.
  2. Text fragments and editor metadata are packaged and sent to the Inkwell engine iframe via `window.postMessage`.
  3. Inkwell establishes a WebSocket connection to `wss://capi.grammarly.com` (using CAPIClient/CAPIWebSocketTransport).
  4. Changes are submitted to the CAPI websocket using `submit_ot` deltas.
  5. Correction alerts are pushed back from CAPI via `capiWebSocketMessage`.
- **Messages:** `submit_ot`, `capiWebSocketMessage`, `start`, `remove`
- **Endpoints:** `wss://capi.grammarly.com`, `https://capi.grammarly.com`
- **Evidence:** `src/inkwell/assets/CAPIWebSocketTransport-DztTrDg1-8WOYftOV.js`, `src/inkwell/assets/index-DcswASZ2.js`

### Workflow 3: Telemetry & Client Metrics (FEMetrics)
- **Triggers:** User performs typing interactions or suggestions are accepted/ignored.
- **Ordered Steps:**
  1. Event log rates and durations are accumulated in memory.
  2. Periodically saved to session/local storage key `feMetricsData`.
  3. Alarm `feMetricsAlarms` fires or `flushFEMetrics` is triggered.
  4. Metrics payload is POSTed to `https://femetrics.grammarly.io`.
- **Endpoints:** `https://femetrics.grammarly.io`, `https://extension.femetrics.grammarly.io`
- **Storage Keys:** `feMetricsData`, `feMetricsAlarms`
- **Evidence:** `src/js/Grammarly-bg.js` (Lines 13–14)

---

## 4. PRIVACY, SECURITY, COMPLIANCE

### Privacy Analysis
- **Data categories collected:** Document Text draft, Document Revisions (via OT deltas), user session cookies, timing, error rates.
- **Purposes:** Text editing support, personalized correction suggestions, client performance diagnostics.
- **Third parties:** `https://femetrics.grammarly.io`, `https://gnar.grammarly.com`, `https://api.iterable.com`.

### Observed Privacy Data Flow Inventory
1. **Document Text draft & Revisions**
   - **Source:** User typing inside input editors on visited sites.
   - **Operation:** Stored in IndexedDB (`document_state_enc`) and transmitted over websocket to `wss://capi.grammarly.com`.
   - **Trigger:** Interactive typing.
   - **Purpose:** Core correction.
2. **Client Diagnostics (FEMetrics)**
   - **Source:** Client performance timer events.
   - **Operation:** Stored in session storage (`feMetricsData`) and POSTed to `https://femetrics.grammarly.io`.
   - **Trigger:** Periodic flush interval.
   - **Purpose:** Analytics.

### Security & Privacy Risks
1. **PII Exfiltration** (Severity: High)
   - *Justification:* Transmits user document edits and full draft text dynamically over websockets for spelling/grammar checker analysis.
   - *Evidence:* `src/js/Grammarly-bg.js` (Line 2)
2. **Tracking / Profiling** (Severity: Medium)
   - *Justification:* Logs and transmits user interaction events, writing speed details, and diagnostic parameters to telemetry server.
   - *Evidence:* `src/js/Grammarly-bg.js` (Lines 13-14)
3. **Excessive Permissions** (Severity: Medium)
   - *Justification:* Possesses host permission `<all_urls>` allowing full script injection and read capability on almost all sites visited by the user.
   - *Evidence:* `manifest.json` (Line 23–25, 315–318)

---

## 5. REJECTED HIGH/MEDIUM CENSUS CANDIDATES

The following candidates from the promoted census lists were explicitly rejected during adjudication:
- `host.userAccount.` -> **Rejected** because it is a routing prefix namespace for custom RPC event-bus objects, not a storage key.
- `ChromeMV3SessionStorageApiImpl` -> **Rejected** because it is an internal class implementation name.
- `selectAdjacentFailed` -> **Rejected** because it is an internal error callback label within query execution flows.
- `ltr` -> **Rejected** because it is a layout text-direction configuration string constant ("left-to-right").
- `sessionId` -> **Rejected** because it is part of a static string template in logging callbacks (`CAPI Connection closed (SessionId: ...)`), not an actual storage key.
- `finished` -> **Rejected** because it is an internal status state flag rather than an extension message channel.
- `MemoryLogWriter` -> **Rejected** because it is a logging utility class name.
- Sentry events (`preprocessEvent`, `beforeSendEvent`, `afterSendEvent`, `beforeEnvelope`, `beforeAddBreadcrumb`) -> **Rejected** because these are internal third-party telemetry callbacks, not extension-specific messaging channels.
