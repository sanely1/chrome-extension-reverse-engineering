================================================================================
GRAMMARLY DETAILED REVERSE ENGINEERING ANALYSIS NOTES
================================================================================

This document contains deep forensic, line-level behavioral observations compiled during the
beautified source analysis of Grammarly's Chrome extension (ID: kbfnbcaeplbcioakkpcpgfkobkghlhen).

--------------------------------------------------------------------------------
1. BACKGROUND SERVICE WORKER (sw.js -> src/js/Grammarly-bg.js)
--------------------------------------------------------------------------------
The extension is built under Manifest V3 and uses 'sw.js' as its declared background service worker.
However, 'sw.js' is merely a single-line loader that pulls in 'src/js/Grammarly-bg.js' via 'importScripts()':
Evidence: C:\Users\sanel\Documents\OpenCodeProject2_SEMANTIC_CLEAN\extension\sw.js Line 1:
`importScripts('src/js/Grammarly-bg.js')`

The main background engine resides inside 'src/js/Grammarly-bg.js' (and its beautified version 'src/js/Grammarly-bg.beautified.js').
This file spans more than 90,000 lines of beautified code. It coordinates extension lifecycle, authentication,
telemetry, feature flagging, dynamic treatment, and proxies communication between injected frame scripts
and Grammarly's cloud APIs.

Key Subsystems Discovered in Grammarly-bg.js:
- **Lifecycle Wakeup & Startup Type Detection**:
  Uses sessionStorage key "isBGInitialized" to distinguish a wakeup event from a fresh start:
  - Wake-up: sessionStorage possesses "isBGInitialized" -> StartType = WakeUp
  - First-Start: sessionStorage lacks "isBGInitialized" -> sessionStorage.set({isBGInitialized: true}) -> StartType = FirstStart
  Evidence: Grammarly-bg.js Line 2 (minified block)

- **Authentication Helper (OAuth client & redirect handler)**:
  Listens for redirects from 'https://auth.grammarly.com'. Exchages oauth authorize code for tokens.
  Checks for enrollment policies via managed storage key "GrammarlyEnrollmentToken".
  Saves login success reports and manages session invalidations.

- **Dynamic Configuration & Treatment Service**:
  Periodically pulls remote configuration and A/B test experiments from:
  - 'https://treatment.grammarly.com'
  - 'https://config.extension.grammarly.com'
  - 'https://gates.grammarly.com'
  Enables or disables inline check styles, premium features, and domain-specific exemptions dynamically.

- **Telemetry and Error Tracking Service**:
  Coordinates granular usage tracking and flush metrics under class 'FEMetricsLoggerImpl'.
  Collects performance timings and buffers event counts ('feMetricsData'), structured under 'feMetricsAlarms' for flushing.
  Sends telemetry and error reports to:
  - 'https://femetrics.grammarly.io'
  - 'https://data.grammarly.com'
  - 'https://gnar.grammarly.com'
  - 'https://in.grammarly.com'
  Contains extensive Sentry crash-logging setup targeting reporting endpoint:
  - 'https://f-log-extension.grammarly.io/logv2'

- **WebSocket Connection & Text Analysis Proxy**:
  Proxies writing suggestions. Content scripts connect via chrome.runtime.onConnect.
  Background opens a live WebSocket connection ('wss://capi.grammarly.com') to transmit user typed editor text.
  Receives highlights and annotations, then relays them back to content script frames.

--------------------------------------------------------------------------------
2. CONTENT SCRIPTS (src/js/Grammarly.js & Grammarly-check.js)
--------------------------------------------------------------------------------
The content scripts run at 'document_idle' on matches declared in the manifest.
'src/js/Grammarly.js' acts as the principal content script frame interface, coordinating spelling/grammar checks on textareas, input fields, and contenteditable DOM nodes.

Key Subsystems:
- **Keystroke Input Monitoring**:
  Attaches event listeners to editor fields. Collects textual changes (deltas).
  Uses precise range update managers ('TextRangeManager') to track exact cursor indices.
  Sends these document updates to SW via message 'tab-connected'.

- **G-Button and Highlight Visual Injector**:
  Injects Grammarly's floating widget ("G-Button") and visual highlights inside a secure Shadow DOM node.
  Shadow DOM protection prevents page-level styles from corrupting visual correction layouts.

- **Google Docs Canvas Integration ('Grammarly-gDocs.js')**:
  Since Google Docs renders using canvas elements rather than normal DOM input text, normal text capture would fail.
  Grammarly incorporates a specialized Early Injector ('Grammarly-gDocsEarlyInjector.js') and Canvas Injected content scripts ('Grammarly-gDocsCanvasInjectedCs.js')
  to hook into Google Docs' internal text buffers, maintaining accurate synchronization.

--------------------------------------------------------------------------------
3. PRIVACY OBSERVATIONS & COMPLIANCE
--------------------------------------------------------------------------------
- **Sensitive Fields Avoidance**:
  Includes DLP masking heuristics to actively bypass password fields, card numbers, and inputs marked as autocomplete="off" or possessing confidential attributes.
  Maintains domain-level blocklists (e.g. docs.google.com exclusions except document folders) to prevent unauthorized exfiltration.
- **Remote Data Flow**:
  Active document text and edits are streamed to Grammarly remote cloud APIs (wss://capi.grammarly.com) for spelling and ML grammar processing.
  This transmission is fundamental to the extension's spelling features but presents PII leakage risks if sensitive data is captured.

--------------------------------------------------------------------------------
4. RISK ASSESSMENT SUMMARY
--------------------------------------------------------------------------------
- **High Severity: PII Exfiltration over WebSocket**:
  Typed user content is actively captured and transmitted over the network.
  Mitigated by input field exclusions and DLP masking, but high threat profile due to scale.
- **Medium Severity: Remote Gating & Config Changes**:
  Extension capabilities and local script triggers can be changed remotely via A/B gates from 'treatment.grammarly.com'.
- **Medium Severity: Behavioral Telemetry Profiling**:
  Tracks granular interface clicks, features used, and timing stats, establishing comprehensive usage footprint.
