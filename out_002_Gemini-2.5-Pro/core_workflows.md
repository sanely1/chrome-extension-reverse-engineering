# Core Extension Workflows

This document outlines the core user-facing and background workflows identified during the analysis of the Grammarly Chrome Extension.

---

### 1. Core Text Checking & Suggestion Workflow

**Description**: This is the primary workflow of the extension. It involves capturing user text, sending it for analysis, receiving suggestions (alerts), and rendering them in the UI.

**Triggers**:
- User types in a monitored text field (`contenteditable`, `textarea`).
- Text changes in a monitored field.

**Steps**:
1.  **Text Capture**: The `TypingTracker` in the content script (`Grammarly.js`, `Grammarly-check.js`) captures text changes (deltas).
2.  **Local Processing & Sanitization**: The delta is sent to the Service Worker (`sw.js` / `Grammarly-bg.js`) via an RPC call (`cs-to-bg-rpc`). The Service Worker may perform initial local checks (e.g., autocorrect using the local ONNX model). The `DLP` (Data Loss Prevention) service scrubs the text for PII before it leaves the user's machine.
3.  **Remote Analysis**: The sanitized delta is sent to the `CAPI` (Client API) backend via a persistent WebSocket connection.
4.  **Receive Suggestions**: The CAPI backend streams analysis results (alerts) back to the Service Worker.
5.  **Forward to Content Script**: The Service Worker forwards the alerts to the appropriate content script.
6.  **Render Highlights**: The content script's `Highlights` service renders the alert as an underline on the page.
7.  **User Interaction**: The user hovers over or clicks the highlight.
8.  **Render Suggestion Card**: The UI framework (React) renders a suggestion card (`replacement-card`, `synonyms-card`, etc.) with details and actions, positioned by `Popper.js`.
9.  **Apply Suggestion**: The user clicks "Accept". The `ReplacementService` applies the change to the DOM, often using `document.execCommand` or `beforeinput` events.
10. **Feedback Loop**: An analytics event (`ACCEPTED`, `IGNORED`) is sent back to the Service Worker via RPC and logged to telemetry endpoints (`/logv2`, `/femetrics`).

**Key Components**:
- **Content Script**: `TypingTracker`, `CAPIProxy`, `Highlights`, `ReplacementService`, React UI components.
- **Service Worker**: `cs-to-bg-rpc` handler, `CAPI` WebSocket client, `DLP` service, `ONNX` runtime.
- **Remote**: `CAPI` WebSocket service.

