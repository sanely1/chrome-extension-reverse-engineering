# Grammarly Extension Reverse Engineering Analysis Notes

## Section 1: Overview and Analysis Scope
This document contains forensic reverse-engineering notes compiled during the static and dynamic analysis of the Grammarly Chrome extension, ID `kbfnbcaeplbcioakkpcpgfkobkghlhen`. The version analyzed is `14.1259.0` (Manifest V3).

The purpose of this analysis is to map the architectural components, network endpoints, messaging channels, local storage mechanisms, and core workflows of the extension. Additionally, we conduct a deep-dive evaluation of its privacy implications and security posture, compiling observed data flows and identifying potential risks.

---

## Section 2: Manifest and Metadata Forensic Audit
The `manifest.json` file is parsed and analyzed to establish the baseline configuration and boundaries of the extension.

*   **Metadata Information**:
    *   **Extension Name**: `Grammarly: AI Writing Assistant and Grammar Checker App`
    *   **Short Name**: `Superhuman Go (Beta)`
    *   **Version**: `14.1259.0`
    *   **Description**: Improve your writing with all-in-one assistance—including generative AI, grammar check, and more.
    *   **Manifest Version**: 3
*   **Permissions Checklist**:
    *   `scripting`: Injected scripts loaded dynamically.
    *   `sidePanel`: UI sidepanel for generative AI rewrites and suggestions.
    *   `tabs`: Querying active tab states and routing messaging.
    *   `notifications`: Showing completion status or updates.
    *   `cookies`: Custom cookie access and cross-domain tracking.
    *   `identity`: Managed Google and OAuth login integrations.
    *   `storage`: Storing settings and local state properties.
*   **Host Permissions**:
    *   `<all_urls>` / `http://*/*` / `https://*/*`: Unrestricted host network and scripting access required to run correction algorithms on arbitrary input fields across different websites.
*   **Optional Permissions**:
    *   `nativeMessaging`: Optional connection to native desktop helper apps.
    *   `clipboardRead`: Reading text from clipboard on user request.
*   **Content Security Policy (CSP)**:
    *   Extremely restrictive but permissive for registered Grammarly cloud endpoints, utilizing `connect-src` wildcard restrictions to ensure safety from injection while enabling CAPI web sockets and auth services.

---

## Section 3: Background Service Worker Analysis (sw.js / src/js/Grammarly-bg.js)
The background service worker is initialized from `sw.js`, which imports `src/js/Grammarly-bg.js` as its execution core. This script represents a heavily minified, compiled webpack bundle.

*   **CAPI WebSockets**:
    *   `wss://capi.grammarly.com/freews`: The primary connection used to stream keystrokes and document state deltas.
    *   `wss://capi.grammarly.com/gdocs`: Dedicated socket connection optimized for high-collaboration real-time editing in Google Docs.
    *   `wss://capi.grammarly.com/profile/dictionary`: Dynamic socket used to sync user personal dictionary additions and removals.
*   **Authentication and Login state**:
    *   Interacts directly with `https://auth.grammarly.com/v3` (v4/v5) to verify session profiles and retrieve tokens.
    *   Authenticates OAuth sessions using `chrome.identity`.
    *   The `GrammarlyEnrollmentToken` managed storage key is monitored to implement institution-level policy assignments.
*   **Configuration and Experiments**:
    *   Connects to Cheetah config endpoints (`https://capi.grammarly.com/api/configuration/cheetah/v1/settings`) to fetch UI capabilities (such as `inlineRewriteEnabled` or `promptStorageEnabled`).
    *   Integrates with Gates treatment engines (`https://treatment.grammarly.com`) to run A/B layouts on different groups.

---

## Section 4: Content Scripts Analysis (src/js/Grammarly-check.js / Grammarly.js)
Content scripts are injected on matches `<all_urls>` with a run-at trigger of `document_idle`.

*   **DOM Input Capturing**:
    *   The content scripts register mutation observers and input listeners on text fields (`textarea`, `contenteditable`, inputs).
    *   Extracts DOM text, selection ranges, and surrounding contexts.
    *   These text structures are packed into a local IndexedDB store (`document_state_enc` / `document_state`) to maintain persistent state.
*   **Iframe Bridges**:
    *   Registers `window.addEventListener("message")` and monitors page `window.postMessage` traffic to exchange states with injected iframes.
    *   Injects the early injector `Grammarly-gDocsEarlyInjector.js` to coordinate Canvas-based field tracking on Google Docs page structures.

---

## Section 5: UI and Generative AI Assistant Integration (src/popup.html / src/sidePanel.html / Inkwell Applet)
Grammarly coordinates several rich UI overlays to display corrections and provide generative AI suggestions.

*   **Inkwell Applet Editor**:
    *   Loaded as a web-accessible sandboxed resource from `src/inkwell/index.html`.
    *   Integrates its own modular bundler code (`src/inkwell/assets/index-DcswASZ2.js`).
    *   Initiates direct WebSocket connections `wss://capi.grammarly.com/fpws` to exchange prompts and rewrite selection states.
    *   Streams generated rewritten sentences back to the content script, which executes scripting injection to replace selected page texts.

---

## Section 6: Telemetry and Diagnostic Reporting (GNAR Tracker Spec)
A core component of the extension is the GNAR spec analytics client.

*   **Metric logging**:
    *   Utilizes alarms (`feMetricsAlarms`) to schedule periodic reporting tasks.
    *   Stores pending telemetry details inside local memory structures (`feMetricsData`).
    *   Sends interaction metrics and debug logs to telemetry endpoints: `https://data.grammarly.com`, `https://femetrics.grammarly.io`, `https://extension.femetrics.grammarly.io`.
    *   Event handlers track extension conflicts (`chromeExt/MSEditor-conflictPopup-open`) and installation triggers (`chromeExt/MSEditor-installed`).

---

## Section 7: Security Risk and Privacy Matrix Assessment

Based on the evidence collected, the following risk and privacy conclusions are drawn:

1.  **Behavioral Tracking (Tracking - Severity: Medium)**:
    *   The extension collects active tab URLs to verify if the checked site is on an exclusion match.
    *   GNAR analytics log exhaustive clicks, actions, and features loaded.
    *   *Mitigation*: Setting configurations allow disabling analytics sharing, and sensitive inputs (like password domains) are ignored.
2.  **PII Cloud Transmission (PII Exfiltration - Severity: Medium)**:
    *   Real-time spell-checking transmits written text blocks over WebSockets.
    *   These structures may contain sensitive PII if typed inside active inputs.
    *   *Mitigation*: Enterprise/school profiles implement DLP (Data Loss Prevention) rules, and local checks ignore some sensitive input types.
3.  **Local Document State Caching (Insecure Storage - Severity: Low)**:
    *   Text inputs are stored in IndexedDB (`document_state_enc`).
    *   *Mitigation*: Stored structures are protected by the browser's origin-policy sandbox and cleaned up upon session termination.
4.  **Broad Host Permissions (Excessive Permissions - Severity: Low)**:
    *   Wildcard access `<all_urls>` matches are declared.
    *   *Mitigation*: Essential capability for cross-site writing correction support.

In summary, the Grammarly extension demonstrates highly complex, robust, and well-sandboxed behaviors. While the core cloud-based spell-checking flow inherently introduces some privacy surface (real-time text and active URL exfiltration to Grammarly services), these are heavily documented, standard, and user-initiated feature mechanisms.
