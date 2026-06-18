# Analysis Notes

## Manifest Summary
- **Name**: Grammarly: AI Writing Assistant and Grammar Checker App
- **Version**: 14.1259.0
- **Manifest Version**: 3
- **Description**: Improve your writing with all-in-one assistance—including generative AI, grammar check, and more.
- **Service Worker**: `sw.js`
- **Permissions**: `scripting`, `sidePanel`, `tabs`, `notifications`, `cookies`, `identity`, `storage`
- **Host Permissions**: `http://*/*`, `https://*/*`
- **Optional Permissions**: `nativeMessaging`, `clipboardRead`
- **Popup**: `src/popup.html`
- **Side Panel**: `src/sidePanel.html`
- **Externally Connectable**: `https://*.grammarly.com/*`
- **Content Security Policy (connect-src)**: Broad set of Grammarly domains including `auth.grammarly.com`, `capi.grammarly.com`, `gnar.grammarly.com`, `in.grammarly.com`, `femetrics.grammarly.io`, etc.
- **Content Scripts**:
  - `src/js/Grammarly-check.js` (matches `<all_urls>`)
  - `src/js/Grammarly.js` (matches various document/mail/social platforms, and outlook/office domains)
  - `src/js/Grammarly-gDocs.js` (matches docs.google.com)
  - `src/js/Grammarly-gDocsEarlyInjector.js` (matches docs.google.com at document_start)
  - `src/js/Grammarly-gDocsIframeCs.js` (matches docs.google.com iframe check)
  - `src/js/Grammarly-overleafStartContentScript.js` (matches overleaf.com at document_start)

## Components & Architecture
- **Background**: Managed by `sw.js` and `src/js/Grammarly-bg.js`. It maintains connections to the Grammarly server over safe WebSockets (CAPI) and acts as the central router for storage and telemetry.
- **Content Scripts**: Highly active scripts such as `Grammarly-check.js` inject checking indicators, listen to user input keystrokes, and track text mutation events inside textarea/inputs and rich text blocks.
- **UI Views**: popup menus (`src/popup.html`) and sidepanel widgets (`src/sidePanel.html`) loaded side-by-side to serve interactive correction cards.

## Core Workflows
1. **Installation & Onboarding**: Initial baseline alarm setting and onboarding telemetry trigger on extension setup.
2. **Text Correction & Editor Engine**: Listens to user inputs, forwards text fragments to background, and sends revisions over safe CAPI WebSocket wss://capi.grammarly.com/fpws.
3. **Authentication Syncing**: Watches cookies and propagates user tokens to background sw memory to manage tier levels.
4. **Configuration & Feature Flag Fetch**: Periodically queries remote gating configurations to lock/unlock experimental features.
5. **Telemetry Uploads**: Buffers metrics logs locally and schedules alarms to dispatch event records in batches to gnar.grammarly.com.
6. **SidePanel Interactions**: Open panels on user click events and display helper cards.
7. **Cross-Frame PostMessage Bridge**: Intercepts iframe events and translates them to standard background commands.

## Privacy Analysis & Data Flows
The extension intercepts user page text, active tab URL domains, credentials tokens, and system specification details.
1. **Typed Document Content**: Read from inputs, stored temporarily in IndexedDB document states, and sent to `wss://capi.grammarly.com` for analysis.
2. **Browsing URL**: Read from Tabs API, cached in session storage, and sent via telemetry logs to `gnar.grammarly.com`.
3. **User Identifiers**: Derived from auth cookies, stored in cookie storage, and verified with `auth.grammarly.com`.
4. **Browser & Device Specs**: Handshaked during connection setups.
5. **Page Metadata**: Read from page title/DOM layout properties.

## Security & Privacy Risks
1. **PII Exfiltration (Medium)**: Keystrokes/text relayed in real-time to remote endpoints. Mitigated by secure connections and password fields exclusions.
2. **Browsing tracking (Medium)**: Continuous monitoring and upload of active URLs/domain focus navigation logs.
3. **Excessive Host Permissions (Low)**: Permission to inject script on all HTTP/HTTPS visited hosts. Excludes high security URLs.
4. **Device Fingerprinting (Low)**: User agent profiling in telemetry signals.
5. **Insecure Plain-Text Cache (Low)**: plain unencrypted cache blocks in local IndexedDB stores.


