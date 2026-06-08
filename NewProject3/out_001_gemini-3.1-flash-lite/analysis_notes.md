# Run 001 (gemini-3.1-flash-lite)

## Manifest

- Name: Faircado - Second hand shopping
- Version: 3.8.12
- Manifest Version: 3
- Service Worker: background.js
- Content Scripts: content.js (matches: <all_urls>)
- Permissions: contextMenus, activeTab, storage, tabs

Evidence: manifest.json:1-41

## extension/background.js [whole-file, lines 1-801]

### Summary
Service worker managing extension state, storage, messaging, and analytics.

### Chrome APIs
- chrome.tabs.onActivated (line 608)
- chrome.action (line 614)
- chrome.runtime (line 629)
- chrome.contextMenus (line 758)
- chrome.tabs.sendMessage (line 622)
- chrome.tabs.create (line 402)
- chrome.storage.local (line 153)
- chrome.storage.sync (line 154)

### Event Listeners
- chrome.tabs.onActivated.addListener (line 608)
- chrome.tabs.onUpdated.addListener (line 611)
- chrome.action.onClicked.addListener (line 614)
- chrome.runtime.onMessage.addListener (line 629)
- chrome.contextMenus.onClicked.addListener (line 758)
- chrome.runtime.onInstalled.addListener (line 776)
- chrome.runtime.onStartup.addListener (line 801)

### Messaging
- Channel: "showExtension", direction: background->content, keys: ["type", "manualExtensionOpen", "machineKey"]

### Storage
- Key: "authKey", type: local, op: get/set
- Key: "authValue", type: local, op: get/set
- Key: "machineKey", type: sync/local, op: get/set
- Key: "supportedSitesData", type: local, op: get/set

### Endpoints
- POST https://catalog-service-api.faircado.com/api/v1/supported-website (line 247)
- POST https://api.mixpanel.com/track (line 379)

### Dynamic Code/Obfuscation
- Minified variable names detected

### Risks
- Tracking: sends usage events to Mixpanel (severity: medium)

### Evidence
- extension/background.js:1-801
