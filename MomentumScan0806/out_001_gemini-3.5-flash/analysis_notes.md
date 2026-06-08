# Reverse Engineering Analysis Notes - Momentum Extension

## Executive Overview
The Momentum Chrome extension (ID: `laookkfknpbbblfpciffpaejjkokdgca`, version `2.25.3`) is designed to replace the standard Chrome New Tab page with a beautifully crafted dashboard designed to enhance focus, tranquility, and productivity. This report provides a forensic analysis of its inner architecture, metadata, background behaviors, content script capabilities, network activity, data-handling procedures, security postures, and potential risks.

---

## Step 1: Manifest & Inventory Summary
The `manifest.json` file is a Manifest V3 compliant configuration.

### Extension Metadata
* **Name**: Momentum
* **Short Name**: Momentum
* **Version**: `2.25.3`
* **Description**: Transform your browser into a beautifully designed tab that helps you feel calm, keep focus, and stay energized.
* **Manifest Version**: `3`
* **Default Override**: Overrides `newtab` page with `index.html` (defined under `chrome_url_overrides.newtab`).

### Background Service Worker
* **Service Worker File**: `serviceWorker.js` (operates as the root background worker).

### Content Scripts
* **Content Script 1**:
  * **Matches**: `https://*.momentumdash.com/*`
  * **JS Script**: `content-scripts/momoSiteInterop.js`
  * **Run At**: `document_end`
  * **All Frames**: `true`
  * This script establishes an interoperability channel between the Momentum dashboard web portal (`momentumdash.com`) and the installed extension context.

### Web Accessible Resources
* **Resources**: `site-blocker.html`
* **Matches**: `*://*/*` (accessible on any webpage via custom iframe injections).

### Declared Permissions
* **Required Permissions**:
  * `offscreen`: Declared to instantiate offscreen documents (specifically for localStorage/WebSQL/IndexedDB bridging or migrations).
  * `unlimitedStorage`: Grants unlimited quota for local client-side databases.
  * `idle`: Allows tracking state changes in active/idle system state.
* **Optional Permissions**:
  * `bookmarks`, `tabs`, `sessions`, `topSites`, `favicon`, `scripting`, `alarms`, `notifications`, `tabGroups`, `search`
* **Optional Host Permissions**:
  * `file:///*`, `*://*/*`

---

## Step 2: Chunk-By-Chunk Analysis and Semantic Coverage

### Chunk 1: `extension/manifest.json`
* **Context Line Range**: 1 - 71
* **Analysis**: Declares the extension's structural parameters. Host permissions are optional but broad (`*://*/*`).
* **Chrome APIs**: None.
* **Endpoints**: `https://clients2.google.com/service/update2/crx` (Chrome update server).
* **Privacy/Risks**: Minimal risk on manifest alone, but broad optional permissions (`*://*/*`, `scripting`, `bookmarks`) represent high technical capabilities if activated by the user.

### Chunk 2: `extension/serviceWorker.js` [Chunk 1/3]
* **Context Line Range**: 1 - 2000
* **Analysis**: Contains utility definitions, cryptographic random value generators, base64 operations, and a robust fetch-based JSON network requester wrapper (`l()`).
* **Sinks and Dynamic Code**: Uses `atob` and base64 parsing under JWT decoder `u()`. Decoding logic parses `authenticated_user` claims to check authentication state.
* **Privacy Observations**:
  * **JWT Decoding**: JWT decoding of authentication tokens reveals active parsing of user data. Extracts claims like `authenticated_user` and caches profile elements locally.

### Chunk 3: `extension/serviceWorker.js` [Chunk 2/3]
* **Context Line Range**: 2001 - 4000
* **Analysis**: Focuses on state managers, database initialization controllers, A/B testing, and config managers. Caches various setting schemas. Includes internal class methods to manage and serialize complex focus session metrics.
* **Sinks and Dynamic Code**: Highly minified webpack/Vite bundles.
* **Privacy Observations**: Internal telemetry models keep counters of metric events locally before batched synchronization.

