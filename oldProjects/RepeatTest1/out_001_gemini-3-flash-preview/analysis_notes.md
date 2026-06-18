# Run 001 (gemini-3-flash-preview)

## Manifest

- Name: Faircado - Second hand shopping
- Version: 3.8.12
- Manifest Version: 3
- Service Worker: background.js
- Content Scripts: content.js (matches: https://*/*)
- Permissions: contextMenus, activeTab, storage, tabs
- Host Permissions: None (explicitly listed in matches for content scripts)

Evidence: manifest.json:1-41
_locales/en/messages.json:1-8

## background.js [whole-file, lines 1-903]

### Summary
Service worker handling extension lifecycle, messaging, and API interactions. It manages authentication, supported website checks, A/B testing, and tracking.

### Chrome APIs
- chrome.tabs.create
- chrome.tabs.onActivated
- chrome.tabs.onUpdated
- chrome.tabs.sendMessage
- chrome.runtime.getURL
- chrome.runtime.sendMessage
- chrome.runtime.onMessage
- chrome.runtime.onInstalled
- chrome.runtime.onStartup
- chrome.runtime.setUninstallURL
- chrome.storage.local/sync/session
- chrome.contextMenus.create/onClicked
- chrome.action.setIcon/onClicked/setPopup

### Event Listeners
- tabs.onActivated
- tabs.onUpdated
- action.onClicked
- runtime.onMessage
- contextMenus.onClicked
- runtime.onInstalled
- runtime.onStartup

### Messaging
- Channels: showExtension, init, login, logout, error, mixpanel, hasResult, noResult, isSupportedWebsite, GetHeuristicData, IsActivated, GetAbTestsConfig, GetExtensionConfig, SetItemToSessionStorage, GetItemFromSessionStorage, RemoveItemFromSessionStorage, ClearDataFromSessionStorage, GetMachineKey, setAuth, clearAuth

### Storage
- Keys: authKey, authValue, machineKey, supportedSitesData, isProductPageHeuristicsData, abTestsCachedConfig, extensionCachedConfig, abTestVariantRecords, activated, userSettings

### Endpoints
- POST https://catalog-service-api.faircado.com/api/v1/supported-website
- GET https://cms-api.faircado.com/api/supported-websites/list
- GET https://cms-api.faircado.com/api/is-product-page-heuristic
- GET https://cms-api.faircado.com/api/extension-ab-tests/list
- GET https://cms-api.faircado.com/api/extension-config
- POST https://api.mixpanel.com/track
- POST https://api.mixpanel.com/engage#profile-batch-update
- GET https://extension-v3-8.faircado.com/uninstall

### Risks
- Tracking: Mixpanel event tracking and profile updates including machine key.
- PII Exfiltration: Sends machine key (UUID) to multiple internal and external APIs.

### Evidence
- background.js:1-903

