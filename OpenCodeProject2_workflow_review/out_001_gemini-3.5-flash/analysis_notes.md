# Run 001 (gemini-3.5-flash)

## Manifest

- Name: Grammarly: AI Writing Assistant and Grammar Checker App
- Version: 14.1259.0
- Manifest Version: 3
- Service Worker: sw.js
- Content Scripts: 
  - src/js/Grammarly-check.js (matches: <all_urls> with exclusions)
  - src/js/Grammarly.js (matches: specific domains like Atlassian, Gmail, Quora, etc.)
  - src/js/Grammarly-gDocs.js (matches: *://docs.google.com/document/*)
  - src/js/Grammarly-gDocsEarlyInjector.js (matches: *://docs.google.com/document/*)
  - src/js/Grammarly-gDocsIframeCs.js (matches: *://docs.google.com/*)
  - src/js/Grammarly-overleafStartContentScript.js (matches: https://*.overleaf.com/*)
- Permissions: scripting, sidePanel, tabs, notifications, cookies, identity, storage
- Host Permissions: http://*/*, https://*/*

Evidence: manifest.json:1-365

## Background Service Worker API & Listener Analysis

The service worker `sw.js` imports `src/js/Grammarly-bg.js`, which serves as the core background logic coordinator.
Programmatic extraction shows active usage of the following APIs and listeners in `Grammarly-bg.js`:
- `chrome.runtime.onMessage.addListener`
- `chrome.runtime.onConnect.addListener`
- `chrome.cookies.onChanged.addListener`
- `chrome.permissions.onAdded.addListener`
- `chrome.permissions.onRemoved.addListener`
- `chrome.sidePanel.setOptions`
- `chrome.sidePanel.setPanelBehavior`
- `chrome.cookies.get`, `chrome.cookies.set`, `chrome.cookies.remove`
- `chrome.storage.local`, `chrome.storage.managed`, `chrome.storage.session`, `chrome.storage.sync`
- `chrome.identity`
- `chrome.tabs.query`, `chrome.tabs.sendMessage`, `chrome.tabs.create`, `chrome.tabs.update`

## Content Script Analysis

Content scripts inject writing assistance UI and monitor text changes in editable DOM nodes.
Exhaustive scan shows that the main content script (`Grammarly-check.js`) actively uses:
- `chrome.runtime.sendMessage` and `chrome.runtime.onMessage.addListener`
- DOM listeners for typing, focus, blur, and input events
- MutationObservers to detect dynamic DOM edits and input fields
- Communication with Google Docs via injected IFrames and canvas helpers (`Grammarly-gDocsIframeCs.js`)

## Census Findings

- **Endpoints**: Extracted 491 unique endpoints. Telemetry and cloud API endpoints are heavily focused on `*.grammarly.com`, `*.grammarly.io`, `*.grammarly.net`, and cloudfront subdomains.
- **Messages**: Reconciled 174 confirmed message channels/RPC pathways.
- **Storage Keys**: Adjudicated 15 confirmed storage keys including `isSidePanelOpen`, `alwaysOnAssistantOnOpenData`, `feMetricsAlarms`, `feMetricsData`, and `GrammarlyEnrollmentToken`.