### Chunk 4: `extension/serviceWorker.js` [Chunk 3/3]
* **Context Line Range**: 4001 - 5360
* **Analysis**: Registers critical API listeners:
  * **Lifecycle**: `chrome.runtime.onInstalled` sets uninstall redirect URL to `https://momentumdash.com/uninstall`. It initializes the tab by opening `index.html` on first-time installation and updates.
  * **Tabs action**: `chrome.action.onClicked` / `chrome.browserAction.onClicked` opens the Momentum page.
  * **Message Listener**: Handles structured messages from content scripts and overrides.
  * **Offscreen documents**: Implements offscreen doc generation (`chrome.offscreen.createDocument`) specifically for bridging local storage state.
* **Chrome APIs Discovered**:
  * `chrome.runtime.onInstalled.addListener`
  * `chrome.runtime.setUninstallURL`
  * `chrome.tabs.create`
  * `chrome.tabs.update`
  * `chrome.tabs.get`
  * `chrome.tabs.onRemoved`
  * `chrome.tabs.onUpdated`
  * `chrome.action.onClicked`
  * `chrome.runtime.onMessage.addListener`
  * `chrome.offscreen.createDocument`
  * `chrome.runtime.getContexts`
* **Message Channels**:
  * `oneTimeLogin` (Direction: `content->background`): Facilitates passwordless login integration using temporary credentials via URL query parameters.
  * `momentum:authState` (Direction: `content->background`): Propagates login status transitions from the dashboard website to the extension backend.
  * `momentum:checkUserId` (Direction: `content->background`): Validates user UUID constraints.
  * `momentum:getUserId` (Direction: `content->background`): Direct getter for active user UUID.
  * `momentum:openNew` (Direction: `content->background`): Programmatically spawns new Momentum tabs.
  * `legacyUserMigration` (Direction: `content->background`): Coordinates offscreen request for user settings backup.
* **Storage Keys**:
  * `installDate` (local): Timestamp of first installation.
  * `authState` (local): Object storing current login status and associated user account flags.
  * `calculateUnregisteredDashboardExperiment` (local): Experiment allocation boolean.
  * `releaseUpdateModalCheck` (local): Version checker for popup alerts.
* **Privacy Observations**:
  * **User IDs**: High confidence extraction of user's account uuid via Dexie db getters and cache sync.
* **Risks**:
  * **Tracking / Uninstall Redirection**: Implements tracking of user loss (setUninstallURL) to gather uninstall telemetry.

### Chunk 5: `extension/content-scripts/momoSiteInterop.js`
* **Context Line Range**: 1 - 56
* **Analysis**: Interacts directly with `momentumdash.com` DOM.
* **Chrome APIs**: `chrome.runtime.sendMessage`, `chrome.runtime.getURL`, `chrome.runtime.getManifest`, `chrome.extension.inIncognitoContext`.
* **Listeners**: Listen to window `message` events, filtering for `momentum:*` structures.
* **Key Flows**:
  * Grabs manifest version, appends hidden inputs (`momentumPlatform`, `momentumVersion`, `momentumExtensionUserId`) into the webpage DOM body to seamlessly log users in if they are logged in on the extension side (or vice versa).
* **Privacy Observations**:
  * **User ID Injection**: Injects extension user uuid directly into the website DOM.
* **Risks**:
  * **Web-to-Extension Bridge**: Broad capability to receive window messages (`momentum:oneTimeLogin`, `momentum:authState`, `momentum:checkUserId`, `momentum:openNew`), which can update local extension state or trigger arbitrary tab redirects if abused.

### Chunk 6: `extension/content-scripts/siteBlocker.js`
* **Context Line Range**: 1 - 35
* **Analysis**: Injected content script designed for the focus site blocker functionality.
* **Chrome APIs**: `chrome.runtime.getURL`.
* **Listeners**: Handles window messages (`momentum-intervention:show`, `momentum-intervention:dismiss`) and MutationObserver hooks.
* **Key Flows**:
  * Creates a Shadow DOM containing a dialog overlay. Inside, it mounts a web-accessible iframe pointing to `/site-blocker.html`.
  * Gathers metadata (og:site_name content, title, current location host) and appends them as query parameters to the iframe blocker URL.
