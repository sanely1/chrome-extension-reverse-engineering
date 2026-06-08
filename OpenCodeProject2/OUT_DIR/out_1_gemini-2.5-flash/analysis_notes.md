
## Core Workflows

### 1. Extension Installation/Update & Onboarding Flow
- **Triggers**: `chrome.runtime.onInstalled` event.
- **Steps**:
    - On `install` reason: Generate/retrieve `machineKey`, set uninstall URL with `machineKey`, create "Search this image on faircado" context menu, set up A/B test variants, track "extension_installed_background" Mixpanel event, open an onboarding tab (either `after-extension-install-versioned` or `extension-to-website-onboarding` with `machineKey`). For Firefox, it opens `data-control.html`.
    - On `update` reason: Track "extension_updated_on" Mixpanel user profile update.
- **APIs**: `chrome.runtime.onInstalled`, `chrome.runtime.setUninstallURL`, `chrome.contextMenus.create`, `chrome.tabs.create`, `getMachineKey()`, `setupAbTestVariants()`, `trackEvent()`, `mixpanelUserProfile()`, `getAfterExtensionInstallUrl()`.
- **Messages**: `mixpanel` (implicitly via `trackEvent` and `mixpanelUserProfile`).
- **Endpoints**: `https://extension-v3-8.faircado.com/uninstall`, `https://faircado.com/after-extension-install-versioned?v=3-8`, `https://faircado.com/extension-to-website-onboarding`, `https://api.mixpanel.com/track`, `https://api.mixpanel.com/engage#profile-batch-update`.
- **Storage Keys**: `machineKey`, `abTestVariantRecords`.
- **Evidence**: `extension/background.js` (lines 746-766, 552-562, 529-539, 829-854, 197-227).

### 2. Website Support Check / Product Page Heuristics Flow
- **Triggers**: `chrome.runtime.onMessage` with `messageTypes.isSupportedWebsite` (from content script), `chrome.runtime.onStartup` (for supported sites data refresh).
- **Steps**:
    - Receive `isSupportedWebsite` message with current `url`.
    - Check cached `supportedSitesData`. If expired or not found, fetch from `cms-api.faircado.com/api/supported-websites/list`.
    - If `supportedSitesData` is not found (status 404), fallback to `catalog-service-api.faircado.com/api/v1/supported-website` with `url` and `X-Machine-Key`.
    - Find site data based on `url` and respond to content script with `isSupported`, `parameters`, `isEnabled`, `isMetadataAllowed`.
    - On `GetHeuristicData` message, fetch product page heuristics from `cms-api.faircado.com/api/is-product-page-heuristic` and cache it.
- **APIs**: `retrieveSupportedSitesData()`, `fetchIsSupportedWebsite()`, `getIsProductPageHeuristicsData()`, `getCachedApiData()`, `fetch()`, `storage.getItem()`, `storage.setItem()`.
- **Messages**: `isSupportedWebsite` (content->background), `GetHeuristicData` (content->background).
- **Endpoints**: `https://catalog-service-api.faircado.com/api/v1/supported-website`, `https://cms-api.faircado.com/api/supported-websites/list`, `https://cms-api.faircado.com/api/is-product-page-heuristic`.
- **Storage Keys**: `supportedSitesData`, `isProductPageHeuristicsData`, `machineKey`.
- **Evidence**: `extension/background.js` (lines 231-249, 251-337, 188-193, 661-684, 686-691, 150-185).

### 3. Authentication and Session Management Flow
- **Triggers**: `chrome.runtime.onMessage` with `messageTypes.login` or `messageTypes.logout`.
- **Steps**:
    - On `login` message: Store `authKey` and `authValue` in `localStorage` or `chrome.storage.sync`. Distribute these credentials to all open tabs via `chrome.tabs.sendMessage` with `messageTypes.setAuth`.
    - On `logout` message: Clear `authKey` and `authValue` from storage. Distribute `clearAuth` message to all open tabs.
    - On `init` message (from popup/content script): Retrieve `authKey`, `authValue`, and `machineKey` from storage and send back to the caller.
- **APIs**: `storeAuthData()`, `getAuthData()`, `clearAuthData()`, `chrome.tabs.sendMessage()`, `chrome.tabs.query()`, `localStorage.setItem()`, `localStorage.removeItem()`, `syncStorage.setItem()`, `syncStorage.removeItem()`, `syncStorage.getItem()`.
- **Messages**: `login` (content->background), `logout` (content->background), `init` (content/popup->background), `setAuth` (background->content), `clearAuth` (background->content).
- **Endpoints**: None directly.
- **Storage Keys**: `authKey`, `authValue`, `machineKey`.
- **Evidence**: `extension/background.js` (lines 614-623, 606-613, 768-786, 791-828).

### 4. Analytics and Error Reporting Flow
- **Triggers**: `chrome.runtime.onMessage` with `messageTypes.error` or `messageTypes.mixpanel`, extension `onInstalled` (for install/update events).
- **Steps**:
    - Receive `error` message with `detail`, `message`, `url`. Track as Mixpanel event.
    - Receive `mixpanel` message with `eventName`, `payload`. Track as custom Mixpanel event.
    - On `install` or `update`, track specific Mixpanel events or update user profile.