**Evidence**:
- `outline.jsonl` chunks for `Grammarly.js` (TypingTracker, CAPIProxy, Rendering).
- `outline.jsonl` chunks for `Grammarly-bg.js` (CAPI client, DLP service, ONNX runtime).
- `endpoints.csv` (wss://capi.grammarly.com/freews).
- `messages.csv` (cs-to-bg-rpc).

---

### 2. User Authentication Workflow (OAuth 2.0)

**Description**: Handles user login and maintains an authenticated session.

**Triggers**:
- User clicks a "Login" button in the popup or a premium feature card.
- Extension starts and detects an expired token.

**Steps**:
1.  **Initiate Flow**: A UI action triggers the `launchAuthFlow` function in the background script.
2.  **Open Auth Tab**: The Service Worker uses `chrome.identity.launchWebAuthFlow` or `chrome.tabs.create` to open the Grammarly login page (`https://auth.grammarly.com/v4/api/oauth2/authorize`).
3.  **User Login**: The user enters credentials on the Grammarly website.
4.  **Redirect with Code**: After successful login, the page redirects back to the extension's registered redirect URL with an authorization code.
5.  **Token Exchange**: The Service Worker's OAuth client exchanges the authorization code for an access token and a refresh token by making a `POST` request to the `/oauth2/token` endpoint, using PKCE for security.
6.  **Store Tokens**: The tokens are securely stored in `chrome.storage.local` under the key `gr-oauth-key`.
7.  **Authenticated State**: The extension is now in an authenticated state. The `AuthenticatedFetch` wrapper uses the access token to make API calls.
8.  **Token Refresh**: The Service Worker sets an alarm or uses a timer to periodically use the refresh token to get a new access token before the old one expires.

**Key Components**:
- **UI**: Popup, Premium Feature Cards.
- **Service Worker**: OAuth 2.0 Client, `AuthenticatedFetch` wrapper, token storage logic.
- **Remote**: `/oauth2/authorize`, `/oauth2/token` endpoints.

**Evidence**:
- `outline.jsonl` chunks for `Grammarly-bg.js` (OAuth 2.0 client, token storage).
- `storage_keys.csv` (`gr-oauth-key`).
- `endpoints.csv` (auth.grammarly.com endpoints).

---

### 3. Configuration & Feature Gating Workflow

**Description**: On startup and periodically, the extension fetches remote configuration to control its behavior, enable/disable features, and participate in A/B tests.

**Triggers**:
- Extension installation (`runtime.onInstalled`).
- Browser startup (`runtime.onStartup`).
- Periodically via a `chrome.alarms` timer.

**Steps**:
1.  **Fetch Dynamic Config**: The Service Worker fetches `dynamicConfig.json` from a CDN (`https://config.extension.grammarly.com`). This contains general settings and feature flags.
2.  **Fetch Page Config**: It fetches `page_config.json`, which contains domain-specific rules and configurations.
3.  **Fetch Feature Gates**: The `GatesService` makes a `POST` request to `https://gates.grammarly.com/gates/get` to get a list of enabled feature flags for the user.
4.  **Fetch A/B Treatments**: The `TreatmentService` fetches experiment variations for the user from `https://treatment.grammarly.com`.
5.  **Fetch User Entitlements (Passport)**: The `PassportService` fetches the user's subscription level and feature entitlements from `https://goldengate.grammarly.com/passport`.
6.  **Cache Configuration**: All fetched configurations are cached in `chrome.storage.local` or `IndexedDB` to reduce network requests.
7.  **Apply Configuration**: The application's logic (e.g., `ExperimentClient.isGateEnabled()`) checks these cached configurations to alter UI, enable features, and change behavior dynamically without requiring an extension update.

**Key Components**:
- **Service Worker**: `PageConfigLoader`, `PassportService`, `GatesService`, `TreatmentService`, `ExperimentClient`.
- **Remote**: `config.extension.grammarly.com`, `gates.grammarly.com`, `treatment.grammarly.com`, `goldengate.grammarly.com`.

**Evidence**:
- `outline.jsonl` chunks for `Grammarly-bg.js` and `Grammarly-check.js` (ExperimentClient, service definitions).
- `endpoints.csv` (config, gates, treatment, goldengate endpoints).
- `storage_keys.csv` (keys related to experiment cache and dynamic config).

---

### 4. Telemetry & Tracking Workflow

**Description**: A comprehensive system for collecting and sending data about user interactions, performance, and errors to remote servers.

**Triggers**:
- Virtually every user interaction (clicks, hovers, typing).
- Application lifecycle events (startup, shutdown).
- Performance milestones (e.g., time to first highlight).
- Errors and exceptions.

**Steps**:
1.  **Event Trigger**: An action in the content script or service worker calls a method on the `Gnar` or `Telemetry` client (e.g., `gnar.interaction`, `telemetry.logPerformance`).
2.  **Data Collection**: The client gathers contextual information, including the event name, user identifiers, document context (domain), performance timings, and browser fingerprint data from `UAParser.js`.
3.  **Batching**: Events are not sent immediately. They are collected in an in-memory queue.
4.  **Sending Batch**: When the queue reaches a certain size or a timer elapses, the batched events are sent via a `POST` request to telemetry endpoints like `/logv2`, `/femetrics`, or Sentry for errors.
5.  **Resilient Storage**: The `Gnar` client uses a resilient storage strategy, attempting to store its unique `containerId` in both `chrome.cookies` and `localStorage` to ensure stable user identification across sessions.

**Key Components**:
- **Content Script & Service Worker**: `Gnar` client, `Telemetry` client, `UAParser.js`.
- **Remote**: `/logv2`, `/femetrics`, `/events-with-token`, `*.sentry.io`.

**Evidence**:
- `outline.jsonl` chunks for `Grammarly-bg.js` and `Grammarly.js` (revealing the massive `gnarSpecClass` and telemetry clients).
- `risks` sections in `outline.jsonl` identifying `tracking` and `fingerprinting`.
- `endpoints.csv` (f-log-extension.grammarly.io, femetrics, sentry).
- `storage_keys.csv` (`gnar_containerId`).

---

### 5. Generative AI ("Agent Platform") Workflow

**Description**: Handles interactions with Grammarly's generative AI features, like "Cheetah" and the broader "Agent Platform".

**Triggers**:
- User clicks a GenAI button (e.g., "Rewrite", "Ideate").
- User interacts with a GenAI-specific UI element.

**Steps**:
1.  **UI Interaction**: The user interacts with a GenAI feature in the content script.
2.  **RPC to Service Worker**: The content script sends an RPC message (e.g., `agent-rpc`) to the Service Worker with the prompt and context.
3.  **Dynamic Module Load**: The `Agent Platform` in the Service Worker dynamically loads the required agent module (e.g., Paraphraser, Humanizer) if it's not already loaded.
4.  **CAPI Request**: The Service Worker sends the request to the `CAPI` backend via the WebSocket connection, using a specific protocol for agent tasks.
5.  **Streamed Response**: The CAPI backend streams the generative response back to the Service Worker.
6.  **Forward to UI**: The Service Worker streams the response back to the content script.
7.  **Render Output**: The content script's React UI renders the streamed output to the user in real-time.

**Key Components**:
- **Content Script**: GenAI UI components, RPC client.
- **Service Worker**: `Agent Platform`, dynamic module loader, `CAPI` client.
- **Remote**: `CAPI` WebSocket service.

**Evidence**:
- `outline.jsonl` chunks for `Grammarly-bg.js` (Agent Platform, `La` class, dynamic imports).
- `outline.jsonl` chunks for `Grammarly.js` (Cheetah integration).
- `messages.csv` (`agent-rpc`).