* **Privacy Observations**:
  * **Page Title and Host Exfiltration to Blocker page**: Active exfiltration of current location host, OpenGraph title metadata, and document title to the internal web-accessible blocker iframe.

### Chunk 7: `extension/index.html`
* **Context Line Range**: 1 - 60
* **Analysis**: Declares DOM placeholders for background assets and dashboard portals. Preloads the primary Vite module: `/assets/js/index-DJj-is5a.js`.
* **Endpoints**: Preload links to main asset files.

---

## Step 3.5: Semantic Architecture Findings

### 1. Text Capture and Focus State
* **Component**: Focus metric recorders in `assets/js` and service worker persistence layers.
* **Line Range**: `serviceWorker.js` 4932-5333
* **Finding**: Manages an internal request queue (`xhrQueue` in Dexie DB store) to serialize, batch, and upload focus metrics, todo completion stats, and active sessions.
* **Related Storage Keys**: `xhrQueue`, `feMetricsData`
* **Privacy Impact**: Local activity, productivity tracking, and timestamps are archived locally.

### 2. Authentication & Token Synchronization
* **Component**: Service worker JWT decoder & `content-scripts/momoSiteInterop.js` session sync.
* **Line Range**: `momoSiteInterop.js` 13-41, `serviceWorker.js` 32-48
* **Finding**: Establishes a seamless web-to-extension bridge to propagate identity. The content script grabs the user UUID from the extension's background DB and injects it into the website DOM. It also relays passwordless one-time tokens (`oneTimeLogin`) via window postMessage.
* **Related Messages**: `oneTimeLogin`, `momentum:getUserId`, `momentum:authState`
* **Related Storage Keys**: `authState`
* **Privacy Impact**: Exposes user authentication identifiers and JWT profiles across origin boundaries.

### 3. Telemetry and Analytics Event Queuing
* **Component**: Request Queue Manager (`self.requestQueue`).
* **Line Range**: `serviceWorker.js` 4932-5314
* **Finding**: Implements an elaborate offline queue (`xhrQueue` db) designed to save and schedule telemetry. It monitors connection state change hooks (`navigator.connection.onchange`) and triggers batch sends when the network is restored.
* **Related Endpoints**: `https://api.momentumdash.com` / related backend routes
* **Privacy Impact**: Persistent behavior logging even in offline states.

---

## Step 6: Detailed Privacy & Risk Assessment

### Privacy Data Flows
1. **User Identifier (User UUID)**: Collected automatically upon registration and cached across browser sessions. It is shared between the local background storage and the origin `momentumdash.com`.
2. **Browsing Metadata (Site Blocker Context)**: Location hostname, OpenGraph page metadata, and document page titles are captured in real-time by `siteBlocker.js` to construct custom blocking dialogue panels. This is restricted locally, passing parameters inside a web-accessible iframe.
3. **Productivity Metrics**: User todo logs, completed pomodoro events, and active focus durations are synced.

### Security and Compliance Risks
1. **Bridge Vulnerability (Medium Severity)**:
   * **Justification**: The `momoSiteInterop.js` content script listens to arbitrary `window.postMessage` events from any matching momentum origin context. It relays actions like passwordless credentials creation (`oneTimeLogin`) or programmatically updates authentication states. While restricted to `momentumdash.com`, a cross-site scripting (XSS) vulnerability on the main website could allow hostile scripts to hijack extension configurations or inject rogue login sessions.
   * **Evidence**: `extension/content-scripts/momoSiteInterop.js:18-53`
2. **Browsing context monitoring (Low Severity)**:
   * **Justification**: The focus site blocker content script extracts current page titles and OpenGraph site details to feed blockers. This represents real-time URL context harvesting, though restricted to locally rendered web-accessible iframes.
   * **Evidence**: `extension/content-scripts/siteBlocker.js:12-17`
3. **Local Storage of Auth Tokens (Low Severity)**:
   * **Justification**: User credentials, token profiles, and configurations are cached persistently within local storage databases (IndexedDB via Dexie) without obvious local cryptographic envelope encryption.
   * **Evidence**: `extension/serviceWorker.js:4854-4882`