- **APIs**: `trackEvent()`, `mixpanelEventTrack()`, `mixpanelUserProfile()`, `fetch()`, `getMachineKey()`, `getBrowser()`.
- **Messages**: `error` (content->background), `mixpanel` (content->background).
- **Endpoints**: `https://api.mixpanel.com/track`, `https://api.mixpanel.com/engage#profile-batch-update`.
- **Storage Keys**: `machineKey`.
- **Evidence**: `extension/background.js` (lines 358-381, 556-560, 625-643, 762-764, 829-854).

### 5. A/B Testing and Configuration Flow
- **Triggers**: `InternalMessageTypes.GetAbTestsConfig` (from content scripts/data-control page), `InternalMessageTypes.GetExtensionConfig` (from content scripts/data-control page), `runAfterExtensionInstall()`.
- **Steps**:
    - On `GetAbTestsConfig` message: Fetch A/B tests configuration from `cms-api.faircado.com/api/extension-ab-tests/list` and cache it.
    - On `GetExtensionConfig` message: Fetch extension configuration from `cms-api.faircado.com/api/extension-config` and cache it.
    - Assign A/B test variants if not already assigned, store in `abTestVariantRecords`.
- **APIs**: `fetchAbTestsConfig()`, `fetchExtensionConfig()`, `getAbTestsConfig()`, `setupAbTestVariants()`, `isTestAndVariantEnabled()`, `getCachedApiData()`, `storage.getItem()`, `storage.setItem()`.
- **Messages**: `GetAbTestsConfig` (content->background), `GetExtensionConfig` (content->background).
- **Endpoints**: `https://cms-api.faircado.com/api/extension-ab-tests/list`, `https://cms-api.faircado.com/api/extension-config`.
- **Storage Keys**: `abTestsCachedConfig`, `extensionCachedConfig`, `abTestVariantRecords`.
- **Evidence**: `extension/background.js` (lines 432-436, 440-444, 459-527, 696-705, 150-185), `extension/data-control.js` (lines 211-216, 219-279).

### 6. Image Search / Processing Flow
- **Triggers**: `chrome.contextMenus.onClicked` for `MediaTypes.SearchImage`, or potentially a message from content script.
- **Steps**:
    - User right-clicks an image and selects "Search this image on faircado" context menu.
    - `contextMenuItemClickHandler` in `background.js` is triggered.
    - `getAuthData()` is called to retrieve `machineKey`.
    - `chrome.tabs.sendMessage` sends `messageTypes.showExtension` to the active tab's content script, including `machineKey`, `imageUrl`, `manualImageSearch`, and `info`.
    - The content script (implicitly) passes the image URL to the `Image Processing Iframe (save.html + save.js)`.
    - The `ImageIframe` loads the image, resizes it, converts it to Base64, and sends the `imgUrl` and `imgData` back to the content script.
- **APIs**: `chrome.contextMenus.onClicked`, `chrome.tabs.sendMessage`, `getAuthData()`.
- **Messages**: `showExtension` (background->content, with `imageUrl`), `window.postMessage` (between content script and iframe).
- **Endpoints**: The `imageUrl` itself (dynamic).
- **Storage Keys**: `machineKey`, `authKey`, `authValue`.
- **Evidence**: `extension/background.js` (lines 729-745, 597-601), `extension/save.js` (lines 18-59).

### 7. Navigation Monitoring (SPA Compatibility) Flow
- **Triggers**: Browser history changes (`history.pushState`, `history.replaceState`, `window.popstate`).
- **Steps**:
    - The `navigation-events.js` script (injected into web pages) intercepts these history changes.
    - It sends a `window.postMessage` to the host page, notifying it of the navigation event type.
- **APIs**: `history.pushState` (overridden), `history.replaceState` (overridden), `window.addEventListener('popstate')`, `window.postMessage`.
- **Messages**: `window.postMessage` (injected script->page, with `source`, `type`).
- **Endpoints**: None directly.
- **Storage Keys**: None.
- **Evidence**: `extension/navigation-events.js` (lines 3-22).

### 8. Extension Icon and Popup Control Flow
- **Triggers**: `chrome.tabs.onActivated`, `chrome.tabs.onUpdated`, `chrome.action.onClicked`.
- **Steps**:
    - On tab activation or update: `setPopupAction()` is called, which determines if the current URL is an `http(s)` URL and sets the popup to `popup.html` or an empty string accordingly.
    - On `hasResult` or `noResult` message: `setIcon()` is called to change the extension icon to green/snoozed green or white.
    - On `init` message (from popup): `setIcon()` is called to set the icon to green.
- **APIs**: `chrome.tabs.onActivated`, `chrome.tabs.onUpdated`, `chrome.action.onClicked`, `chrome.action.setIcon`, `chrome.action.setPopup`, `chrome.tabs.query`.
- **Messages**: `hasResult` (content->background), `noResult` (content->background), `init` (popup->background).
- **Endpoints**: None directly.
- **Storage Keys**: None.
- **Evidence**: `extension/background.js` (lines 583-588, 595-596, 606-613, 645-660, 863-871, 788-789).
